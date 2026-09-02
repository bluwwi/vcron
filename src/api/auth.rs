use axum::extract::{Request, State};
use axum::http::StatusCode;
use axum::middleware::Next;
use axum::response::Response;
use axum::Extension;
use axum::Json;
use axum_extra::extract::CookieJar;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

use crate::db::models::{AuthResponse, LoginInput, RegisterInput, User};
use crate::db::queries;
use crate::error::{AppError, AppResult};
use crate::AppState;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub username: String,
    pub exp: usize,
}

pub fn make_token(user_id: &str, username: &str, secret: &str) -> Result<String, AppError> {
    let exp = (Utc::now() + Duration::days(7)).timestamp() as usize;
    let claims = Claims {
        sub: user_id.to_string(),
        username: username.to_string(),
        exp,
    };
    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret.as_bytes()))
        .map_err(|e| AppError::Internal(format!("failed to create token: {e}")))
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| AppError::Unauthorized("invalid or expired token".into()))?;
    Ok(token_data.claims)
}

const COOKIE_NAME: &str = "vcron_token";

pub async fn auth_middleware(
    State(state): State<AppState>,
    jar: CookieJar,
    req: Request,
    next: Next,
) -> Result<(CookieJar, Response), (StatusCode, Json<serde_json::Value>)> {
    let token = jar
        .get(COOKIE_NAME)
        .map(|c| c.value().to_string());

    let token = match token {
        Some(t) => t,
        None => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(serde_json::json!({ "error": "not authenticated" })),
            ));
        }
    };

    match verify_token(&token, &state.config.jwt_secret) {
        Ok(claims) => {
            let req = req;
            let (mut parts, body) = req.into_parts();
            parts.extensions.insert(claims);
            let req = Request::from_parts(parts, body);
            Ok((jar, next.run(req).await))
        }
        Err(_) => Err((
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({ "error": "invalid or expired session" })),
        )),
    }
}

pub fn get_current_user(req: &Request) -> Option<Claims> {
    req.extensions().get::<Claims>().cloned()
}

pub async fn register(
    State(state): State<AppState>,
    Json(input): Json<RegisterInput>,
) -> AppResult<(StatusCode, CookieJar, Json<AuthResponse>)> {
    let username = input.username.trim();
    if username.len() < 3 {
        return Err(AppError::Validation("username must be at least 3 characters".into()));
    }
    if username.len() > 30 {
        return Err(AppError::Validation("username must be at most 30 characters".into()));
    }
    if input.password.len() < 6 {
        return Err(AppError::Validation("password must be at least 6 characters".into()));
    }

    if queries::get_user_by_username(&state.db, username).await.is_ok() {
        return Err(AppError::Conflict("username already taken".into()));
    }

    let id = uuid::Uuid::new_v4();
    let password_hash =
        bcrypt::hash(&input.password, 10).map_err(|e| AppError::Internal(format!("hash failed: {e}")))?;

    let user = queries::create_user(&state.db, id, username, &password_hash)
        .await
        .map_err(AppError::Database)?;

    let token = make_token(&user.id, &user.username, &state.config.jwt_secret)?;

    let cookie = axum_extra::extract::cookie::Cookie::build((COOKIE_NAME, token.clone()))
        .path("/")
        .http_only(true)
        .max_age(time::Duration::days(7))
        .same_site(axum_extra::extract::cookie::SameSite::Lax)
        .build();

    let jar = CookieJar::new().add(cookie);

    Ok((StatusCode::CREATED, jar, Json(AuthResponse { user, token })))
}

pub async fn login(
    State(state): State<AppState>,
    Json(input): Json<LoginInput>,
) -> AppResult<(CookieJar, Json<AuthResponse>)> {
    let user = queries::get_user_by_username(&state.db, input.username.trim())
        .await
        .map_err(|_| AppError::Unauthorized("invalid username or password".into()))?;

    let valid = bcrypt::verify(&input.password, &user.password_hash)
        .map_err(|e| AppError::Internal(format!("verify failed: {e}")))?;

    if !valid {
        return Err(AppError::Unauthorized("invalid username or password".into()));
    }

    let token = make_token(&user.id, &user.username, &state.config.jwt_secret)?;

    let cookie = axum_extra::extract::cookie::Cookie::build((COOKIE_NAME, token.clone()))
        .path("/")
        .http_only(true)
        .max_age(time::Duration::days(7))
        .same_site(axum_extra::extract::cookie::SameSite::Lax)
        .build();

    let jar = CookieJar::new().add(cookie);

    Ok((jar, Json(AuthResponse { user, token })))
}

pub async fn logout() -> (CookieJar, StatusCode) {
    let cookie = axum_extra::extract::cookie::Cookie::build((COOKIE_NAME, ""))
        .path("/")
        .http_only(true)
        .max_age(time::Duration::seconds(0))
        .build();
    let jar = CookieJar::new().add(cookie);
    (jar, StatusCode::NO_CONTENT)
}

pub async fn me(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> AppResult<Json<User>> {
    let user = queries::get_user_by_id(&state.db, &claims.sub)
        .await
        .map_err(AppError::Database)?;
    Ok(Json(user))
}

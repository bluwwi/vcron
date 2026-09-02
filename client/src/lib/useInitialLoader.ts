"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vcron_loaded";

/**
 * Shows the pixel loader only on the first page visit per browser session.
 * Uses sessionStorage so navigating between pages after the first load
 * never re-triggers the loader.
 */
export function useInitialLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const already = sessionStorage.getItem(STORAGE_KEY);
    if (!already) {
      setShow(true);
    }
  }, []);

  function complete() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  }

  return { show, complete };
}

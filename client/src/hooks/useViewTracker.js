import { useEffect, useRef } from "react";
import { viewsApi } from "../services/api";
import { useApp } from "../context/AppContext";

/**
 * Hook to securely track views.
 * Will only trigger once per component mount after a 5 second delay,
 * and only if the document is visible.
 *
 * @param {string} contentType - "post", "resource", "question", "book"
 * @param {number|string} contentId - The ID of the content
 */
export const useViewTracker = (contentType, contentId) => {
  const hasTracked = useRef(false);
  const { incrementLocalViews } = useApp();

  useEffect(() => {
    if (!contentId || hasTracked.current) return;

    let timeoutId;

    const trackView = async () => {
      if (document.visibilityState === "visible" && !hasTracked.current) {
        hasTracked.current = true;
        try {
          const res = await viewsApi.recordView(contentType, contentId);
          // If a new view was recorded, optimistically update UI
          if (res?.data?.recorded) {
            incrementLocalViews(contentType, contentId);
          }
        } catch (err) {
          // Silent catch for analytics
          console.error("Failed to record view", err);
        }
      }
    };

    const startTimer = () => {
      clearTimeout(timeoutId);
      if (!hasTracked.current && document.visibilityState === "visible") {
        timeoutId = setTimeout(trackView, 5000);
      }
    };

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startTimer();
      } else {
        clearTimeout(timeoutId);
      }
    };

    // Start timer on mount
    startTimer();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [contentType, contentId, incrementLocalViews]);
};

import { useHapticFeedback } from "@telegram-apps/sdk-react";
import { useCallback } from "react";

export function useHaptics() {
  const haptic = useHapticFeedback(true);

  const impactHeavy = useCallback(() => {
    try {
      if (haptic && haptic.supports('impact')) haptic.impactOccurred('heavy');
    } catch (e) {
      // Ignore errors in unsupported environments
    }
  }, [haptic]);

  const impactLight = useCallback(() => {
    try {
      if (haptic && haptic.supports('impact')) haptic.impactOccurred('light');
    } catch (e) {
      // Ignore errors
    }
  }, [haptic]);

  const notificationSuccess = useCallback(() => {
    try {
      if (haptic && haptic.supports('notification')) haptic.notificationOccurred('success');
    } catch (e) {
      // Ignore errors
    }
  }, [haptic]);

  return { impactHeavy, impactLight, notificationSuccess };
}

import { useCallback } from "react";

export function useHaptics() {
  const getHaptic = () => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.HapticFeedback) {
      return (window as any).Telegram.WebApp.HapticFeedback;
    }
    return null;
  };

  const impactHeavy = useCallback(() => {
    try {
      const haptic = getHaptic();
      if (haptic && haptic.impactOccurred) haptic.impactOccurred('heavy');
    } catch (e) {
      // Ignore errors in unsupported environments
    }
  }, []);

  const impactLight = useCallback(() => {
    try {
      const haptic = getHaptic();
      if (haptic && haptic.impactOccurred) haptic.impactOccurred('light');
    } catch (e) {
      // Ignore errors
    }
  }, []);

  const notificationSuccess = useCallback(() => {
    try {
      const haptic = getHaptic();
      if (haptic && haptic.notificationOccurred) haptic.notificationOccurred('success');
    } catch (e) {
      // Ignore errors
    }
  }, []);

  return { impactHeavy, impactLight, notificationSuccess };
}

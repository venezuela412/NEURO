import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import clsx from "clsx";
import { useHaptics } from "../../hooks/useHaptics";

export interface PremiumButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "glass" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  hapticFeedback?: "light" | "heavy" | "success" | "none";
  fullWidth?: boolean;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      hapticFeedback = "light",
      fullWidth = false,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const { impactLight, impactHeavy, notificationSuccess } = useHaptics();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (disabled) return;

      if (hapticFeedback === "light") impactLight();
      else if (hapticFeedback === "heavy") impactHeavy();
      else if (hapticFeedback === "success") notificationSuccess();

      if (onClick) onClick(e);
    };

    const variantStyles = {
      primary: "bg-gradient-to-br from-[var(--accent)] to-[#6d55ff] text-white shadow-[0_16px_36px_rgba(143,115,255,0.32)] border-transparent",
      secondary: "bg-white/5 border-[var(--border)] text-[var(--text)] hover:bg-white/10",
      glass: "bg-white/5 backdrop-blur-xl border-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:bg-white/10",
      danger: "bg-gradient-to-br from-[var(--danger)] to-red-600 text-white shadow-[0_12px_24px_rgba(255,90,90,0.2)] border-transparent",
      ghost: "bg-transparent border-transparent text-[var(--text-soft)] hover:text-[var(--text)] hover:bg-white/5",
    };

    const sizeStyles = {
      sm: "h-9 px-4 text-sm rounded-[12px]",
      md: "min-h-[46px] px-5 text-base font-semibold rounded-[16px]",
      lg: "min-h-[54px] px-6 text-lg font-bold rounded-[20px]",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        whileHover={{ y: disabled ? 0 : -1 }}
        onClick={handleClick}
        disabled={disabled}
        className={clsx(
          "inline-flex items-center justify-center gap-2 transition-colors",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          disabled && "opacity-50 cursor-not-allowed filter-grayscale saturate-50",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";

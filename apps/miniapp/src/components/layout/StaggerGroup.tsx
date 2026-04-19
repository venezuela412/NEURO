import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode, forwardRef } from "react";
import clsx from "clsx";

interface StaggerGroupProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  fast?: boolean;
}

const staggerContainer = (staggerDelay: number = 0.05, fast: boolean = false) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: fast ? 0 : 0.1,
    },
  },
});

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
};

export const StaggerGroup = forwardRef<HTMLDivElement, StaggerGroupProps>(
  ({ children, className, staggerDelay = 0.05, fast = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={staggerContainer(staggerDelay, fast)}
        initial="hidden"
        animate="show"
        className={clsx("flex flex-col w-full", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerGroup.displayName = "StaggerGroup";

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={itemVariants}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerItem.displayName = "StaggerItem";

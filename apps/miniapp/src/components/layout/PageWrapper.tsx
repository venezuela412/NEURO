import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode, forwardRef } from "react";
import clsx from "clsx";

export interface PageWrapperProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 15,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -10,
  },
};

export const PageWrapper = forwardRef<HTMLDivElement, PageWrapperProps>(
  ({ children, className, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: delay,
        }}
        className={clsx("w-full h-full flex flex-col", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

PageWrapper.displayName = "PageWrapper";

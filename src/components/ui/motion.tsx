"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MotionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delayMs?: number;
  durationMs?: number;
  className?: string;
}

export function Fade({ children, delayMs = 0, durationMs = 300, className, ...props }: MotionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <div
      className={cn("transition-opacity ease-out", className)}
      style={{
        opacity: mounted ? 1 : 0,
        transitionDuration: `${durationMs}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Reveal({
  children,
  delayMs = 0,
  durationMs = 350,
  className,
  ...props
}: MotionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <div
      className={cn("transition-all ease-out", className)}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Slide({
  children,
  direction = "up",
  delayMs = 0,
  durationMs = 350,
  className,
  ...props
}: MotionProps & { direction?: "up" | "down" | "left" | "right" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const getTransform = () => {
    if (mounted) return "translate(0, 0)";
    switch (direction) {
      case "up":
        return "translateY(16px)";
      case "down":
        return "translateY(-16px)";
      case "left":
        return "translateX(16px)";
      case "right":
        return "translateX(-16px)";
    }
  };

  return (
    <div
      className={cn("transition-all ease-out", className)}
      style={{
        opacity: mounted ? 1 : 0,
        transform: getTransform(),
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Scale({
  children,
  delayMs = 0,
  durationMs = 300,
  className,
  ...props
}: MotionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <div
      className={cn("transition-all ease-out", className)}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "scale(1)" : "scale(0.97)",
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function BlurReveal({
  children,
  delayMs = 0,
  durationMs = 400,
  className,
  ...props
}: MotionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <div
      className={cn("transition-all ease-out", className)}
      style={{
        opacity: mounted ? 1 : 0,
        filter: mounted ? "blur(0px)" : "blur(8px)",
        transform: mounted ? "translateY(0)" : "translateY(6px)",
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Stagger({
  children,
  staggerMs = 60,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  staggerMs?: number;
}) {
  const items = React.Children.toArray(children);

  return (
    <div className={className} {...props}>
      {items.map((child, index) => (
        <Reveal key={index} delayMs={index * staggerMs}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}

export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
}

export function PanelTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("animate-slide-up", className)}>
      {children}
    </div>
  );
}

export function StickyScene({
  children,
  className,
  topOffset = 72,
}: {
  children: React.ReactNode;
  className?: string;
  topOffset?: number;
}) {
  return (
    <div
      className={cn("sticky", className)}
      style={{ top: `${topOffset}px` }}
    >
      {children}
    </div>
  );
}

export function Crossfade({
  activeKey,
  children,
  className,
}: {
  activeKey: string | number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div key={activeKey} className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
}

export function SharedElement({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("transition-transform duration-200", className)}>{children}</div>;
}

export function Parallax({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  return <div className={cn("will-change-transform", className)}>{children}</div>;
}

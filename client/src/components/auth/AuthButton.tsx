"use client";

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface AuthButtonProps {
  isLoading: boolean;
  loadingText?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success";
}

export function AuthButton({
  isLoading,
  loadingText = "Loading...",
  children,
  className = "",
  onClick,
  type = "submit",
  variant = "success",
}: AuthButtonProps) {
  return (
    <Button type={type} className={`w-full ${className}`} disabled={isLoading} variant={variant} onClick={onClick}>
      {isLoading ? loadingText : children}
    </Button>
  );
}

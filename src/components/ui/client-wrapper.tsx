"use client";

import React from "react";

interface ClientWrapperProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function ClientWrapper({ children, onClick }: ClientWrapperProps) {
  return <div onClick={onClick}>{children}</div>;
}

import * as React from "react";

interface TestimonialsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function TestimonialsLayout({
  children
}: TestimonialsLayoutProps) {
  return <>{children}</>;
}

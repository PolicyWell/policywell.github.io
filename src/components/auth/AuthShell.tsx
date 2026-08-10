import { BrandMark } from "@/components/ui";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="pw-shell py-8">
        <BrandMark />
      </div>
      <main className="pw-shell flex-1 flex items-center pb-16">
        <div className="w-full max-w-md animate-rise">
          <h1 className="font-display text-4xl text-pine mb-3">{title}</h1>
          {description ? (
            <p className="text-stone mb-8">{description}</p>
          ) : (
            <div className="mb-8" />
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

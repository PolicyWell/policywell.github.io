import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";

type PermanentRedirectProps = {
  /** Destination path (with or without trailing slash). */
  to: string;
  /** Short human label for the destination page. */
  label: string;
};

/**
 * Soft permanent redirect for static export (GitHub Pages).
 * Pair with metadata refresh + noindex + canonical on the destination.
 */
export function PermanentRedirect({ to, label }: PermanentRedirectProps) {
  const href = to.endsWith("/") || to === "/" ? to : `${to}/`;
  const absolute = absoluteUrl(href);
  return (
    <main className="pw-shell py-16">
      <script
        dangerouslySetInnerHTML={{
          __html: `try{location.replace(${JSON.stringify(href)})}catch(e){}`,
        }}
      />
      <h1 className="font-display text-2xl text-pine">Page moved</h1>
      <p className="mt-3 text-stone">
        This page now lives at{" "}
        <Link href={href} className="underline hover:text-pine">
          {label}
        </Link>
        .
      </p>
      <p className="mt-2 text-xs text-stone">
        Canonical URL: <span className="break-all">{absolute}</span>
      </p>
    </main>
  );
}

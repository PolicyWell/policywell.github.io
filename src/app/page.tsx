import Link from "next/link";
import { LiveAnalysisCounter } from "@/components/LiveAnalysisCounter";
import { PolicyWellCLIShowcase } from "@/components/PolicyWellCLIShowcase";
import { SiteNav } from "@/components/ui";
import { ECOSYSTEM, HOME_HERO, PRODUCT_FLOW } from "@/lib/ecosystem-data";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <SiteNav />
      <main className="relative flex-1">
        <section className="relative overflow-hidden flex flex-col">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(120deg, rgba(15,47,40,0.92) 0%, rgba(61,107,90,0.75) 42%, rgba(143,175,160,0.35) 100%), url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f2f28' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="pw-shell flex-1 flex flex-col justify-center items-center text-center pt-10 pb-6 md:pt-14 md:pb-8 text-foam">
            <p className="animate-rise text-[0.72rem] uppercase tracking-[0.22em] text-foam/70 mb-4">
              {HOME_HERO.eyebrow}
            </p>
            <LiveAnalysisCounter className="animate-rise mb-5 md:mb-6" />
            <h1 className="animate-rise font-display text-[2rem] leading-[1.05] sm:text-3xl md:text-5xl lg:text-6xl max-w-4xl tracking-tight">
              {HOME_HERO.headline}
            </h1>
            <p className="animate-rise-delay mt-4 max-w-2xl text-foam/85 text-base md:text-lg leading-relaxed">
              {HOME_HERO.supporting}
            </p>
            <p className="animate-rise-delay mt-3 text-sm text-foam/65">
              {HOME_HERO.trust}
            </p>
            <div className="animate-rise-delay-2 mt-8 flex flex-col sm:flex-row flex-wrap gap-3 justify-center w-full sm:w-auto">
              <Link
                href={HOME_HERO.primaryCta.href}
                className="pw-btn !bg-foam !text-pine hover:!bg-white w-full sm:w-auto justify-center"
              >
                {HOME_HERO.primaryCta.label}
              </Link>
              <Link
                href={HOME_HERO.secondaryCta.href}
                className="pw-btn pw-btn-secondary !border-foam/35 !text-foam hover:!bg-foam/10 w-full sm:w-auto justify-center"
              >
                {HOME_HERO.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="pw-shell pb-12 md:pb-16 animate-rise-delay-2">
            <PolicyWellCLIShowcase compact />
          </div>
        </section>

        <section
          id="ecosystem"
          className="border-t border-pine/10 bg-foam/50"
          aria-labelledby="ecosystem-heading"
        >
          <div className="pw-shell py-14 md:py-20 space-y-10">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-moss">
                {ECOSYSTEM.eyebrow}
              </p>
              <h2
                id="ecosystem-heading"
                className="font-display text-3xl md:text-4xl text-pine leading-tight"
              >
                {ECOSYSTEM.headline.split("\n").map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
              <p className="text-stone text-base md:text-lg leading-relaxed">
                {ECOSYSTEM.supporting}
              </p>
            </div>

            <div className="pw-eco-center" aria-hidden="true">
              <span>PolicyWell</span>
              <span className="pw-eco-center-sub">Intelligence &amp; workflow layer</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {ECOSYSTEM.audiences.map((audience) => (
                <article
                  key={audience.id}
                  id={`ecosystem-${audience.id}`}
                  className="pw-eco-card scroll-mt-24"
                >
                  <p className="pw-eco-label">{audience.label}</p>
                  <h3 className="pw-eco-value">{audience.value}</h3>
                  <ul className="pw-eco-caps">
                    {audience.capabilities.map((cap) => (
                      <li key={cap}>{cap}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="product-flow"
          className="border-t border-pine/10"
          aria-labelledby="flow-heading"
        >
          <div className="pw-shell py-14 md:py-20 space-y-8">
            <div className="max-w-2xl">
              <h2
                id="flow-heading"
                className="font-display text-3xl md:text-4xl text-pine"
              >
                From document to decision
              </h2>
              <p className="text-stone mt-3 leading-relaxed">
                One shared policy lifecycle. Distinct views for each participant.
              </p>
            </div>
            <ol className="pw-flow-grid">
              {PRODUCT_FLOW.map((step, i) => (
                <li key={step} className="pw-flow-step">
                  <span className="pw-flow-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="pw-flow-label">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-pine/10 bg-pine text-foam">
          <div className="pw-shell py-14 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl md:text-4xl">
                See PolicyWell in action
              </h2>
              <p className="mt-3 text-foam/75 leading-relaxed">
                Explore how insurance documents, household context, and
                advisor workflows become explainable recommendations with
                human approval.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/demo"
                className="pw-btn !bg-foam !text-pine hover:!bg-white justify-center"
              >
                Experience PolicyWell
              </Link>
              <Link
                href="/pricing"
                className="pw-btn pw-btn-secondary !border-foam/35 !text-foam hover:!bg-foam/10 justify-center"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";
import { AlcoholFulfillmentScene } from "@/components/AlcoholFulfillmentScene";
import { EcommerceVerticalScene } from "@/components/EcommerceVerticalScene";
import { IndustryLaptopFrame } from "@/components/IndustryLaptopFrame";
import { EcommerceStorefrontDemo } from "@/components/EcommerceStorefrontDemo";
import { SiteNav } from "@/components/ui";
import {
  industryQuoteHref,
  isEcommerceSceneStage,
  type EcommerceVertical,
} from "@/lib/industries-nav";

const PHONE_DISPLAY = "(470) 887-0449";
const PHONE_HREF = "tel:+14708870449";

function StageVisual({ vertical }: { vertical: EcommerceVertical }) {
  const stage = vertical.stage ?? "laptop";

  if (stage === "alcohol-fulfillment") {
    return <AlcoholFulfillmentScene />;
  }

  if (stage !== "laptop") {
    return <EcommerceVerticalScene stage={stage} />;
  }

  return (
    <IndustryLaptopFrame>
      <EcommerceStorefrontDemo vertical={vertical} />
    </IndustryLaptopFrame>
  );
}

export function EcommerceLanding({
  vertical,
  isHub = false,
}: {
  vertical: EcommerceVertical;
  isHub?: boolean;
}) {
  const isScene = isEcommerceSceneStage(vertical.stage);
  const isBeauty = vertical.stage === "beauty-studio";

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-clip">
      <SiteNav />
      <main className="pw-industry-page">
        <section
          className={`pw-industry-hero${isScene ? " pw-industry-hero-scene" : ""}${isBeauty ? " pw-industry-hero-scene-light" : ""}`}
        >
          <div
            className={`pw-shell${isScene ? " pw-industry-hero-stack" : " pw-industry-hero-grid"}`}
          >
            <div className="pw-industry-hero-copy animate-rise">
              <p className="pw-industry-eyebrow">
                <Link href="/industries/ecommerce/">Ecommerce</Link>
                <span aria-hidden> / </span>
                {!isHub ? (
                  <span>{vertical.label}</span>
                ) : (
                  <span>Overview</span>
                )}
              </p>
              <h1 className="font-display text-pine">{vertical.headline}</h1>
              <p className="pw-industry-support">{vertical.support}</p>
              <div className="pw-industry-hero-actions">
                <Link
                  href={industryQuoteHref(vertical.label)}
                  className="pw-btn"
                >
                  Get a quote
                </Link>
              </div>
              {isScene && (
                <p className="pw-industry-hero-meta">
                  <Link href={industryQuoteHref(vertical.label)}>
                    {vertical.secondaryCta ?? "Free coverage review"}
                  </Link>
                  <span aria-hidden> · </span>
                  <a href={PHONE_HREF}>{PHONE_DISPLAY}</a>
                </p>
              )}
            </div>

            <div className="pw-industry-hero-stage animate-rise-delay-2">
              <StageVisual vertical={vertical} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

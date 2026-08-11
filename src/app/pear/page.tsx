import { PearAccessGate } from "@/components/pear/PearAccessGate";
import { PearLiveAgent } from "@/components/pear/PearLiveAgent";
import { privateRouteMetadata } from "@/lib/private-route-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  ...privateRouteMetadata,
  title: "Pear X 27 Live Agent | PolicyWell",
  description:
    "Code-gated PolicyWell live agent for the Pear X 27 illustration walkthrough.",
};

export default function PearPage() {
  return (
    <PearAccessGate>
      <PearLiveAgent />
    </PearAccessGate>
  );
}

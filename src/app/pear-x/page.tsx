import { PearAccessGate } from "@/components/pear/PearAccessGate";
import { PearDualTerminals } from "@/components/pear/PearDualTerminals";
import { privateRouteMetadata } from "@/lib/private-route-metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  ...privateRouteMetadata,
  title: "Pear X 27 Dual Terminals | PolicyWell",
  description:
    "Two-terminal Pear X 27 live demo — stack boot + PolicyWell CLI walkthrough.",
};

export default function PearXPage() {
  return (
    <PearAccessGate>
      <PearDualTerminals />
    </PearAccessGate>
  );
}

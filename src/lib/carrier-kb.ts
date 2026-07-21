export interface CarrierProductPack {
  productName: string;
  productType: string;
  keywords: string[];
  approvedClaims: string[];
  illustrationNotes: string[];
}

export interface CarrierPack {
  carrier: string;
  complianceLanguage: string;
  products: CarrierProductPack[];
}

export interface CarrierAnswer {
  supported: boolean;
  answer: string;
  product?: string;
  sources: string[];
  complianceLanguage: string;
}

/**
 * Approved carrier knowledge packs. Answers are assembled ONLY from
 * approvedClaims — no generated claims — and compliance language is
 * always appended verbatim.
 */
export const CARRIER_PACKS: CarrierPack[] = [
  {
    carrier: "Mutual of Omaha",
    complianceLanguage:
      "This material is for informational purposes only and is not a recommendation. Indexed universal life insurance values are based on non-guaranteed elements that are subject to change. Guarantees are backed by the claims-paying ability of the issuing company. Consult the policy contract and a licensed professional.",
    products: [
      {
        productName: "Life Protection Advantage IUL",
        productType: "Indexed Universal Life",
        keywords: ["iul", "indexed universal", "life protection advantage"],
        approvedClaims: [
          "Life Protection Advantage is an indexed universal life insurance policy designed to provide long-term death benefit protection.",
          "Cash value growth is linked to the performance of a market index, subject to caps and floors, and is never invested directly in the market.",
          "The policy offers a 0% floor on index-linked interest crediting, protecting accumulated value from negative index returns.",
          "Optional riders, including an Accelerated Death Benefit rider, may be available subject to state approval.",
        ],
        illustrationNotes: [
          "Illustrations show guaranteed and non-guaranteed columns; non-guaranteed values assume the illustrated crediting rate continues.",
          "Funding below target premium may reduce projected duration of coverage.",
        ],
      },
    ],
  },
  {
    carrier: "Athene",
    complianceLanguage:
      "Annuities are long-term products designed for retirement. Withdrawals may be subject to surrender charges and market value adjustments. Product features vary by state. This content is educational and not investment advice.",
    products: [
      {
        productName: "Performance Elite FIA",
        productType: "Fixed Indexed Annuity",
        keywords: ["fia", "fixed indexed annuity", "performance elite"],
        approvedClaims: [
          "Performance Elite is a fixed indexed annuity offering growth potential linked to market indices with principal protection from index losses.",
          "Interest crediting is subject to caps, spreads, or participation rates declared by the company.",
          "A liquidity rider may provide enhanced free-withdrawal amounts for an additional charge.",
        ],
        illustrationNotes: [
          "Illustrated values are hypothetical and based on current, non-guaranteed rates.",
        ],
      },
    ],
  },
];

export function getCarrierPack(carrier: string): CarrierPack | null {
  return (
    CARRIER_PACKS.find(
      (p) => p.carrier.toLowerCase() === carrier.trim().toLowerCase(),
    ) ?? null
  );
}

/**
 * Answer a question using ONLY approved carrier content.
 * If nothing in the pack supports the question, decline rather than guess.
 */
export function answerCarrierQuestion(
  carrier: string,
  question: string,
): CarrierAnswer {
  const pack = getCarrierPack(carrier);
  if (!pack) {
    return {
      supported: false,
      answer: `No approved content pack is loaded for "${carrier}". PolicyWell will not generate unsupported claims.`,
      sources: [],
      complianceLanguage: "",
    };
  }

  const q = question.toLowerCase();
  const product =
    pack.products.find((p) => p.keywords.some((k) => q.includes(k))) ??
    (pack.products.length === 1 ? pack.products[0] : null);

  if (!product) {
    return {
      supported: false,
      answer:
        "The question does not match any approved product content for this carrier. Please specify a product covered by the approved pack.",
      sources: [],
      complianceLanguage: pack.complianceLanguage,
    };
  }

  const wantsIllustration = /illustrat|project|show|values/i.test(question);
  const body = [
    ...product.approvedClaims,
    ...(wantsIllustration ? product.illustrationNotes : []),
  ];

  return {
    supported: true,
    product: product.productName,
    answer: body.join(" "),
    sources: body.map(
      (_, i) => `${pack.carrier} approved pack · ${product.productName} · claim ${i + 1}`,
    ),
    complianceLanguage: pack.complianceLanguage,
  };
}

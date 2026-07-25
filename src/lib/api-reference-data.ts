import type { DocsStatus } from "@/lib/docs-data";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiParam = {
  name: string;
  in: "path" | "query" | "header";
  type: string;
  required?: boolean;
  description: string;
};

export type ApiEndpoint = {
  id: string;
  method: HttpMethod;
  path: string;
  title: string;
  summary: string;
  status: DocsStatus;
  params?: readonly ApiParam[];
  requestBody?: {
    description?: string;
    example: Record<string, unknown> | unknown[];
  };
  responseExample: Record<string, unknown> | unknown[];
  notes?: readonly string[];
};

export type ApiGroup = {
  slug: string;
  title: string;
  summary: string;
  status: DocsStatus;
  endpoints: readonly ApiEndpoint[];
};

export const API_BASE_URL = "https://api.policywell.ai/v1";
export const API_MCP_HINT = "mcp.policywell.ai";

export const API_META = {
  title: "API reference",
  description:
    "REST endpoints for PolicyWell - personal and commercial insurance intelligence, underwriting decision support, carrier appetite, webhooks, and enterprise workflows.",
  version: "v1",
  authHeader: "Authorization: Bearer pw_test_...",
} as const;

export const API_GROUPS: readonly ApiGroup[] = [
  {
    slug: "authentication",
    title: "Authentication",
    summary: "API keys, scopes, and request authentication.",
    status: "Planned",
    endpoints: [
      {
        id: "create-api-key",
        method: "POST",
        path: "/auth/api-keys",
        title: "Create API key",
        summary: "Create a test or live API key for organization integrations.",
        status: "Planned",
        requestBody: {
          example: {
            name: "Carrier staging",
            environment: "test",
            scopes: ["policies:read", "documents:write", "analyses:write"],
          },
        },
        responseExample: {
          id: "key_01J8Z9K2M3N4P5Q6R7S8T9",
          name: "Carrier staging",
          environment: "test",
          key: "pw_test_3f9c2a8b1d4e6f70",
          scopes: ["policies:read", "documents:write", "analyses:write"],
          created_at: "2026-07-23T12:00:00Z",
        },
        notes: [
          "The raw key is returned once. Store it in a secret manager.",
          "Prefix: pw_test_ for sandbox, pw_live_ for production.",
        ],
      },
      {
        id: "list-api-keys",
        method: "GET",
        path: "/auth/api-keys",
        title: "List API keys",
        summary: "List API keys for the authenticated organization.",
        status: "Planned",
        responseExample: {
          data: [
            {
              id: "key_01J8Z9K2M3N4P5Q6R7S8T9",
              name: "Carrier staging",
              environment: "test",
              scopes: ["policies:read", "documents:write", "analyses:write"],
              created_at: "2026-07-23T12:00:00Z",
              last_used_at: null,
            },
          ],
        },
      },
    ],
  },
  {
    slug: "households",
    title: "Households",
    summary: "Household context used by analysis and recommendations.",
    status: "Planned",
    endpoints: [
      {
        id: "create-household",
        method: "POST",
        path: "/households",
        title: "Create household",
        summary: "Create a household profile for a consumer or advisor client.",
        status: "Planned",
        requestBody: {
          example: {
            external_id: "crm_contact_88421",
            primary_name: "Alex Rivera",
            email: "alex@example.com",
            state: "TX",
            marital_status: "married",
            dependents_count: 3,
            has_mortgage: true,
            mortgage_balance: 285000,
            annual_income: 145000,
            goals: ["prevent_lapse", "income_replacement"],
          },
        },
        responseExample: {
          id: "hh_01J8HOUSEHOLD",
          external_id: "crm_contact_88421",
          primary_name: "Alex Rivera",
          state: "TX",
          created_at: "2026-07-23T12:01:00Z",
        },
      },
      {
        id: "get-household",
        method: "GET",
        path: "/households/{household_id}",
        title: "Retrieve household",
        summary: "Get household context and linked policy references.",
        status: "Planned",
        params: [
          {
            name: "household_id",
            in: "path",
            type: "string",
            required: true,
            description: "Household ID (`hh_...`).",
          },
        ],
        responseExample: {
          id: "hh_01J8HOUSEHOLD",
          primary_name: "Alex Rivera",
          state: "TX",
          dependents_count: 3,
          policy_ids: ["pol_01J8POLICY"],
          updated_at: "2026-07-23T12:05:00Z",
        },
      },
      {
        id: "update-household",
        method: "PATCH",
        path: "/households/{household_id}",
        title: "Update household",
        summary: "Patch household attributes used for context-aware analysis.",
        status: "Planned",
        params: [
          {
            name: "household_id",
            in: "path",
            type: "string",
            required: true,
            description: "Household ID.",
          },
        ],
        requestBody: {
          example: {
            annual_income: 152000,
            goals: ["prevent_lapse", "estate_planning"],
          },
        },
        responseExample: {
          id: "hh_01J8HOUSEHOLD",
          annual_income: 152000,
          updated_at: "2026-07-23T12:10:00Z",
        },
      },
    ],
  },
  {
    slug: "documents",
    title: "Documents",
    summary: "Upload and process policies, illustrations, and statements.",
    status: "Planned",
    endpoints: [
      {
        id: "create-document",
        method: "POST",
        path: "/documents",
        title: "Upload document",
        summary:
          "Create a document ingestion job from a multipart upload or signed URL.",
        status: "Planned",
        requestBody: {
          description: "multipart/form-data or JSON with source URL.",
          example: {
            household_id: "hh_01J8HOUSEHOLD",
            document_type: "policy_illustration",
            filename: "iul-illustration.pdf",
            content_type: "application/pdf",
            source_url: "https://files.example.com/iul-illustration.pdf",
          },
        },
        responseExample: {
          id: "doc_01J8DOCUMENT",
          status: "processing",
          document_type: "policy_illustration",
          household_id: "hh_01J8HOUSEHOLD",
          created_at: "2026-07-23T12:02:00Z",
        },
      },
      {
        id: "get-document",
        method: "GET",
        path: "/documents/{document_id}",
        title: "Retrieve document",
        summary: "Get document status and extracted field summary.",
        status: "Planned",
        params: [
          {
            name: "document_id",
            in: "path",
            type: "string",
            required: true,
            description: "Document ID (`doc_...`).",
          },
        ],
        responseExample: {
          id: "doc_01J8DOCUMENT",
          status: "verified",
          document_type: "policy_illustration",
          extraction: {
            carrier: { value: "Example Life", confidence: 0.94 },
            product_type: { value: "IUL", confidence: 0.91 },
            face_amount: { value: 500000, confidence: 0.88 },
          },
          policy_id: "pol_01J8POLICY",
        },
      },
      {
        id: "list-documents",
        method: "GET",
        path: "/documents",
        title: "List documents",
        summary: "List documents for a household or organization.",
        status: "Planned",
        params: [
          {
            name: "household_id",
            in: "query",
            type: "string",
            description: "Filter by household.",
          },
          {
            name: "status",
            in: "query",
            type: "string",
            description: "processing | verified | failed",
          },
        ],
        responseExample: {
          data: [{ id: "doc_01J8DOCUMENT", status: "verified" }],
          next_cursor: null,
        },
      },
    ],
  },
  {
    slug: "policies",
    title: "Policies",
    summary: "Structured policy records derived from documents and carrier data.",
    status: "Planned",
    endpoints: [
      {
        id: "create-policy",
        method: "POST",
        path: "/policies",
        title: "Create policy",
        summary: "Create a structured policy from verified extraction or carrier payload.",
        status: "Planned",
        requestBody: {
          example: {
            household_id: "hh_01J8HOUSEHOLD",
            document_id: "doc_01J8DOCUMENT",
            carrier: "Example Life",
            product_name: "Indexed Universal Life",
            product_type: "IUL",
            face_amount: 500000,
            cash_value: 28450,
            current_premium: 6200,
            target_premium: 7500,
            issue_age: 38,
            riders: ["waiver_of_premium", "accelerated_death_benefit"],
            beneficiaries: [
              { name: "Jordan Rivera", allocation_pct: 100, relationship: "spouse" },
            ],
          },
        },
        responseExample: {
          id: "pol_01J8POLICY",
          household_id: "hh_01J8HOUSEHOLD",
          product_type: "IUL",
          status: "active",
          created_at: "2026-07-23T12:03:00Z",
        },
      },
      {
        id: "get-policy",
        method: "GET",
        path: "/policies/{policy_id}",
        title: "Retrieve policy",
        summary: "Get a policy record with structured fields and confidence metadata.",
        status: "Planned",
        params: [
          {
            name: "household_id",
            in: "query",
            type: "string",
            description: "Optional household scope check.",
          },
          {
            name: "policy_id",
            in: "path",
            type: "string",
            required: true,
            description: "Policy ID (`pol_...`).",
          },
        ],
        responseExample: {
          id: "pol_01J8POLICY",
          carrier: "Example Life",
          product_type: "IUL",
          face_amount: 500000,
          cash_value: 28450,
          current_premium: 6200,
          target_premium: 7500,
          riders: ["waiver_of_premium", "accelerated_death_benefit"],
        },
      },
      {
        id: "list-policies",
        method: "GET",
        path: "/policies",
        title: "List policies",
        summary: "List policies for a household, advisor book, or organization.",
        status: "Planned",
        params: [
          {
            name: "household_id",
            in: "query",
            type: "string",
            description: "Filter by household.",
          },
          {
            name: "product_type",
            in: "query",
            type: "string",
            description: "IUL | WL | TERM | FIA | MYGA | SPIA",
          },
        ],
        responseExample: {
          data: [
            {
              id: "pol_01J8POLICY",
              product_type: "IUL",
              face_amount: 500000,
              household_id: "hh_01J8HOUSEHOLD",
            },
          ],
        },
      },
      {
        id: "compare-policies",
        method: "POST",
        path: "/policies/compare",
        title: "Compare policies",
        summary: "Run a structured comparison, including 1035 exchange warnings when relevant.",
        status: "Planned",
        requestBody: {
          example: {
            policy_ids: ["pol_01J8POLICY", "pol_01J8PROPOSED"],
            include_1035_analysis: true,
          },
        },
        responseExample: {
          id: "cmp_01J8COMPARE",
          policy_ids: ["pol_01J8POLICY", "pol_01J8PROPOSED"],
          summary: {
            lower_cost_option: "pol_01J8PROPOSED",
            higher_guaranteed_death_benefit: "pol_01J8POLICY",
          },
          warnings: [
            {
              code: "1035_exchange_review",
              message: "Replacement may require 1035 exchange documentation.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "analyses",
    title: "Analyses",
    summary: "Policy-health scoring, lapse risk, COI, and coverage-gap analysis.",
    status: "Planned",
    endpoints: [
      {
        id: "create-analysis",
        method: "POST",
        path: "/analyses",
        title: "Create analysis",
        summary: "Run Policy Intelligence against a policy and household context.",
        status: "Planned",
        requestBody: {
          example: {
            policy_id: "pol_01J8POLICY",
            household_id: "hh_01J8HOUSEHOLD",
            modules: [
              "policy_health",
              "lapse_risk",
              "cash_value_projection",
              "coi",
              "coverage_gap",
              "rider_detection",
              "beneficiary",
            ],
          },
        },
        responseExample: {
          id: "anl_01J8ANALYSIS",
          status: "completed",
          policy_id: "pol_01J8POLICY",
          scores: {
            policy_health: 72,
            lapse_risk: 38,
            funding_adequacy: 64,
            confidence: 0.86,
          },
          signals: [
            {
              code: "premium_below_target",
              severity: "medium",
              message: "Current premium is below target premium.",
            },
          ],
          illustrative: true,
        },
        notes: [
          "Scores are product signals for review, not actuarial certification.",
          "Set illustrative=true for demo/sandbox fixtures.",
        ],
      },
      {
        id: "get-analysis",
        method: "GET",
        path: "/analyses/{analysis_id}",
        title: "Retrieve analysis",
        summary: "Fetch analysis results and evidence summaries.",
        status: "Planned",
        params: [
          {
            name: "analysis_id",
            in: "path",
            type: "string",
            required: true,
            description: "Analysis ID (`anl_...`).",
          },
        ],
        responseExample: {
          id: "anl_01J8ANALYSIS",
          status: "completed",
          scores: { policy_health: 72, lapse_risk: 38, confidence: 0.86 },
          evidence: [
            {
              source: "document",
              field: "current_premium",
              value: 6200,
              document_id: "doc_01J8DOCUMENT",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "recommendations",
    title: "Recommendations",
    summary: "Funding, coverage, rider, optimization, and exchange recommendations.",
    status: "Planned",
    endpoints: [
      {
        id: "create-recommendations",
        method: "POST",
        path: "/recommendations",
        title: "Generate recommendations",
        summary: "Generate recommendations from an analysis for human review.",
        status: "Planned",
        requestBody: {
          example: {
            analysis_id: "anl_01J8ANALYSIS",
            audience: "advisor",
          },
        },
        responseExample: {
          data: [
            {
              id: "rec_01J8FUNDING",
              type: "funding",
              title: "Increase planned premium toward target",
              status: "pending_review",
              rationale:
                "Current premium trails target premium and increases modeled lapse risk.",
            },
            {
              id: "rec_01J8RIDER",
              type: "rider",
              title: "Review chronic illness rider suitability",
              status: "pending_review",
            },
          ],
        },
        notes: [
          "Recommendations remain subject to licensed professional approval.",
          "Compensation must not influence recommendation generation.",
        ],
      },
      {
        id: "list-recommendations",
        method: "GET",
        path: "/recommendations",
        title: "List recommendations",
        summary: "List recommendations by household, policy, or approval status.",
        status: "Planned",
        params: [
          {
            name: "policy_id",
            in: "query",
            type: "string",
            description: "Filter by policy.",
          },
          {
            name: "status",
            in: "query",
            type: "string",
            description: "pending_review | approved | rejected",
          },
        ],
        responseExample: {
          data: [
            {
              id: "rec_01J8FUNDING",
              type: "funding",
              status: "pending_review",
            },
          ],
        },
      },
      {
        id: "approve-recommendation",
        method: "POST",
        path: "/recommendations/{recommendation_id}/approve",
        title: "Approve recommendation",
        summary: "Record licensed advisor approval before client presentation.",
        status: "Planned",
        params: [
          {
            name: "recommendation_id",
            in: "path",
            type: "string",
            required: true,
            description: "Recommendation ID.",
          },
        ],
        requestBody: {
          example: {
            advisor_id: "adv_01J8ADVISOR",
            notes: "Suitable given household income and goals.",
          },
        },
        responseExample: {
          id: "rec_01J8FUNDING",
          status: "approved",
          approved_at: "2026-07-23T12:20:00Z",
          approved_by: "adv_01J8ADVISOR",
        },
      },
      {
        id: "reject-recommendation",
        method: "POST",
        path: "/recommendations/{recommendation_id}/reject",
        title: "Reject recommendation",
        summary: "Reject a recommendation with a documented reason.",
        status: "Planned",
        params: [
          {
            name: "recommendation_id",
            in: "path",
            type: "string",
            required: true,
            description: "Recommendation ID.",
          },
        ],
        requestBody: {
          example: {
            advisor_id: "adv_01J8ADVISOR",
            reason: "Client risk tolerance does not support this change.",
          },
        },
        responseExample: {
          id: "rec_01J8FUNDING",
          status: "rejected",
          rejected_at: "2026-07-23T12:21:00Z",
        },
      },
    ],
  },
  {
    slug: "assistant",
    title: "Assistant",
    summary: "Document-aware and household-aware insurance Q&A.",
    status: "Preview",
    endpoints: [
      {
        id: "create-assistant-session",
        method: "POST",
        path: "/assistant/sessions",
        title: "Create assistant session",
        summary: "Open a grounded chat session for consumer or advisor mode.",
        status: "Preview",
        requestBody: {
          example: {
            mode: "advisor",
            household_id: "hh_01J8HOUSEHOLD",
            policy_ids: ["pol_01J8POLICY"],
          },
        },
        responseExample: {
          id: "asess_01J8SESSION",
          mode: "advisor",
          created_at: "2026-07-23T12:22:00Z",
        },
        notes: [
          "Today the product experience is available at /agent.",
          "This REST surface is the planned integration contract.",
        ],
      },
      {
        id: "assistant-message",
        method: "POST",
        path: "/assistant/sessions/{session_id}/messages",
        title: "Send message",
        summary: "Ask a grounded question and receive an evidence-linked answer.",
        status: "Preview",
        params: [
          {
            name: "session_id",
            in: "path",
            type: "string",
            required: true,
            description: "Assistant session ID.",
          },
        ],
        requestBody: {
          example: {
            content: "Is this policy appropriately funded?",
          },
        },
        responseExample: {
          id: "msg_01J8MESSAGE",
          role: "assistant",
          content:
            "Current premium is below target premium. Funding adequacy score is 64.",
          evidence: [
            {
              type: "policy_field",
              field: "current_premium",
              value: 6200,
            },
            {
              type: "analysis_signal",
              code: "premium_below_target",
            },
          ],
          for_human_review: true,
        },
      },
    ],
  },
  {
    slug: "annuities",
    title: "Annuities",
    summary: "FIA, MYGA, and SPIA comparison and income analysis.",
    status: "Planned",
    endpoints: [
      {
        id: "compare-annuities",
        method: "POST",
        path: "/annuities/compare",
        title: "Compare annuities",
        summary: "Compare FIA, MYGA, or SPIA illustrations side by side.",
        status: "Planned",
        requestBody: {
          example: {
            product_ids: ["ann_01J8FIA", "ann_01J8MYGA"],
            income_start_age: 65,
            premium: 250000,
          },
        },
        responseExample: {
          id: "acmp_01J8ANN",
          products: ["ann_01J8FIA", "ann_01J8MYGA"],
          income_projection: {
            ann_01J8FIA: { annual_income: 16200, assumptions: "illustrated" },
            ann_01J8MYGA: { annual_income: 14850, assumptions: "guaranteed" },
          },
        },
      },
      {
        id: "annuity-exchange-analysis",
        method: "POST",
        path: "/annuities/1035-analysis",
        title: "1035 exchange analysis",
        summary: "Evaluate surrender schedules and exchange implications.",
        status: "Planned",
        requestBody: {
          example: {
            from_policy_id: "ann_01J8EXISTING",
            to_product_id: "ann_01J8PROPOSED",
          },
        },
        responseExample: {
          id: "ex_01J8EXCHANGE",
          surrender_charge: 12500,
          years_remaining_in_surrender: 4,
          warnings: ["Review suitability and replacement paperwork."],
        },
      },
    ],
  },
  {
    slug: "organizations",
    title: "Organizations",
    summary: "IMO/BGA workspaces, advisors, and book-of-business views.",
    status: "Planned",
    endpoints: [
      {
        id: "list-advisors",
        method: "GET",
        path: "/organizations/{org_id}/advisors",
        title: "List advisors",
        summary: "List advisors in an IMO or firm workspace.",
        status: "Planned",
        params: [
          {
            name: "org_id",
            in: "path",
            type: "string",
            required: true,
            description: "Organization ID (`org_...`).",
          },
        ],
        responseExample: {
          data: [
            {
              id: "adv_01J8ADVISOR",
              name: "Sam Chen",
              open_reviews: 12,
              persistency_score: 0.93,
            },
          ],
        },
      },
      {
        id: "org-portfolio",
        method: "GET",
        path: "/organizations/{org_id}/portfolio",
        title: "Portfolio intelligence",
        summary: "Persistency, lapse monitoring, and production rollups.",
        status: "Planned",
        params: [
          {
            name: "org_id",
            in: "path",
            type: "string",
            required: true,
            description: "Organization ID.",
          },
        ],
        responseExample: {
          policies_under_management: 18420,
          lapse_risk_high: 214,
          annual_reviews_due_30d: 96,
          production_mtd: 1280000,
        },
      },
    ],
  },
  {
    slug: "carrier",
    title: "Carrier",
    summary: "Carrier-facing ingestion, status, and servicing endpoints.",
    status: "Planned",
    endpoints: [
      {
        id: "carrier-quote",
        method: "POST",
        path: "/carrier/quotes",
        title: "Request quote",
        summary: "Submit a quote request to a connected carrier workflow.",
        status: "Planned",
        requestBody: {
          example: {
            product_type: "IUL",
            face_amount: 500000,
            issue_age: 40,
            state: "TX",
            household_id: "hh_01J8HOUSEHOLD",
          },
        },
        responseExample: {
          id: "qt_01J8QUOTE",
          status: "pending",
          carrier_ref: "carrier_quote_8891",
        },
      },
      {
        id: "carrier-policy-status",
        method: "GET",
        path: "/carrier/policies/{carrier_policy_id}/status",
        title: "Policy status",
        summary: "Fetch underwriting or in-force servicing status.",
        status: "Planned",
        params: [
          {
            name: "carrier_policy_id",
            in: "path",
            type: "string",
            required: true,
            description: "Carrier policy identifier.",
          },
        ],
        responseExample: {
          carrier_policy_id: "EL-998877",
          status: "in_force",
          premium_status: "current",
          last_premium_paid_at: "2026-06-01",
        },
      },
      {
        id: "carrier-illustration",
        method: "POST",
        path: "/carrier/illustrations",
        title: "Request illustration",
        summary: "Request a carrier illustration and attach it to a household.",
        status: "Planned",
        requestBody: {
          example: {
            product_code: "IUL-SELECT",
            household_id: "hh_01J8HOUSEHOLD",
            planned_premium: 7500,
            face_amount: 500000,
          },
        },
        responseExample: {
          id: "ill_01J8ILLUS",
          status: "ready",
          document_id: "doc_01J8ILLUS",
        },
      },
    ],
  },
  {
    slug: "quotes",
    title: "Quotes",
    summary:
      "Create and track personal or commercial quote requests. Decision support only — not bindable premiums.",
    status: "Preview",
    endpoints: [
      {
        id: "create-quote",
        method: "POST",
        path: "/quotes",
        title: "Create quote request",
        summary:
          "Open a quote intake for a household or commercial business. Routes to advisor review and optional carrier workflows.",
        status: "Preview",
        requestBody: {
          description:
            "Provide contact details plus either household_id (personal) or business/industry context (commercial).",
          example: {
            line: "commercial",
            name: "Jordan Lee",
            company: "Harbor Fabrication LLC",
            email: "jordan@harborfab.example",
            phone: "+14708870449",
            state: "TX",
            industry: "Contractor",
            business_id: "biz_01J8HARBOR",
            coverages: ["general_liability", "workers_compensation"],
            notes: "Renewal in 45 days; need GL + WC indicative ranges.",
          },
        },
        responseExample: {
          id: "qt_01J8QUOTE",
          status: "received",
          line: "commercial",
          industry: "Contractor",
          state: "TX",
          coverages: ["general_liability", "workers_compensation"],
          assignee: null,
          human_review_status: "pending",
          disclaimer:
            "Indicative decision support only — not a bindable quote or underwriting decision.",
          created_at: "2026-07-25T12:00:00Z",
          updated_at: "2026-07-25T12:00:00Z",
        },
        notes: [
          "Email or phone is required.",
          "Public site /quote maps to this intake shape.",
          "Does not return carrier-bound premiums.",
        ],
      },
      {
        id: "create-personal-quote",
        method: "POST",
        path: "/quotes/personal",
        title: "Create personal / life quote request",
        summary:
          "Open a personal lines or life quote request tied to a household.",
        status: "Preview",
        requestBody: {
          example: {
            household_id: "hh_01J8HOUSEHOLD",
            product_type: "IUL",
            face_amount: 500000,
            issue_age: 40,
            state: "TX",
            contact: {
              name: "Alex Rivera",
              email: "alex@example.com",
              phone: "+14155550100",
            },
          },
        },
        responseExample: {
          id: "qt_01J8LIFE",
          status: "received",
          line: "personal",
          product_type: "IUL",
          household_id: "hh_01J8HOUSEHOLD",
          human_review_status: "pending",
          disclaimer:
            "Indicative decision support only — not a bindable quote or underwriting decision.",
          created_at: "2026-07-25T12:05:00Z",
        },
      },
      {
        id: "list-quotes",
        method: "GET",
        path: "/quotes",
        title: "List quote requests",
        summary: "List quote intakes for an organization, filtered by status or line.",
        status: "Preview",
        params: [
          {
            name: "status",
            in: "query",
            type: "string",
            description:
              "Filter: received | in_review | options_ready | submitted_to_carrier | closed | cancelled.",
          },
          {
            name: "line",
            in: "query",
            type: "string",
            description: "personal | commercial",
          },
          {
            name: "limit",
            in: "query",
            type: "integer",
            description: "Page size (default 25, max 100).",
          },
        ],
        responseExample: {
          data: [
            {
              id: "qt_01J8QUOTE",
              status: "in_review",
              line: "commercial",
              industry: "Contractor",
              created_at: "2026-07-25T12:00:00Z",
            },
            {
              id: "qt_01J8LIFE",
              status: "received",
              line: "personal",
              product_type: "IUL",
              created_at: "2026-07-25T12:05:00Z",
            },
          ],
          has_more: false,
        },
      },
      {
        id: "get-quote",
        method: "GET",
        path: "/quotes/{quote_id}",
        title: "Retrieve quote request",
        summary: "Fetch a quote intake, review status, and any indicative options.",
        status: "Preview",
        params: [
          {
            name: "quote_id",
            in: "path",
            type: "string",
            required: true,
            description: "Quote ID (`qt_...`).",
          },
        ],
        responseExample: {
          id: "qt_01J8QUOTE",
          status: "options_ready",
          line: "commercial",
          name: "Jordan Lee",
          company: "Harbor Fabrication LLC",
          email: "jordan@harborfab.example",
          phone: "+14708870449",
          state: "TX",
          industry: "Contractor",
          business_id: "biz_01J8HARBOR",
          coverages: ["general_liability", "workers_compensation"],
          human_review_status: "approved",
          options: [
            {
              id: "qto_01J8A",
              carrier: "Example Specialty",
              coverage: "general_liability",
              indicative_premium_annual: 4200,
              confidence: 0.72,
            },
          ],
          disclaimer:
            "Indicative ranges only — not bindable premiums or carrier commitments.",
          created_at: "2026-07-25T12:00:00Z",
          updated_at: "2026-07-25T13:10:00Z",
        },
      },
      {
        id: "update-quote",
        method: "PATCH",
        path: "/quotes/{quote_id}",
        title: "Update quote request",
        summary: "Update contact details, industry, coverages, or notes before submission.",
        status: "Preview",
        params: [
          {
            name: "quote_id",
            in: "path",
            type: "string",
            required: true,
            description: "Quote ID (`qt_...`).",
          },
        ],
        requestBody: {
          example: {
            phone: "+14708870449",
            coverages: [
              "general_liability",
              "workers_compensation",
              "commercial_auto",
            ],
            notes: "Also need hired/non-owned auto.",
          },
        },
        responseExample: {
          id: "qt_01J8QUOTE",
          status: "in_review",
          coverages: [
            "general_liability",
            "workers_compensation",
            "commercial_auto",
          ],
          updated_at: "2026-07-25T12:20:00Z",
        },
      },
      {
        id: "get-quote-options",
        method: "GET",
        path: "/quotes/{quote_id}/options",
        title: "List indicative quote options",
        summary:
          "Return advisor-reviewed indicative options for a quote. Never treated as bindable.",
        status: "Preview",
        params: [
          {
            name: "quote_id",
            in: "path",
            type: "string",
            required: true,
            description: "Quote ID (`qt_...`).",
          },
        ],
        responseExample: {
          quote_id: "qt_01J8QUOTE",
          status: "options_ready",
          options: [
            {
              id: "qto_01J8A",
              carrier: "Example Specialty",
              coverage: "general_liability",
              limit: 1000000,
              indicative_premium_annual: 4200,
              confidence: 0.72,
            },
            {
              id: "qto_01J8B",
              carrier: "Example Mutual",
              coverage: "workers_compensation",
              indicative_premium_annual: 9800,
              confidence: 0.68,
            },
          ],
          disclaimer:
            "Indicative decision support only — not a bindable quote, eligibility guarantee, or carrier decision.",
          human_review_status: "approved",
        },
        notes: [
          "Options require human review before status becomes options_ready.",
          "For direct carrier submission workflows see POST /carrier/quotes.",
        ],
      },
      {
        id: "submit-quote",
        method: "POST",
        path: "/quotes/{quote_id}/submit",
        title: "Submit quote to carrier workflow",
        summary:
          "Hand an approved quote request to connected carrier or MGA workflows.",
        status: "Planned",
        params: [
          {
            name: "quote_id",
            in: "path",
            type: "string",
            required: true,
            description: "Quote ID (`qt_...`).",
          },
        ],
        requestBody: {
          example: {
            carrier_ids: ["car_example_specialty"],
            option_ids: ["qto_01J8A", "qto_01J8B"],
          },
        },
        responseExample: {
          id: "qt_01J8QUOTE",
          status: "submitted_to_carrier",
          submissions: [
            {
              carrier_id: "car_example_specialty",
              carrier_ref: "carrier_quote_8891",
              status: "pending",
            },
          ],
          updated_at: "2026-07-25T14:00:00Z",
        },
        notes: [
          "Requires human_review_status approved.",
          "Related carrier endpoint: POST /carrier/quotes.",
        ],
      },
      {
        id: "cancel-quote",
        method: "POST",
        path: "/quotes/{quote_id}/cancel",
        title: "Cancel quote request",
        summary: "Cancel an open quote intake that has not been bound.",
        status: "Preview",
        params: [
          {
            name: "quote_id",
            in: "path",
            type: "string",
            required: true,
            description: "Quote ID (`qt_...`).",
          },
        ],
        requestBody: {
          example: { reason: "client_withdrew" },
        },
        responseExample: {
          id: "qt_01J8QUOTE",
          status: "cancelled",
          cancelled_at: "2026-07-25T15:00:00Z",
        },
      },
    ],
  },
  {
    slug: "webhooks",
    title: "Webhooks",
    summary: "Subscribe to PolicyWell lifecycle events.",
    status: "Planned",
    endpoints: [
      {
        id: "create-webhook",
        method: "POST",
        path: "/webhooks",
        title: "Create webhook endpoint",
        summary: "Register an HTTPS endpoint for event delivery.",
        status: "Planned",
        requestBody: {
          example: {
            url: "https://example.com/hooks/policywell",
            events: [
              "policy.uploaded",
              "analysis.completed",
              "recommendation.generated",
              "policy.nearing_lapse",
              "annual_review.due",
              "premium.missed",
            ],
            secret: "whsec_replace_me",
          },
        },
        responseExample: {
          id: "wh_01J8WEBHOOK",
          url: "https://example.com/hooks/policywell",
          status: "enabled",
          created_at: "2026-07-23T12:30:00Z",
        },
      },
      {
        id: "list-webhook-deliveries",
        method: "GET",
        path: "/webhooks/{webhook_id}/deliveries",
        title: "List deliveries",
        summary: "Inspect recent webhook delivery attempts.",
        status: "Planned",
        params: [
          {
            name: "webhook_id",
            in: "path",
            type: "string",
            required: true,
            description: "Webhook ID.",
          },
        ],
        responseExample: {
          data: [
            {
              id: "del_01J8DELIVERY",
              event: "analysis.completed",
              response_status: 200,
              delivered_at: "2026-07-23T12:31:00Z",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "workflows",
    title: "Workflows",
    summary: "Trigger analyses, notify advisors, and schedule reviews.",
    status: "Planned",
    endpoints: [
      {
        id: "create-workflow-run",
        method: "POST",
        path: "/workflows/runs",
        title: "Trigger workflow",
        summary: "Start an automated insurance workflow run.",
        status: "Planned",
        requestBody: {
          example: {
            workflow: "annual_review",
            household_id: "hh_01J8HOUSEHOLD",
            notify_advisor_id: "adv_01J8ADVISOR",
          },
        },
        responseExample: {
          id: "wfr_01J8RUN",
          workflow: "annual_review",
          status: "queued",
        },
      },
      {
        id: "create-follow-up-task",
        method: "POST",
        path: "/workflows/tasks",
        title: "Create follow-up task",
        summary: "Create an advisor follow-up from an approved recommendation.",
        status: "Planned",
        requestBody: {
          example: {
            recommendation_id: "rec_01J8FUNDING",
            due_at: "2026-08-01T17:00:00Z",
            assignee_id: "adv_01J8ADVISOR",
          },
        },
        responseExample: {
          id: "task_01J8TASK",
          status: "open",
          due_at: "2026-08-01T17:00:00Z",
        },
      },
    ],
  },
  {
    slug: "reports",
    title: "Reports",
    summary: "Client-ready and advisor meeting reports.",
    status: "Planned",
    endpoints: [
      {
        id: "create-report",
        method: "POST",
        path: "/reports",
        title: "Generate report",
        summary: "Generate a client or advisor report from approved recommendations.",
        status: "Planned",
        requestBody: {
          example: {
            household_id: "hh_01J8HOUSEHOLD",
            policy_ids: ["pol_01J8POLICY"],
            audience: "client",
            include_only_approved_recommendations: true,
          },
        },
        responseExample: {
          id: "rpt_01J8REPORT",
          status: "ready",
          download_url: "https://api.policywell.ai/v1/reports/rpt_01J8REPORT.pdf",
        },
      },
      {
        id: "get-report",
        method: "GET",
        path: "/reports/{report_id}",
        title: "Retrieve report",
        summary: "Fetch report metadata and download link.",
        status: "Planned",
        params: [
          {
            name: "report_id",
            in: "path",
            type: "string",
            required: true,
            description: "Report ID.",
          },
        ],
        responseExample: {
          id: "rpt_01J8REPORT",
          status: "ready",
          audience: "client",
          created_at: "2026-07-23T12:40:00Z",
        },
      },
    ],
  },
  {
    slug: "batch",
    title: "Batch jobs",
    summary: "Enterprise batch ingestion and analysis for carriers and IMOs.",
    status: "Planned",
    endpoints: [
      {
        id: "create-batch-job",
        method: "POST",
        path: "/batch/jobs",
        title: "Create batch job",
        summary: "Queue a batch document ingest or portfolio analysis job.",
        status: "Planned",
        requestBody: {
          example: {
            type: "document_ingest",
            source: {
              type: "s3",
              bucket: "carrier-exports",
              prefix: "illustrations/2026-07/",
            },
            organization_id: "org_01J8IMO",
          },
        },
        responseExample: {
          id: "job_01J8BATCH",
          type: "document_ingest",
          status: "queued",
          created_at: "2026-07-23T12:45:00Z",
        },
      },
      {
        id: "get-batch-job",
        method: "GET",
        path: "/batch/jobs/{job_id}",
        title: "Retrieve batch job",
        summary: "Check batch progress and error summary.",
        status: "Planned",
        params: [
          {
            name: "job_id",
            in: "path",
            type: "string",
            required: true,
            description: "Batch job ID.",
          },
        ],
        responseExample: {
          id: "job_01J8BATCH",
          status: "running",
          progress: { processed: 420, failed: 3, total: 1000 },
        },
      },
    ],
  },
  {
    slug: "businesses",
    title: "Businesses",
    summary: "Commercial business profiles for risk and underwriting context.",
    status: "Preview",
    endpoints: [
      {
        id: "create-business",
        method: "POST",
        path: "/businesses",
        title: "Create business",
        summary: "Create a commercial business profile.",
        status: "Preview",
        requestBody: {
          example: {
            legal_name: "Harbor Fabrication LLC",
            naics: "332710",
            state: "TX",
            annual_revenue: 2400000,
            employee_count: 28,
          },
        },
        responseExample: {
          id: "biz_01J8HARBOR",
          status: "active",
          legal_name: "Harbor Fabrication LLC",
          confidence: 0.78,
          missing_requirements: ["workers_compensation_policy"],
          human_review_status: "pending",
          created_at: "2026-07-24T12:00:00Z",
          updated_at: "2026-07-24T12:00:00Z",
          model_version: "commercial-risk-0.1",
          rules_version: "commercial-rules-2026-07",
          audit_reference: "aud_01J8BIZ",
        },
      },
      {
        id: "get-business",
        method: "GET",
        path: "/businesses/{businessId}",
        title: "Retrieve business",
        summary: "Fetch a business profile and derived commercial context.",
        status: "Preview",
        params: [
          {
            name: "businessId",
            in: "path",
            type: "string",
            required: true,
            description: "Business ID.",
          },
        ],
        responseExample: {
          id: "biz_01J8HARBOR",
          status: "active",
          verified_facts: { naics: "332710", state: "TX" },
          derived_signals: { renewal_within_days: 48 },
          confidence: 0.78,
          assumptions: [
            "Decision support only - not a bindable underwriting decision",
          ],
          missing_requirements: ["workers_compensation_policy"],
          human_review_status: "pending",
        },
      },
    ],
  },
  {
    slug: "commercial",
    title: "Commercial risk",
    summary:
      "Commercial document ingest, policy analysis, and risk assessment.",
    status: "Preview",
    endpoints: [
      {
        id: "create-commercial-document",
        method: "POST",
        path: "/commercial/documents",
        title: "Ingest commercial document",
        summary:
          "Upload loss runs, certificates, schedules, payroll, or commercial policies.",
        status: "Preview",
        requestBody: {
          example: {
            business_id: "biz_01J8HARBOR",
            filename: "loss-runs-2021-2025.pdf",
            content_type: "application/pdf",
            document_kind: "loss_run",
          },
        },
        responseExample: {
          id: "doc_01J8LOSS",
          status: "extracted",
          source_document_ids: ["doc_01J8LOSS"],
          confidence: 0.74,
          missing_requirements: [],
          human_review_status: "pending",
          created_at: "2026-07-24T12:05:00Z",
        },
      },
      {
        id: "analyze-commercial-policy",
        method: "POST",
        path: "/commercial/policies/analyze",
        title: "Analyze commercial policy",
        summary: "Extract limits, deductibles, and coverage signals.",
        status: "Preview",
        requestBody: {
          example: {
            business_id: "biz_01J8HARBOR",
            document_id: "doc_01J8GL",
          },
        },
        responseExample: {
          id: "anl_01J8CGL",
          status: "complete",
          verified_facts: { line: "general_liability", limit: 1000000 },
          derived_signals: { adequacy_band: "primary_present" },
          confidence: 0.81,
          explanations: [
            {
              label: "Limit present",
              rationale: "GL occurrence limit extracted from declarations",
            },
          ],
          human_review_status: "pending",
        },
      },
      {
        id: "assess-commercial-risk",
        method: "POST",
        path: "/commercial/risks/assess",
        title: "Assess commercial risk",
        summary:
          "Compute Overall Risk, Coverage Adequacy, Underinsured, and Business Health scores.",
        status: "Preview",
        requestBody: {
          example: { business_id: "biz_01J8HARBOR" },
        },
        responseExample: {
          id: "risk_01J8HARBOR",
          status: "complete",
          overall_risk_score: 61,
          coverage_adequacy_score: 54,
          underinsured_score: 52,
          business_health_score: 68,
          confidence: 0.78,
          missing_requirements: ["workers_compensation_policy"],
          assumptions: [
            "Scores are decision support, not carrier underwriting decisions",
          ],
          human_review_status: "pending",
          model_version: "commercial-risk-0.1",
          rules_version: "commercial-rules-2026-07",
          audit_reference: "aud_01J8RISK",
        },
      },
      {
        id: "get-commercial-risk",
        method: "GET",
        path: "/commercial/risks/{riskId}",
        title: "Retrieve commercial risk assessment",
        summary: "Fetch a prior commercial risk assessment.",
        status: "Preview",
        params: [
          {
            name: "riskId",
            in: "path",
            type: "string",
            required: true,
            description: "Risk assessment ID.",
          },
        ],
        responseExample: {
          id: "risk_01J8HARBOR",
          status: "complete",
          overall_risk_score: 61,
          confidence: 0.78,
        },
      },
      {
        id: "analyze-loss-runs",
        method: "POST",
        path: "/loss-runs/analyze",
        title: "Analyze loss runs",
        summary: "Structure claims frequency, severity, and open reserves.",
        status: "Preview",
        requestBody: {
          example: {
            business_id: "biz_01J8HARBOR",
            document_id: "doc_01J8LOSS",
          },
        },
        responseExample: {
          id: "loss_anl_01J8",
          status: "complete",
          verified_facts: { claim_count: 2, total_incurred: 27700 },
          derived_signals: { frequency_band: "moderate" },
          confidence: 0.76,
          human_review_status: "pending",
        },
      },
    ],
  },
  {
    slug: "underwriting",
    title: "Underwriting intelligence",
    summary:
      "Preliminary underwriting cases and evaluation - decision support only.",
    status: "Preview",
    endpoints: [
      {
        id: "create-underwriting-case",
        method: "POST",
        path: "/underwriting/cases",
        title: "Create underwriting case",
        summary: "Open a personal or commercial preliminary underwriting case.",
        status: "Preview",
        requestBody: {
          example: {
            entity_kind: "commercial",
            business_id: "biz_01J8HARBOR",
          },
        },
        responseExample: {
          id: "uw_01J8CASE",
          status: "intake",
          human_review_status: "pending",
          confidence: 0.6,
          created_at: "2026-07-24T12:10:00Z",
        },
        notes: [
          "Not a bindable quote or final underwriting decision.",
          "Enterprise availability may require dedicated tenant configuration.",
        ],
      },
      {
        id: "get-underwriting-case",
        method: "GET",
        path: "/underwriting/cases/{caseId}",
        title: "Retrieve underwriting case",
        summary: "Fetch case status, missing requirements, and explanations.",
        status: "Preview",
        params: [
          {
            name: "caseId",
            in: "path",
            type: "string",
            required: true,
            description: "Underwriting case ID.",
          },
        ],
        responseExample: {
          id: "uw_01J8CASE",
          status: "needs_evidence",
          preliminary_risk_tier: "refer",
          missing_requirements: ["workers_compensation_policy"],
          human_review_status: "pending",
        },
      },
      {
        id: "evaluate-underwriting-case",
        method: "POST",
        path: "/underwriting/cases/{caseId}/evaluate",
        title: "Evaluate underwriting case",
        summary:
          "Produce preliminary risk tier, pathway, and evidence checklist.",
        status: "Preview",
        params: [
          {
            name: "caseId",
            in: "path",
            type: "string",
            required: true,
            description: "Underwriting case ID.",
          },
        ],
        responseExample: {
          id: "uw_01J8CASE",
          status: "ready_for_review",
          preliminary_risk_tier: "standard",
          likely_pathway: "Producer completion → standard carrier submission",
          confidence: 0.71,
          assumptions: [
            "Preliminary intelligence only - carrier underwriter decides",
          ],
          human_review_status: "pending",
          model_version: "uw-intel-0.1",
          rules_version: "uw-rules-2026-07",
          audit_reference: "aud_01J8UW",
        },
      },
    ],
  },
  {
    slug: "carrier-appetite",
    title: "Carrier appetite",
    summary: "Appetite matching and carrier appetite profiles.",
    status: "Preview",
    endpoints: [
      {
        id: "match-carrier-appetite",
        method: "POST",
        path: "/carrier-appetite/match",
        title: "Match carrier appetite",
        summary:
          "Return explainable appetite fits with evidence requirements and non-fit reasons.",
        status: "Preview",
        requestBody: {
          example: {
            business_id: "biz_01J8HARBOR",
            lines: ["general_liability", "workers_compensation"],
          },
        },
        responseExample: {
          id: "match_01J8",
          status: "complete",
          matches: [
            {
              carrier: "Harbor Mutual (illustrative)",
              appetite_fit: "moderate",
              confidence: 0.58,
              estimated_premium_range: null,
              required_evidence: ["loss_runs_5yr", "payroll_report"],
            },
          ],
          human_review_status: "pending",
        },
        notes: [
          "Premium ranges are omitted unless grounded rating inputs exist.",
          "Never treat matches as guaranteed eligibility.",
        ],
      },
      {
        id: "get-carrier-appetite",
        method: "GET",
        path: "/carriers/{carrierId}/appetite",
        title: "Retrieve carrier appetite profile",
        summary: "Fetch a normalized appetite profile for a carrier.",
        status: "Planned",
        params: [
          {
            name: "carrierId",
            in: "path",
            type: "string",
            required: true,
            description: "Carrier ID.",
          },
        ],
        responseExample: {
          id: "carrier_01J8",
          status: "planned",
          appetite: [],
          data_freshness: null,
        },
      },
      {
        id: "report-commercial-risk",
        method: "POST",
        path: "/reports/commercial-risk",
        title: "Generate commercial risk report",
        summary: "Produce a Commercial Risk Report with verified vs derived sections.",
        status: "Preview",
        requestBody: {
          example: { business_id: "biz_01J8HARBOR", risk_id: "risk_01J8HARBOR" },
        },
        responseExample: {
          id: "rpt_01J8CRISK",
          status: "ready",
          download_url: null,
          human_review_status: "pending",
        },
      },
      {
        id: "report-preliminary-underwriting",
        method: "POST",
        path: "/reports/preliminary-underwriting",
        title: "Generate preliminary underwriting report",
        summary:
          "Produce a Preliminary Underwriting Report clearly labeled as decision support.",
        status: "Preview",
        requestBody: {
          example: { case_id: "uw_01J8CASE" },
        },
        responseExample: {
          id: "rpt_01J8UW",
          status: "ready",
          disclaimer:
            "Not a bindable quote, eligibility guarantee, or carrier decision.",
          human_review_status: "pending",
        },
      },
    ],
  },
] as const;

export function getApiGroup(slug: string): ApiGroup | undefined {
  return API_GROUPS.find((g) => g.slug === slug);
}

export function allApiEndpoints(): ApiEndpoint[] {
  return API_GROUPS.flatMap((g) => [...g.endpoints]);
}

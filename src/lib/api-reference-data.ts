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
    "REST endpoints for PolicyWell insurance intelligence — policies, documents, analysis, recommendations, webhooks, and enterprise workflows.",
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
] as const;

export function getApiGroup(slug: string): ApiGroup | undefined {
  return API_GROUPS.find((g) => g.slug === slug);
}

export function allApiEndpoints(): ApiEndpoint[] {
  return API_GROUPS.flatMap((g) => [...g.endpoints]);
}

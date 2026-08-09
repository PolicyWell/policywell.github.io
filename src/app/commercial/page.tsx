"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IntelligenceModes } from "@/components/IntelligenceModes";
import { AppNav, ConfidenceBadge } from "@/components/ui";
import {
  buildAccountWorkspace,
  patchDiligenceOnAccount,
  uploadCommercialFiles,
} from "@/lib/commercial-account";
import {
  COMMERCIAL_DOC_LABELS,
  COMMERCIAL_WORKSPACE_TABS,
  LOB_LABELS,
  type CommercialAccount,
  type CommercialDocClassification,
  type CommercialWorkspaceTab,
  type DiligenceStatus,
} from "@/lib/commercial-types";
import { isAcceptedCommercialUpload } from "@/lib/commercial-extraction";
import { buildCommercialDemoAccount } from "@/lib/commercial-seed";
import { tasksFromCommercialSignals } from "@/lib/tasks";
import {
  persistCommercialAccount,
  persistTasks,
  useCommercialAccounts,
  useActiveCommercialAccountId,
  useSession,
  useTasks,
} from "@/lib/use-workspace";

function money(n: number | null | undefined) {
  if (n == null) return "—";
  return `$${n.toLocaleString()}`;
}

function readinessTone(label: string) {
  if (label === "ready_for_review") return "text-ok";
  if (label === "nearly_ready") return "text-pine";
  if (label === "needs_work") return "text-amber-water";
  return "text-danger";
}

export default function CommercialAccountWorkspacePage() {
  const session = useSession();
  const tasks = useTasks();
  const accounts = useCommercialAccounts();
  const activeId = useActiveCommercialAccountId();
  const [tab, setTab] = useState<CommercialWorkspaceTab>("overview");
  const [status, setStatus] = useState("");
  const [dragging, setDragging] = useState(false);

  const stored = useMemo(() => {
    if (!accounts.length) return null;
    return accounts.find((a) => a.id === activeId) ?? accounts[0];
  }, [accounts, activeId]);

  const [account, setAccount] = useState<CommercialAccount | null>(null);

  useEffect(() => {
    if (stored) setAccount(stored);
  }, [stored]);

  const workspace = useMemo(
    () => (account ? buildAccountWorkspace(account) : null),
    [account],
  );

  if (!session) {
    return (
      <div className="pw-shell py-20">
        <p className="text-stone">
          Please{" "}
          <Link href="/login" className="underline">
            sign in
          </Link>{" "}
          to open PolicyWell Commercial.
        </p>
      </div>
    );
  }

  function loadDemo() {
    const demo = buildCommercialDemoAccount(session!.id);
    setAccount(demo);
    persistCommercialAccount(demo);
    setStatus("Loaded Harbor Fabrication commercial account.");
    setTab("overview");
  }

  function save(next: CommercialAccount) {
    const refreshed = buildAccountWorkspace(next).account;
    setAccount(refreshed);
    persistCommercialAccount(refreshed);
  }

  async function onFiles(fileList: FileList | null) {
    if (!account || !fileList?.length) return;
    const accepted: { filename: string; mimeType?: string; rawText?: string }[] =
      [];
    for (const file of Array.from(fileList)) {
      if (!isAcceptedCommercialUpload(file.name)) {
        setStatus(`Skipped unsupported type: ${file.name}`);
        continue;
      }
      let rawText: string | undefined;
      if (
        file.type.startsWith("text/") ||
        file.name.toLowerCase().endsWith(".csv") ||
        file.name.toLowerCase().endsWith(".eml")
      ) {
        rawText = await file.text();
      }
      accepted.push({
        filename: file.name,
        mimeType: file.type || undefined,
        rawText,
      });
    }
    if (!accepted.length) return;
    const next = uploadCommercialFiles(account, accepted, session!.id);
    save(next);
    setStatus(`Uploaded ${accepted.length} private document(s).`);
    setTab("documents");
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AppNav role={session.role} />
      <main className="pw-shell py-8 md:py-10 space-y-6">
        <header className="space-y-3 animate-rise">
          <p className="text-xs uppercase tracking-[0.2em] text-moss">
            PolicyWell Commercial
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl md:text-4xl text-pine">
                {account?.companyName ?? "Commercial Account Workspace"}
              </h1>
              <p className="text-stone mt-2">
                Raw client files in. Market-ready submission out. Quotes in.
                Client-ready proposal out — with licensed-broker approval on
                consequential decisions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {workspace && (
                <ConfidenceBadge
                  value={workspace.account.readiness.score / 100}
                />
              )}
              <button
                type="button"
                className="pw-btn !py-2 !px-3 text-xs"
                onClick={loadDemo}
              >
                {account ? "Reload Harbor Fab demo" : "Load Harbor Fab demo"}
              </button>
              <Link href="/agent" className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs">
                Ask the agent
              </Link>
              <Link href="/upload" className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs">
                Household upload
              </Link>
            </div>
          </div>
          <IntelligenceModes active="commercial" />
        </header>

        {!account || !workspace ? (
          <section className="pw-panel p-8 text-center space-y-3 animate-rise">
            <p className="text-stone max-w-xl mx-auto">
              Load a commercial account to open the workspace: diligence,
              documents, program aggregation, and readiness for broker review.
            </p>
            <button type="button" className="pw-btn" onClick={loadDemo}>
              Load Harbor Fabrication demo
            </button>
          </section>
        ) : (
          <>
            <AccountMetaBar account={workspace.account} />

            <nav
              className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 animate-rise-delay"
              aria-label="Commercial workspace"
            >
              {COMMERCIAL_WORKSPACE_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    tab === t.id
                      ? "bg-pine text-foam border-pine"
                      : "bg-white/50 text-stone border-pine/15 hover:border-pine/40"
                  }`}
                >
                  {t.label}
                  {!t.v1 ? (
                    <span className="ml-1 opacity-70">· soon</span>
                  ) : null}
                </button>
              ))}
            </nav>

            {status ? (
              <p className="text-xs text-moss animate-rise">{status}</p>
            ) : null}

            {tab === "overview" && (
              <OverviewTab
                workspace={workspace}
                onOpenTab={setTab}
                onGenerateTasks={() => {
                  persistTasks(
                    tasksFromCommercialSignals({
                      gaps: workspace.riskSnapshot.gaps,
                      renewalWithinDays:
                        workspace.riskSnapshot.business.renewalWithinDays,
                      certificatesExpiringSoon:
                        workspace.riskSnapshot.business.certificatesExpiringSoon,
                      missingRequirements: workspace.account.diligenceItems
                        .filter((i) => i.status === "open")
                        .map((i) => i.title),
                      existing: tasks,
                    }),
                  );
                  setStatus("Generated follow-up tasks from commercial signals.");
                  setTab("tasks");
                }}
              />
            )}

            {tab === "documents" && (
              <DocumentsTab
                account={workspace.account}
                dragging={dragging}
                setDragging={setDragging}
                onFiles={onFiles}
                onClassify={(docId, classification) => {
                  const documents = workspace.account.documents.map((d) =>
                    d.id === docId ? { ...d, classification } : d,
                  );
                  save(
                    buildAccountWorkspace({
                      ...workspace.account,
                      documents,
                    }).account,
                  );
                }}
              />
            )}

            {tab === "policies" && (
              <PoliciesTab account={workspace.account} />
            )}

            {tab === "exposures" && (
              <ExposuresTab account={workspace.account} />
            )}

            {tab === "losses" && <LossesTab account={workspace.account} />}

            {tab === "diligence" && (
              <DiligenceTab
                account={workspace.account}
                onPatch={(id, patch) => {
                  save(patchDiligenceOnAccount(workspace.account, id, patch));
                }}
              />
            )}

            {tab === "coverage" && (
              <CoverageTab workspace={workspace} />
            )}

            {(tab === "submission" ||
              tab === "markets" ||
              tab === "quotes" ||
              tab === "proposal") && (
              <section className="pw-panel p-6 space-y-2">
                <h2 className="font-display text-xl text-pine capitalize">
                  {tab}
                </h2>
                <p className="text-stone text-sm">
                  Planned for a later Commercial sprint. V1 focuses on account
                  workspace, private document ingest, provenanced extraction,
                  diligence readiness, and program aggregation — preserving
                  licensed-broker approval for consequential decisions.
                </p>
              </section>
            )}

            {tab === "tasks" && (
              <section className="pw-panel p-5 space-y-3">
                <h2 className="font-display text-xl text-pine">Tasks</h2>
                <p className="text-sm text-stone">
                  Commercial signals can generate firm follow-up tasks. Full task
                  board remains at{" "}
                  <Link href="/tasks" className="underline">
                    /tasks
                  </Link>
                  .
                </p>
                <button
                  type="button"
                  className="pw-btn !py-2 !px-3 text-xs"
                  onClick={() => {
                    persistTasks(
                      tasksFromCommercialSignals({
                        gaps: workspace.riskSnapshot.gaps,
                        renewalWithinDays:
                          workspace.riskSnapshot.business.renewalWithinDays,
                        certificatesExpiringSoon:
                          workspace.riskSnapshot.business
                            .certificatesExpiringSoon,
                        missingRequirements: workspace.account.diligenceItems
                          .filter((i) => i.status === "open")
                          .map((i) => i.title),
                        existing: tasks,
                      }),
                    );
                    setStatus("Tasks generated.");
                  }}
                >
                  Generate tasks from diligence & gaps
                </button>
                <ul className="space-y-2 text-sm">
                  {tasks.slice(0, 8).map((t) => (
                    <li
                      key={t.id}
                      className="border-b border-pine/10 pb-2 text-stone"
                    >
                      <span className="text-pine font-medium">{t.title}</span>
                      {" · "}
                      {t.dueDate}
                    </li>
                  ))}
                  {!tasks.length && (
                    <li className="text-stone">No tasks yet.</li>
                  )}
                </ul>
              </section>
            )}

            {tab === "activity" && (
              <section className="pw-panel p-5 space-y-3">
                <h2 className="font-display text-xl text-pine">Activity</h2>
                <ul className="space-y-3 text-sm">
                  {workspace.activity.map((a) => (
                    <li key={a.id} className="border-b border-pine/10 pb-2">
                      <p className="text-pine">{a.label}</p>
                      <p className="text-[11px] text-moss">
                        {new Date(a.at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {tab === "renewal" && (
              <section className="pw-panel p-5 space-y-3">
                <h2 className="font-display text-xl text-pine">Renewal</h2>
                <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-stone">Renewal date</dt>
                    <dd className="text-pine font-medium">
                      {workspace.account.renewalDate ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-stone">Current premium</dt>
                    <dd>{money(workspace.overview.annualPremium)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-stone">Readiness</dt>
                    <dd
                      className={readinessTone(
                        workspace.account.readiness.label,
                      )}
                    >
                      {workspace.account.readiness.score}/100 ·{" "}
                      {workspace.account.readiness.label.replace(/_/g, " ")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-stone">Open diligence</dt>
                    <dd>{workspace.overview.missingDiligenceItems}</dd>
                  </div>
                </dl>
                <p className="text-xs text-stone">
                  {workspace.account.readiness.disclaimer}
                </p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function AccountMetaBar({ account }: { account: CommercialAccount }) {
  return (
    <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm animate-rise">
      <Meta label="Industry" value={account.industry} />
      <Meta label="Headquarters" value={account.headquarters} />
      <Meta label="Producer" value={account.assignedProducer ?? "—"} />
      <Meta label="Account manager" value={account.accountManager ?? "—"} />
      <Meta label="Status" value={account.accountStatus.replace(/_/g, " ")} />
      <Meta
        label="Employees"
        value={account.employeeCount?.toLocaleString() ?? "—"}
      />
      <Meta label="Annual revenue" value={money(account.annualRevenue)} />
      <Meta
        label="Last updated"
        value={new Date(account.lastUpdated).toLocaleString()}
      />
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="pw-panel px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-moss">{label}</p>
      <p className="text-pine mt-1">{value}</p>
    </div>
  );
}

function OverviewTab({
  workspace,
  onOpenTab,
  onGenerateTasks,
}: {
  workspace: NonNullable<ReturnType<typeof buildAccountWorkspace>>;
  onOpenTab: (t: CommercialWorkspaceTab) => void;
  onGenerateTasks: () => void;
}) {
  const { overview, account } = workspace;
  return (
    <div className="space-y-5 animate-rise">
      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        <Stat
          label="Existing policies"
          value={String(overview.existingPolicies)}
          onClick={() => onOpenTab("policies")}
        />
        <Stat
          label="Annual premium"
          value={money(overview.annualPremium)}
          onClick={() => onOpenTab("policies")}
        />
        <Stat
          label="Renewal date"
          value={overview.renewalDate ?? "—"}
          onClick={() => onOpenTab("renewal")}
        />
        <Stat
          label="Account readiness"
          value={`${overview.accountReadiness.score}/100`}
          hint={overview.accountReadiness.label.replace(/_/g, " ")}
          tone={readinessTone(overview.accountReadiness.label)}
          onClick={() => onOpenTab("diligence")}
        />
        <Stat
          label="Missing diligence items"
          value={String(overview.missingDiligenceItems)}
          onClick={() => onOpenTab("diligence")}
        />
        <Stat
          label="Potential coverage issues"
          value={String(overview.potentialCoverageIssues.length)}
          onClick={() => onOpenTab("coverage")}
        />
        <Stat
          label="Unresolved loss-run discrepancies"
          value={String(overview.unresolvedLossRunDiscrepancies)}
          onClick={() => onOpenTab("losses")}
        />
        <Stat
          label="Documents on file"
          value={String(account.documents.length)}
          onClick={() => onOpenTab("documents")}
        />
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="pw-panel p-5 space-y-3">
          <h2 className="font-display text-xl text-pine">Readiness detail</h2>
          <p className={`text-3xl font-display ${readinessTone(account.readiness.label)}`}>
            {account.readiness.score}
            <span className="text-lg text-stone"> / 100</span>
          </p>
          <ul className="text-sm text-stone space-y-1">
            {account.readiness.explanations.map((e) => (
              <li key={e}>· {e}</li>
            ))}
          </ul>
          <p className="text-[11px] text-moss">{account.readiness.disclaimer}</p>
        </div>
        <div className="pw-panel p-5 space-y-3">
          <h2 className="font-display text-xl text-pine">
            Potential coverage issues
          </h2>
          {overview.potentialCoverageIssues.length ? (
            <ul className="space-y-2 text-sm">
              {overview.potentialCoverageIssues.map((issue) => (
                <li
                  key={issue}
                  className="border-b border-pine/10 pb-2 text-stone"
                >
                  {issue}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ok">No coverage issues flagged.</p>
          )}
          <button
            type="button"
            className="pw-btn pw-btn-secondary !py-2 !px-3 text-xs"
            onClick={onGenerateTasks}
          >
            Generate tasks
          </button>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
  onClick,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pw-panel p-4 text-left hover:border-pine/30 transition-colors"
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-moss">{label}</p>
      <p className={`font-display text-2xl mt-2 ${tone ?? "text-pine"}`}>
        {value}
      </p>
      {hint ? <p className="text-[11px] text-stone mt-1 capitalize">{hint}</p> : null}
    </button>
  );
}

function DocumentsTab({
  account,
  dragging,
  setDragging,
  onFiles,
  onClassify,
}: {
  account: CommercialAccount;
  dragging: boolean;
  setDragging: (v: boolean) => void;
  onFiles: (files: FileList | null) => void;
  onClassify: (id: string, c: CommercialDocClassification) => void;
}) {
  return (
    <div className="space-y-5 animate-rise">
      <section
        className={`pw-panel p-6 border-dashed ${
          dragging ? "border-pine bg-sage/20" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
      >
        <h2 className="font-display text-xl text-pine">Document upload</h2>
        <p className="text-sm text-stone mt-1">
          PDF, DOCX, XLSX, CSV, PNG/JPG, and email (.eml). Files are stored
          privately (metadata + private storage path).
        </p>
        <label className="pw-btn inline-flex mt-4 !py-2 !px-3 text-xs cursor-pointer">
          Choose files
          <input
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg,.eml,application/pdf,text/csv,image/*"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
      </section>

      <section className="pw-panel p-5 space-y-3">
        <h2 className="font-display text-xl text-pine">On file</h2>
        <ul className="space-y-3">
          {account.documents.map((d) => (
            <li
              key={d.id}
              className="rounded-xl border border-pine/10 bg-white/50 p-3 text-sm space-y-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-pine">{d.filename}</p>
                  <p className="text-[11px] text-moss mt-1">
                    Private · {d.sourceChannel} · confidence{" "}
                    {Math.round(d.overallConfidence * 100)}%
                    {d.pageCount ? ` · ${d.pageCount} page(s)` : ""}
                  </p>
                </div>
                <select
                  className="pw-input !py-1 !text-xs max-w-[12rem]"
                  value={d.classification}
                  onChange={(e) =>
                    onClassify(
                      d.id,
                      e.target.value as CommercialDocClassification,
                    )
                  }
                >
                  {Object.entries(COMMERCIAL_DOC_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <details className="text-xs text-stone">
                <summary className="cursor-pointer text-moss">
                  Extracted fields (provenanced)
                </summary>
                <ul className="mt-2 space-y-2">
                  {Object.entries(d.extractedFields).map(([key, field]) => (
                    <li key={key} className="border-t border-pine/10 pt-2">
                      <span className="text-pine font-medium">{key}</span>:{" "}
                      {field.value == null ? (
                        <em>missing (not invented)</em>
                      ) : (
                        String(field.value)
                      )}
                      <br />
                      conf {Math.round(field.confidence * 100)}%
                      {field.pageNumber != null
                        ? ` · page ${field.pageNumber}`
                        : ""}
                      {field.sourceExcerpt
                        ? ` · “${field.sourceExcerpt}”`
                        : ""}
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PoliciesTab({ account }: { account: CommercialAccount }) {
  const onFile = account.coverages.filter((c) => c.status !== "not_on_file");
  return (
    <section className="pw-panel p-5 space-y-4 animate-rise">
      <div>
        <h2 className="font-display text-xl text-pine">
          Existing policy aggregation
        </h2>
        <p className="text-sm text-stone mt-1">
          Normalized commercial program. Each material field retains source
          document, page (when known), confidence, and excerpt.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[720px]">
          <thead className="text-[11px] uppercase tracking-wider text-moss border-b border-pine/15">
            <tr>
              <th className="py-2 pr-3 font-medium">Coverage</th>
              <th className="py-2 pr-3 font-medium">Carrier</th>
              <th className="py-2 pr-3 font-medium">Limit</th>
              <th className="py-2 pr-3 font-medium">Deductible</th>
              <th className="py-2 pr-3 font-medium">Premium</th>
              <th className="py-2 pr-3 font-medium">Dates</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {account.coverages.map((c) => (
              <tr key={c.id} className="border-b border-pine/10 align-top">
                <td className="py-3 pr-3 text-pine font-medium">{c.label}</td>
                <td className="py-3 pr-3">
                  {c.carrier.value ?? "—"}
                  {c.carrier.sourceExcerpt ? (
                    <p className="text-[10px] text-moss mt-1 max-w-[10rem]">
                      {c.carrier.sourceExcerpt}
                    </p>
                  ) : null}
                </td>
                <td className="py-3 pr-3">{money(c.occurrenceLimit.value)}</td>
                <td className="py-3 pr-3">{money(c.deductible.value)}</td>
                <td className="py-3 pr-3">{money(c.annualPremium.value)}</td>
                <td className="py-3 pr-3 text-stone">
                  {c.effectiveDate.value ?? "—"}
                  <br />
                  {c.expirationDate.value ?? "—"}
                </td>
                <td className="py-3 capitalize">
                  {c.status.replace(/_/g, " ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone">
        {onFile.length} coverages on file · program premium{" "}
        {money(account.currentPremium)}
      </p>
    </section>
  );
}

function ExposuresTab({ account }: { account: CommercialAccount }) {
  return (
    <section className="pw-panel p-5 space-y-4 animate-rise">
      <h2 className="font-display text-xl text-pine">Exposures</h2>
      <dl className="grid sm:grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs text-stone">Annual revenue</dt>
          <dd>{money(account.annualRevenue)}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone">Employees</dt>
          <dd>{account.employeeCount ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone">Locations</dt>
          <dd>{account.locations.length}</dd>
        </div>
      </dl>
      <ul className="grid md:grid-cols-2 gap-3 text-sm">
        {account.locations.map((loc) => (
          <li key={loc.id} className="rounded-xl border border-pine/10 p-3">
            <p className="font-medium text-pine">{loc.label}</p>
            <p className="text-stone mt-1">
              {loc.address}, {loc.city}, {loc.state} {loc.zip}
            </p>
            <p className="text-[11px] text-moss mt-1">
              Employees {loc.employees ?? "—"} · Sq ft{" "}
              {loc.squareFootage?.toLocaleString() ?? "—"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LossesTab({ account }: { account: CommercialAccount }) {
  return (
    <div className="grid lg:grid-cols-2 gap-5 animate-rise">
      <section className="pw-panel p-5 space-y-3">
        <h2 className="font-display text-xl text-pine">Loss history</h2>
        <ul className="space-y-3 text-sm">
          {account.lossHistory.map((l) => (
            <li key={l.id}>
              <p className="text-pine font-medium">
                {l.date} · {String(l.line).replace(/_/g, " ")}
              </p>
              <p className="text-stone">
                {l.description}
                {l.amount != null ? ` · $${l.amount.toLocaleString()}` : ""} ·{" "}
                {l.status}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section className="pw-panel p-5 space-y-3">
        <h2 className="font-display text-xl text-pine">
          Loss-run discrepancies
        </h2>
        <ul className="space-y-3 text-sm">
          {account.lossRunDiscrepancies.map((d) => (
            <li key={d.id} className="rounded-xl border border-pine/10 p-3">
              <p className="text-pine font-medium">{d.title}</p>
              <p className="text-stone mt-1">{d.description}</p>
              <p className="text-[11px] text-moss mt-2 capitalize">{d.status}</p>
            </li>
          ))}
          {!account.lossRunDiscrepancies.length && (
            <li className="text-ok">No unresolved discrepancies.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function DiligenceTab({
  account,
  onPatch,
}: {
  account: CommercialAccount;
  onPatch: (
    id: string,
    patch: {
      status?: DiligenceStatus;
      assignedUserName?: string | null;
      dueDate?: string | null;
      resolutionNotes?: string | null;
    },
  ) => void;
}) {
  return (
    <div className="space-y-5 animate-rise">
      <section className="pw-panel p-5 space-y-2">
        <h2 className="font-display text-xl text-pine">
          Account readiness score
        </h2>
        <p
          className={`font-display text-4xl ${readinessTone(account.readiness.label)}`}
        >
          {account.readiness.score}
          <span className="text-lg text-stone"> / 100</span>
        </p>
        <p className="text-sm text-stone capitalize">
          {account.readiness.label.replace(/_/g, " ")}
        </p>
        <p className="text-[11px] text-moss">{account.readiness.disclaimer}</p>
      </section>

      <section className="pw-panel p-5 space-y-3">
        <h2 className="font-display text-xl text-pine">Diligence checklist</h2>
        <ul className="space-y-3">
          {account.diligenceItems.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-pine/10 p-3 text-sm space-y-2"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-moss">
                    {item.severity} · {item.category.replace(/_/g, " ")}
                  </p>
                  <p className="font-medium text-pine mt-1">{item.title}</p>
                  <p className="text-stone mt-1">{item.description}</p>
                  <p className="text-[11px] text-moss mt-2">
                    Source: {item.source}
                    {item.dueDate ? ` · Due ${item.dueDate}` : ""}
                    {item.assignedUserName
                      ? ` · Assigned ${item.assignedUserName}`
                      : ""}
                  </p>
                </div>
                <select
                  className="pw-input !py-1 !text-xs h-fit"
                  value={item.status}
                  onChange={(e) =>
                    onPatch(item.id, {
                      status: e.target.value as DiligenceStatus,
                    })
                  }
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="waived">Waived</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <input
                className="pw-input !text-xs"
                placeholder="Resolution notes"
                defaultValue={item.resolutionNotes ?? ""}
                onBlur={(e) =>
                  onPatch(item.id, {
                    resolutionNotes: e.target.value || null,
                  })
                }
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function CoverageTab({
  workspace,
}: {
  workspace: NonNullable<ReturnType<typeof buildAccountWorkspace>>;
}) {
  const { gaps, scores } = workspace.riskSnapshot;
  return (
    <div className="space-y-5 animate-rise">
      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        {(
          [
            ["overallRiskScore", "Overall risk"],
            ["coverageAdequacyScore", "Coverage adequacy"],
            ["underinsuredScore", "Underinsured"],
            ["businessHealthScore", "Business health"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="pw-panel p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-moss">
              {label}
            </p>
            <p className="font-display text-3xl text-pine mt-2">
              {scores[key]}
            </p>
          </div>
        ))}
      </section>
      <section className="pw-panel p-5 space-y-3">
        <h2 className="font-display text-xl text-pine">Coverage gaps</h2>
        <p className="text-xs text-stone">
          Decision-support only. Licensed brokers approve consequential
          recommendations before client or market delivery.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {gaps.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-pine/10 bg-white/60 p-4"
            >
              <p className="text-[11px] uppercase tracking-wider text-moss">
                {g.severity} · {LOB_LABELS[g.line]}
              </p>
              <p className="font-medium text-pine mt-1">{g.title}</p>
              <p className="text-sm text-stone mt-1">{g.rationale}</p>
            </div>
          ))}
          {!gaps.length && (
            <p className="text-sm text-ok">No gaps flagged from current file.</p>
          )}
        </div>
      </section>
    </div>
  );
}

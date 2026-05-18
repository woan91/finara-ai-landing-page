import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type GoalKey = "emergency" | "travel" | "house" | "retirement" | "investment";
type RegionKey = "sg" | "my_in_sg" | "my" | "id" | "th" | "other";
type Priority = "hot" | "warm" | "longterm";

interface Lead {
  id: string;
  email: string;
  region: RegionKey | null;
  health_score: number | null;
  fa_interest: boolean | null;
  monthly_income: number | null;
  monthly_expenses: number | null;
  current_savings: number | null;
  main_goal: GoalKey | null;
  timeline_months: number | null;
  age: number | null;
  created_at: string;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "CRM Dashboard — Finara" }] }),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PASSWORD = "finara2025admin";

function getPriority(lead: Lead): Priority {
  const isSg = lead.region === "sg" || lead.region === "my_in_sg";
  if (isSg && lead.fa_interest === true && (lead.health_score ?? 100) < 45) return "hot";
  if ((lead.health_score ?? 0) >= 45 && (lead.health_score ?? 0) <= 75) return "warm";
  if (lead.fa_interest === true) return "warm";
  return "longterm";
}

const PRIORITY_LABEL: Record<Priority, string> = {
  hot: "🔥 HOT",
  warm: "🟡 WARM",
  longterm: "🟢 LONG TERM",
};

const PRIORITY_EXPLAIN: Record<Priority, string> = {
  hot: "Singapore lead, interested in review, low health score",
  warm: "Medium score or expressed interest in a review",
  longterm: "Strong finances, no immediate consult interest",
};

const REGION_LABEL: Record<RegionKey, string> = {
  sg: "Singapore",
  my_in_sg: "Malaysian in SG",
  my: "Malaysia",
  id: "Indonesia",
  th: "Thailand",
  other: "Other",
};

const GOAL_LABEL: Record<GoalKey, string> = {
  emergency: "Emergency Fund",
  travel: "Travel",
  house: "House",
  retirement: "Retirement",
  investment: "Investment",
};

function scoreColor(s: number | null): string {
  if (s === null) return "#94a3b8";
  if (s < 45) return "#ef4444";
  if (s <= 75) return "#f97316";
  return "#22c55e";
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtMoney(v: number | null): string {
  if (v === null) return "—";
  return "$" + Math.round(v).toLocaleString();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="mt-2 text-3xl font-bold tabular-nums" style={{ color: accent ?? "#0f172a" }}>
        {value}
      </div>
    </div>
  );
}

function PriorityBadge({ p }: { p: Priority }) {
  const styles: Record<Priority, string> = {
    hot: "bg-red-50 text-red-700 border border-red-200",
    warm: "bg-amber-50 text-amber-700 border border-amber-200",
    longterm: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${styles[p]}`}>
      {PRIORITY_LABEL[p]}
    </span>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  const color = scoreColor(score);
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums" style={{ color }}>
      <span className="size-2 rounded-full shrink-0" style={{ background: color }} />
      {score ?? "—"}
    </span>
  );
}

function ExpandedRow({ lead }: { lead: Lead }) {
  const p = getPriority(lead);
  return (
    <tr>
      <td colSpan={9} className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Age</div>
            <div className="font-semibold">{lead.age ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Monthly Income</div>
            <div className="font-semibold">{fmtMoney(lead.monthly_income)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Monthly Expenses</div>
            <div className="font-semibold">{fmtMoney(lead.monthly_expenses)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Current Savings</div>
            <div className="font-semibold">{fmtMoney(lead.current_savings)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Goal</div>
            <div className="font-semibold">{lead.main_goal ? GOAL_LABEL[lead.main_goal] : "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Timeline</div>
            <div className="font-semibold">{lead.timeline_months ? `${lead.timeline_months} months` : "—"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Health Score</div>
            <ScoreBadge score={lead.health_score} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Consult Interest</div>
            <div className="font-semibold">{lead.fa_interest === true ? "✅ Yes" : lead.fa_interest === false ? "❌ No" : "➖ Not asked"}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Priority</div>
            <div className="flex items-center gap-2">
              <PriorityBadge p={p} />
              <span className="text-xs text-gray-500">{PRIORITY_EXPLAIN[p]}</span>
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Submitted</div>
            <div className="font-semibold">{fmtDate(lead.created_at)}</div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterKey = "all" | "hot" | "sg" | "interested";

function DashboardPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pw === PASSWORD) {
      setAuthed(true);
    } else {
      setPwError(true);
    }
  }

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    setFetchError(null);
    const supabase = getSupabaseClient();
    if (!supabase) {
      setFetchError("Supabase client not configured.");
      setLoading(false);
      return;
    }
    supabase
      .from("financial_snapshots")
      .select("id,email,region,health_score,fa_interest,monthly_income,monthly_expenses,current_savings,main_goal,timeline_months,age,created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setFetchError(error.message);
        } else {
          setLeads((data ?? []) as Lead[]);
        }
        setLoading(false);
      });
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="mb-6 text-center">
            <div className="text-2xl font-bold text-gray-900">Finara CRM</div>
            <div className="text-sm text-gray-500 mt-1">Internal dashboard — authorized access only</div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setPwError(false); }}
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/40 transition ${pwError ? "border-red-400" : "border-gray-300"}`}
            />
            {pwError && <p className="text-xs text-red-500">Incorrect password.</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-teal-600 text-white py-3 text-sm font-semibold hover:bg-teal-700 transition"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Derived stats
  const total = leads.length;
  const hotCount = leads.filter((l) => getPriority(l) === "hot").length;
  const sgCount = leads.filter((l) => l.region === "sg" || l.region === "my_in_sg").length;
  const interestedCount = leads.filter((l) => l.fa_interest === true).length;

  // Filtered leads
  const filtered = leads.filter((l) => {
    if (filter === "hot" && getPriority(l) !== "hot") return false;
    if (filter === "sg" && l.region !== "sg" && l.region !== "my_in_sg") return false;
    if (filter === "interested" && l.fa_interest !== true) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!l.email?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All Leads" },
    { key: "hot", label: "🔥 Hot Only" },
    { key: "sg", label: "🇸🇬 Singapore Only" },
    { key: "interested", label: "✅ Interested Only" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 leading-none">Finara CRM</div>
            <div className="text-xs text-gray-400 mt-0.5">Financial Snapshot Leads</div>
          </div>
        </div>
        <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition">← Back to site</a>
      </div>

      <div className="px-6 py-6 max-w-screen-xl mx-auto space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Leads" value={total} />
          <StatCard label="🔥 Hot Leads" value={hotCount} accent="#ef4444" />
          <StatCard label="🇸🇬 Singapore" value={sgCount} accent="#0d9488" />
          <StatCard label="✅ Interested in Review" value={interestedCount} accent="#22c55e" />
        </div>

        {/* Filters + search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  filter === f.key
                    ? "bg-teal-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/40 transition w-56"
          />
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-400">Loading leads…</div>
          ) : fetchError ? (
            <div className="py-20 text-center text-sm text-red-500">Failed to load data: {fetchError}</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-400">No leads match this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Priority</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Region</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Score</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Goal</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Interested?</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Income</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Savings</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted (SGT)</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const p = getPriority(lead);
                    const isExpanded = expandedId === lead.id;
                    const leftBorder =
                      p === "hot"
                        ? "border-l-2 border-l-red-400"
                        : p === "warm"
                        ? "border-l-2 border-l-amber-400"
                        : "border-l-2 border-l-transparent";

                    return (
                      <>
                        <tr
                          key={lead.id}
                          onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                          className={`border-b border-gray-100 cursor-pointer hover:bg-teal-50/40 transition-colors ${leftBorder} ${isExpanded ? "bg-teal-50/30" : ""}`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <PriorityBadge p={p} />
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate font-medium text-gray-900">
                            {lead.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                            {lead.region ? REGION_LABEL[lead.region] : "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <ScoreBadge score={lead.health_score} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                            {lead.main_goal ? GOAL_LABEL[lead.main_goal] : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {lead.fa_interest === true ? "✅" : "➖"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600 tabular-nums">
                            {fmtMoney(lead.monthly_income)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600 tabular-nums">
                            {fmtMoney(lead.current_savings)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs tabular-nums">
                            {fmtDate(lead.created_at)}
                          </td>
                        </tr>
                        {isExpanded && <ExpandedRow key={`${lead.id}-expanded`} lead={lead} />}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

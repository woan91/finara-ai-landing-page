import { createFileRoute } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

type WaitlistRow = { email: string; created_at: string };
type SeriesPoint = { day: string; signups: number };

function getEnv(key: string): string | undefined {
  const meta = import.meta.env as unknown as Record<string, string | undefined>;
  const proc = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[key] ?? meta[key];
}

const getAdminDashboard = createServerFn({ method: "GET" })
  .inputValidator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    const expected = getEnv("FINARA_ADMIN_TOKEN");
    if (!expected || data.token !== expected) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const supabaseUrl = getEnv("SUPABASE_URL") ?? getEnv("VITE_SUPABASE_URL");
    const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      throw new Response("Missing server configuration", { status: 500 });
    }

    const url = supabaseUrl.trim().replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const [{ count, error: countError }, { data: latest, error: latestError }] = await Promise.all([
      supabase.from("early_access_signups").select("*", { count: "exact", head: true }),
      supabase
        .from("early_access_signups")
        .select("email,created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (countError) {
      throw new Response(countError.message, { status: 500 });
    }
    if (latestError) {
      throw new Response(latestError.message, { status: 500 });
    }

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 13);
    start.setHours(0, 0, 0, 0);
    const startIso = start.toISOString();

    const { data: growthRows, error: growthError } = await supabase
      .from("early_access_signups")
      .select("created_at")
      .gte("created_at", startIso);

    if (growthError) {
      throw new Response(growthError.message, { status: 500 });
    }

    const counts: Record<string, number> = {};
    for (const r of growthRows ?? []) {
      const day = r.created_at.slice(0, 10);
      counts[day] = (counts[day] ?? 0) + 1;
    }

    const series: SeriesPoint[] = [];
    const cursor = new Date(start);
    for (let i = 0; i < 14; i++) {
      const day = cursor.toISOString().slice(0, 10);
      series.push({ day, signups: counts[day] ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return { total: count ?? 0, latest: (latest ?? []) as WaitlistRow[], series };
  });

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin — Finara AI" }],
  }),
});

function AdminPage() {
  const load = useServerFn(getAdminDashboard);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<null | { total: number; latest: WaitlistRow[]; series: SeriesPoint[] }>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("finara-admin-token");
      if (saved) setToken(saved);
    } catch {}
  }, []);

  const chartConfig: ChartConfig = useMemo(
    () => ({
      signups: { label: "Signups", color: "oklch(0.5 0.18 265)" },
    }),
    [],
  );

  const submit = async () => {
    const value = token.trim();
    setError(null);
    setData(null);
    if (!value) return;
    setLoading(true);
    try {
      const result = await load({ data: { token: value } });
      setData(result);
      try {
        localStorage.setItem("finara-admin-token", value);
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl tracking-tight">Admin</h1>
          <p className="text-sm text-muted-foreground">Waitlist overview</p>
        </div>

        <div className="mt-8 rounded-3xl border border-border bg-card/60 shadow-card p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Access</div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Admin token"
                className="w-full sm:w-80 rounded-full border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
              />
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-70"
              >
                {loading ? "Loading…" : "View dashboard"}
              </button>
            </div>
          </div>
          {error && <div className="mt-3 text-sm text-[oklch(0.55_0.22_25)]">{error}</div>}
        </div>

        {data && (
          <div className="mt-8 grid gap-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card shadow-card p-6">
                <div className="text-sm text-muted-foreground">Total signups</div>
                <div className="mt-3 text-4xl font-semibold tabular-nums">{data.total.toLocaleString()}</div>
              </div>
              <div className="md:col-span-2 rounded-3xl border border-border bg-card shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Signup growth (last 14 days)</div>
                </div>
                <div className="mt-4 h-56">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer>
                      <BarChart data={data.series} margin={{ left: 8, right: 8 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                        <Tooltip />
                        <Bar dataKey="signups" fill="var(--color-signups)" radius={8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card shadow-card p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Latest 10</div>
              </div>
              <div className="mt-4 divide-y divide-border text-sm">
                {data.latest.map((r) => (
                  <div key={`${r.created_at}-${r.email}`} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">{r.email}</div>
                      <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                {data.latest.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">No signups yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


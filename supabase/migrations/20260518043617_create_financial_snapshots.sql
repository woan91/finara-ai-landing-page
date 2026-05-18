/*
  # Create financial_snapshots table

  1. New Tables
    - `financial_snapshots`
      - `id` (uuid, primary key, auto-generated)
      - `email` (text, not null) — user email from unlock form
      - `region` (text) — sg / my_in_sg / my / id / th / other
      - `age` (integer, nullable)
      - `monthly_income` (numeric, nullable)
      - `monthly_expenses` (numeric, nullable)
      - `current_savings` (numeric, nullable)
      - `main_goal` (text, nullable) — emergency / travel / house / retirement / investment
      - `timeline_months` (integer, nullable)
      - `health_score` (integer, nullable) — 0–100
      - `fa_interest` (boolean, nullable) — SG/MY-in-SG users only
      - `created_at` (timestamptz, defaults to now())

  2. Security
    - Enable RLS
    - Public INSERT policy (anon users can submit their snapshot)
    - No SELECT/UPDATE/DELETE for public (data is write-only from the client)
*/

CREATE TABLE IF NOT EXISTS financial_snapshots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL,
  region          text,
  age             integer,
  monthly_income  numeric,
  monthly_expenses numeric,
  current_savings  numeric,
  main_goal       text,
  timeline_months integer,
  health_score    integer,
  fa_interest     boolean,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE financial_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a financial snapshot"
  ON financial_snapshots
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

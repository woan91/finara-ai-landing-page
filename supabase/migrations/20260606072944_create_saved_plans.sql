CREATE TABLE IF NOT EXISTS saved_plans (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  source     text NOT NULL DEFAULT 'save_my_plan',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_saved_plans" ON saved_plans
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "select_saved_plans" ON saved_plans
  FOR SELECT TO anon, authenticated
  USING (true);

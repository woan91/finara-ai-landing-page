/*
  # Add SELECT policy for financial_snapshots

  The table has RLS enabled with only an INSERT policy.
  The dashboard uses the anon key to read leads, which is blocked.
  This adds a SELECT policy so the anon role can read all rows.

  Note: This is intentionally permissive for the internal CRM dashboard.
  The dashboard itself is protected by a hardcoded password gate in the UI.
*/

CREATE POLICY "Allow anon select for CRM dashboard"
  ON financial_snapshots
  FOR SELECT
  TO anon
  USING (true);

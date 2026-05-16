ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'participant',
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_approved ON public.users(is_approved);

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check
CHECK (role IN ('admin', 'participant'));

DROP POLICY IF EXISTS "Los usuarios pueden crear sus propias predicciones" ON public.predictions;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias predicciones" ON public.predictions;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propias predicciones" ON public.predictions;

CREATE POLICY "Los usuarios aprobados pueden crear sus propias predicciones"
  ON public.predictions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_approved = true
    )
  );

CREATE POLICY "Los usuarios aprobados pueden actualizar sus propias predicciones"
  ON public.predictions FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_approved = true
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_approved = true
    )
  );

CREATE POLICY "Los usuarios aprobados pueden eliminar sus propias predicciones"
  ON public.predictions FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_approved = true
    )
  );

CREATE OR REPLACE VIEW public.predictions_export AS
SELECT
  p.id AS prediction_id,
  p.created_at AS prediction_created_at,
  u.id AS user_id,
  u.username,
  u.full_name,
  u.email,
  u.role,
  u.is_approved,
  m.id AS match_id,
  m.utc_date,
  m.stage,
  m.matchday,
  m.group_name,
  home.name AS home_team_name,
  away.name AS away_team_name,
  p.home_score AS predicted_home_score,
  p.away_score AS predicted_away_score,
  m.home_score AS actual_home_score,
  m.away_score AS actual_away_score,
  p.points
FROM public.predictions p
INNER JOIN public.users u ON u.id = p.user_id
INNER JOIN public.matches m ON m.id = p.match_id
INNER JOIN public.teams home ON home.id = m.home_team_id
INNER JOIN public.teams away ON away.id = m.away_team_id
ORDER BY m.utc_date ASC, u.username ASC;

-- Made with Bob
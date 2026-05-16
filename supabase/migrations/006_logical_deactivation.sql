ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deactivated_by UUID REFERENCES public.users(id);

CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

UPDATE public.users
SET is_active = TRUE
WHERE is_active IS NULL;

DROP POLICY IF EXISTS "Los usuarios aprobados pueden crear sus propias predicciones" ON public.predictions;
DROP POLICY IF EXISTS "Los usuarios aprobados pueden actualizar sus propias predicciones" ON public.predictions;
DROP POLICY IF EXISTS "Los usuarios aprobados pueden eliminar sus propias predicciones" ON public.predictions;

CREATE POLICY "Los usuarios activos y aprobados pueden crear sus propias predicciones"
  ON public.predictions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_approved = true
        AND is_active = true
    )
  );

CREATE POLICY "Los usuarios activos y aprobados pueden actualizar sus propias predicciones"
  ON public.predictions FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_approved = true
        AND is_active = true
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_approved = true
        AND is_active = true
    )
  );

CREATE POLICY "Los usuarios activos y aprobados pueden eliminar sus propias predicciones"
  ON public.predictions FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_approved = true
        AND is_active = true
    )
  );

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  u.id as user_id,
  u.username,
  u.full_name,
  u.avatar_url,
  u.total_points,
  RANK() OVER (ORDER BY u.total_points DESC) as rank,
  COUNT(CASE WHEN p.points = 3 THEN 1 END) as correct_scores,
  COUNT(CASE WHEN p.points = 1 THEN 1 END) as correct_results
FROM public.users u
LEFT JOIN public.predictions p ON u.id = p.user_id
WHERE u.is_active = true
GROUP BY u.id, u.username, u.full_name, u.avatar_url, u.total_points
ORDER BY u.total_points DESC;

DROP VIEW IF EXISTS public.predictions_export;

CREATE VIEW public.predictions_export AS
SELECT
  p.id AS prediction_id,
  p.created_at AS prediction_created_at,
  u.id AS user_id,
  u.username,
  u.full_name,
  u.email,
  u.role,
  u.is_approved,
  u.is_active,
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
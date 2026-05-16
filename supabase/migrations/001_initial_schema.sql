-- PostgreSQL 13+ incluye gen_random_uuid() de forma nativa
-- No se requieren extensiones adicionales

-- Tabla de usuarios (extiende auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de equipos
CREATE TABLE public.teams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  tla TEXT NOT NULL,
  crest TEXT NOT NULL,
  group_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de partidos
CREATE TABLE public.matches (
  id INTEGER PRIMARY KEY,
  utc_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  stage TEXT NOT NULL,
  group_name TEXT,
  home_team_id INTEGER REFERENCES public.teams(id) NOT NULL,
  away_team_id INTEGER REFERENCES public.teams(id) NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  venue TEXT,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de predicciones
CREATE TABLE public.predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  match_id INTEGER REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_utc_date ON public.matches(utc_date);
CREATE INDEX idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX idx_predictions_match_id ON public.predictions(match_id);
CREATE INDEX idx_users_total_points ON public.users(total_points DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_predictions_updated_at
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Los usuarios pueden ver todos los perfiles"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Políticas RLS para teams (solo lectura para todos)
CREATE POLICY "Todos pueden ver los equipos"
  ON public.teams FOR SELECT
  USING (true);

-- Políticas RLS para matches (solo lectura para todos)
CREATE POLICY "Todos pueden ver los partidos"
  ON public.matches FOR SELECT
  USING (true);

-- Políticas RLS para predictions
CREATE POLICY "Los usuarios pueden ver todas las predicciones"
  ON public.predictions FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden crear sus propias predicciones"
  ON public.predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias predicciones"
  ON public.predictions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias predicciones"
  ON public.predictions FOR DELETE
  USING (auth.uid() = user_id);

-- Vista para el leaderboard
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
GROUP BY u.id, u.username, u.full_name, u.avatar_url, u.total_points
ORDER BY u.total_points DESC;

-- Función para calcular puntos de una predicción
CREATE OR REPLACE FUNCTION calculate_prediction_points(
  pred_home INTEGER,
  pred_away INTEGER,
  actual_home INTEGER,
  actual_away INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  -- Marcador exacto: 3 puntos
  IF pred_home = actual_home AND pred_away = actual_away THEN
    RETURN 3;
  END IF;
  
  -- Resultado correcto (ganador o empate): 1 punto
  IF (pred_home > pred_away AND actual_home > actual_away) OR
     (pred_home < pred_away AND actual_home < actual_away) OR
     (pred_home = pred_away AND actual_home = actual_away) THEN
    RETURN 1;
  END IF;
  
  -- Sin puntos
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para actualizar puntos de predicciones cuando un partido termina
CREATE OR REPLACE FUNCTION update_predictions_points(match_id_param INTEGER)
RETURNS void AS $$
DECLARE
  match_record RECORD;
  pred_record RECORD;
  points_earned INTEGER;
BEGIN
  -- Obtener información del partido
  SELECT home_score, away_score INTO match_record
  FROM public.matches
  WHERE id = match_id_param AND status = 'FINISHED';
  
  -- Si el partido no está terminado, salir
  IF NOT FOUND OR match_record.home_score IS NULL OR match_record.away_score IS NULL THEN
    RETURN;
  END IF;
  
  -- Actualizar puntos de cada predicción
  FOR pred_record IN
    SELECT id, user_id, home_score, away_score
    FROM public.predictions
    WHERE match_id = match_id_param
  LOOP
    points_earned := calculate_prediction_points(
      pred_record.home_score,
      pred_record.away_score,
      match_record.home_score,
      match_record.away_score
    );
    
    -- Actualizar puntos de la predicción
    UPDATE public.predictions
    SET points = points_earned
    WHERE id = pred_record.id;
    
    -- Actualizar puntos totales del usuario
    UPDATE public.users
    SET total_points = (
      SELECT COALESCE(SUM(points), 0)
      FROM public.predictions
      WHERE user_id = pred_record.user_id
    )
    WHERE id = pred_record.user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Made with Bob
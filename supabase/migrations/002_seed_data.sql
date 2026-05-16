-- Datos de prueba para usuarios
-- Nota: Las contraseñas deben ser creadas a través de Supabase Auth
-- Este script solo crea los perfiles de usuario

-- Insertar usuarios de prueba (estos IDs deben coincidir con los creados en auth.users)
-- Para crear usuarios reales, usar la API de Supabase Auth o el dashboard

-- Comentario: Los usuarios se crearán mediante el trigger handle_new_user
-- cuando se registren a través de la aplicación o mediante:
-- supabase auth signup --email user@example.com --password password123

-- Datos de ejemplo para equipos del Mundial (estos se poblarán desde la API)
-- Aquí solo algunos ejemplos para testing inicial

INSERT INTO public.teams (id, name, short_name, tla, crest, group_name) VALUES
(759, 'Argentina', 'Argentina', 'ARG', 'https://crests.football-data.org/759.png', 'Group A'),
(762, 'Saudi Arabia', 'Saudi Arabia', 'KSA', 'https://crests.football-data.org/762.png', 'Group A'),
(769, 'Mexico', 'Mexico', 'MEX', 'https://crests.football-data.org/769.png', 'Group A'),
(794, 'Poland', 'Poland', 'POL', 'https://crests.football-data.org/794.png', 'Group A'),
(770, 'France', 'France', 'FRA', 'https://crests.football-data.org/770.png', 'Group B'),
(782, 'Australia', 'Australia', 'AUS', 'https://crests.football-data.org/782.png', 'Group B'),
(825, 'Denmark', 'Denmark', 'DEN', 'https://crests.football-data.org/825.png', 'Group B'),
(805, 'Tunisia', 'Tunisia', 'TUN', 'https://crests.football-data.org/805.png', 'Group B'),
(760, 'Spain', 'Spain', 'ESP', 'https://crests.football-data.org/760.png', 'Group C'),
(764, 'Germany', 'Germany', 'GER', 'https://crests.football-data.org/764.png', 'Group C'),
(766, 'Japan', 'Japan', 'JPN', 'https://crests.football-data.org/766.png', 'Group C'),
(1569, 'Costa Rica', 'Costa Rica', 'CRC', 'https://crests.football-data.org/1569.png', 'Group C'),
(773, 'England', 'England', 'ENG', 'https://crests.football-data.org/773.png', 'Group D'),
(1118, 'Iran', 'Iran', 'IRN', 'https://crests.football-data.org/1118.png', 'Group D'),
(840, 'USA', 'USA', 'USA', 'https://crests.football-data.org/840.png', 'Group D'),
(833, 'Wales', 'Wales', 'WAL', 'https://crests.football-data.org/833.png', 'Group D')
ON CONFLICT (id) DO NOTHING;

-- Partidos de ejemplo (fase de grupos)
INSERT INTO public.matches (id, utc_date, status, stage, group_name, home_team_id, away_team_id, venue, is_locked) VALUES
(1, '2026-06-11 18:00:00+00', 'SCHEDULED', 'GROUP_STAGE', 'Group A', 759, 762, 'Estadio Nacional', false),
(2, '2026-06-11 21:00:00+00', 'SCHEDULED', 'GROUP_STAGE', 'Group A', 769, 794, 'Estadio Azteca', false),
(3, '2026-06-12 15:00:00+00', 'SCHEDULED', 'GROUP_STAGE', 'Group B', 770, 782, 'Stade de France', false),
(4, '2026-06-12 18:00:00+00', 'SCHEDULED', 'GROUP_STAGE', 'Group B', 825, 805, 'Parken Stadium', false),
(5, '2026-06-13 15:00:00+00', 'SCHEDULED', 'GROUP_STAGE', 'Group C', 760, 1569, 'Estadio Santiago Bernabéu', false),
(6, '2026-06-13 18:00:00+00', 'SCHEDULED', 'GROUP_STAGE', 'Group C', 764, 766, 'Allianz Arena', false),
(7, '2026-06-14 15:00:00+00', 'SCHEDULED', 'GROUP_STAGE', 'Group D', 773, 1118, 'Wembley Stadium', false),
(8, '2026-06-14 18:00:00+00', 'SCHEDULED', 'GROUP_STAGE', 'Group D', 840, 833, 'MetLife Stadium', false)
ON CONFLICT (id) DO NOTHING;

-- Función para bloquear partidos automáticamente cuando comienzan
CREATE OR REPLACE FUNCTION lock_started_matches()
RETURNS void AS $$
BEGIN
  UPDATE public.matches
  SET is_locked = true
  WHERE utc_date <= NOW()
    AND status IN ('SCHEDULED', 'TIMED')
    AND is_locked = false;
END;
$$ LANGUAGE plpgsql;

-- Made with Bob
-- Script para eliminar completamente a un participante de la base de datos.
-- Uso por email:
--   SELECT public.delete_participant_by_email('usuario@dominio.com');
--
-- Uso por UUID:
--   SELECT public.delete_participant_by_id('00000000-0000-0000-0000-000000000000');
--
-- ADVERTENCIA:
-- Este script elimina definitivamente el usuario de auth.users y public.users.
-- Las predicciones relacionadas se eliminan automáticamente por ON DELETE CASCADE.

CREATE OR REPLACE FUNCTION public.delete_participant_by_id(target_user_id UUID)
RETURNS void AS $$
DECLARE
  target_role TEXT;
BEGIN
  SELECT role
  INTO target_role
  FROM public.users
  WHERE id = target_user_id;

  IF target_role IS NULL THEN
    RAISE EXCEPTION 'No existe un participante con id %', target_user_id;
  END IF;

  IF target_role = 'admin' THEN
    RAISE EXCEPTION 'No se permite eliminar usuarios con rol admin (%).', target_user_id;
  END IF;

  DELETE FROM auth.users
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró el usuario en auth.users con id %', target_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_participant_by_email(target_email TEXT)
RETURNS void AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id
  INTO target_user_id
  FROM public.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No existe un participante con email %', target_email;
  END IF;

  PERFORM public.delete_participant_by_id(target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Made with Bob
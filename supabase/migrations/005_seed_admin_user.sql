UPDATE public.users
SET
  role = 'admin',
  is_approved = true,
  approved_at = COALESCE(approved_at, NOW())
WHERE email = 'admin@quiniela.com';

-- Made with Bob
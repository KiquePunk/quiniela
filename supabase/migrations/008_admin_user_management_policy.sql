DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.users;
DROP POLICY IF EXISTS "Los administradores pueden gestionar participantes" ON public.users;

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Los administradores pueden gestionar participantes"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users admin_user
      WHERE admin_user.id = auth.uid()
        AND admin_user.role = 'admin'
    )
  )
  WITH CHECK (
    role IN ('admin', 'participant')
  );

-- Made with Bob
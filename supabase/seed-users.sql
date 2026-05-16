-- Script para crear usuarios de prueba en Supabase
-- IMPORTANTE: Ejecutar este script después de aplicar las migraciones

-- Nota: Los usuarios deben crearse a través de Supabase Auth
-- Este script solo documenta los usuarios de prueba que deben crearse

-- USUARIOS DE PRUEBA RECOMENDADOS:
-- ================================

-- Usuario 1: Admin/Organizador
-- Email: admin@quiniela.com
-- Password: Admin123!
-- Username: admin
-- Full Name: Administrador Quiniela

-- Usuario 2: Usuario Regular 1
-- Email: juan.perez@example.com
-- Password: User123!
-- Username: juanperez
-- Full Name: Juan Pérez

-- Usuario 3: Usuario Regular 2
-- Email: maria.garcia@example.com
-- Password: User123!
-- Username: mariagarcia
-- Full Name: María García

-- Usuario 4: Usuario Regular 3
-- Email: carlos.lopez@example.com
-- Password: User123!
-- Username: carloslopez
-- Full Name: Carlos López

-- Usuario 5: Usuario Regular 4
-- Email: ana.martinez@example.com
-- Password: User123!
-- Username: anamartinez
-- Full Name: Ana Martínez

-- INSTRUCCIONES PARA CREAR USUARIOS:
-- ===================================

-- Opción 1: Usar Supabase Dashboard
-- 1. Ir a Authentication > Users en el dashboard de Supabase
-- 2. Click en "Add user" > "Create new user"
-- 3. Ingresar email y password
-- 4. En "User Metadata" agregar:
--    {
--      "username": "nombre_usuario",
--      "full_name": "Nombre Completo"
--    }

-- Opción 2: Usar Supabase CLI
-- supabase auth signup --email admin@quiniela.com --password Admin123!

-- Opción 3: Usar la aplicación web
-- Simplemente registrarse a través del formulario de registro

-- NOTA: El trigger handle_new_user() creará automáticamente
-- el perfil en la tabla users cuando se cree un usuario en auth.users

-- Para verificar que los usuarios se crearon correctamente:
-- SELECT * FROM auth.users;
-- SELECT * FROM public.users;

-- Made with Bob
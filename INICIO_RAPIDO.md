# 🚀 Inicio Rápido con pnpm

## ⚡ Comandos Rápidos

```powershell
# 1. Instalar dependencias
pnpm install
cd backend && pnpm install && cd ..

# 2. Aplicar migraciones en Supabase
supabase db push

# 3. Ejecutar aplicación (frontend + backend)
pnpm run dev:all
```

## 📋 Pasos Detallados

### 1️⃣ Instalar Dependencias

```powershell
# Frontend
pnpm install

# Backend
cd backend
pnpm install
cd ..
```

### 2️⃣ Configurar Supabase

Ve a tu proyecto en Supabase y aplica las migraciones del directorio [`supabase/migrations`](supabase/migrations).

Si usas CLI:

```powershell
supabase login
supabase link --project-ref txxlwgpjqgffkexkyrnj
supabase db push
```

Migraciones importantes recientes:

- [`004_user_roles_and_predictions_export.sql`](supabase/migrations/004_user_roles_and_predictions_export.sql)
- [`005_seed_admin_user.sql`](supabase/migrations/005_seed_admin_user.sql)
- [`006_logical_deactivation.sql`](supabase/migrations/006_logical_deactivation.sql)
- [`007_delete_participant_script.sql`](supabase/migrations/007_delete_participant_script.sql)
- [`008_admin_user_management_policy.sql`](supabase/migrations/008_admin_user_management_policy.sql)

### 3️⃣ Crear Usuario Administrador

En Supabase Dashboard:

- **Authentication** → **Users** → **Add user**
- Email: `admin@quiniela.com`
- Password: `Admin123!`

Luego aplica la migración [`005_seed_admin_user.sql`](supabase/migrations/005_seed_admin_user.sql) para promoverlo como administrador.

### 4️⃣ Ejecutar Aplicación

```powershell
# Opción A: Todo junto
pnpm run dev:all

# Opción B: Por separado
# Terminal 1:
pnpm run dev

# Terminal 2:
pnpm run backend
```

### 5️⃣ Sincronizar Datos del Mundial 2026

Una vez que los servidores estén corriendo:

```powershell
# Sincronización general
curl -X POST http://localhost:3000/api/sync/matches

# Sincronización específica de fase de grupos 2026 (72 partidos)
curl -X POST http://localhost:3000/api/sync/group-stage-matches

# Cron manual completo
curl http://localhost:3000/api/cron/sync-matches
```

El endpoint [`/api/cron/sync-matches`](backend/server.js:261) ejecuta sincronización completa, recalcula puntos de partidos finalizados y bloquea partidos iniciados.

Además, el backend ya programa esta tarea automáticamente cada 10 minutos mediante [`cron.schedule('*/10 * * * *', ...)`](backend/server.js:299).

## 🌐 URLs

- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## 🔑 Credenciales de Prueba

- **Admin**
  - Email: `admin@quiniela.com`
  - Password: `Admin123!`

## 🎯 Comandos Útiles

```powershell
# Desarrollo
pnpm run dev
pnpm run backend
pnpm run dev:all

# Build
pnpm run build

# Supabase
supabase db push
supabase db reset

# Sincronización
curl -X POST http://localhost:3000/api/sync/matches
curl -X POST http://localhost:3000/api/sync/results
curl -X POST http://localhost:3000/api/sync/group-stage-matches
curl http://localhost:3000/api/cron/sync-matches
```

## 👥 Gestión de participantes

Desde el módulo `Administración` un usuario admin puede:

- autorizar participantes
- dar de baja lógicamente
- reactivar participantes

Reglas importantes:

- un usuario pendiente no puede pronosticar
- un usuario dado de baja no puede pronosticar
- un usuario dado de baja no aparece en la tabla de posiciones
- cualquier usuario autenticado puede descargar el CSV de pronósticos desde el dashboard

## 🗑️ Borrado físico de participantes

Si además necesitas eliminar completamente a un participante de la base de datos, usa las funciones de [`007_delete_participant_script.sql`](supabase/migrations/007_delete_participant_script.sql):

```sql
SELECT public.delete_participant_by_email('usuario@dominio.com');
SELECT public.delete_participant_by_id('00000000-0000-0000-0000-000000000000');
```

## ✅ Verificación

1. ✅ Frontend en http://localhost:4200
2. ✅ Backend en http://localhost:3000
3. ✅ Login funciona con `admin@quiniela.com`
4. ✅ Dashboard muestra partidos y botón de CSV
5. ✅ Administración permite autorizar, dar de baja y reactivar
6. ✅ Mis Predicciones bloquea a usuarios pendientes o inactivos

---

**Made with Bob** 🤖

Para más detalles, consulta [`README.md`](README.md) y [`SETUP.md`](SETUP.md).
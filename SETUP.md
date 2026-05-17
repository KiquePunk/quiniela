# 🚀 Guía de Configuración Inicial - Quiniela Mundial

Esta guía describe la configuración completa del proyecto con los cambios recientes de autorización administrativa, baja lógica, exportación CSV pública y sincronización del Mundial 2026.

## ✅ Pre-requisitos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- [pnpm](https://pnpm.io/)
- [Git](https://git-scm.com/)
- Cuenta en [Supabase](https://supabase.com)
- API Token de [football-data.org](https://www.football-data.org/)

## 📦 Paso 1: Instalación de Dependencias

```bash
npm install -g pnpm
pnpm install

cd backend
pnpm install
cd ..
```

## 🗄️ Paso 2: Configurar Supabase

### Opción A: Usar el proyecto existente

```bash
npm install -g supabase
supabase login
supabase link --project-ref txxlwgpjqgffkexkyrnj
supabase db push
```

### Opción B: Crear un nuevo proyecto

1. Crear proyecto en Supabase
2. Obtener URL y anon key
3. Actualizar [`environment.ts`](src/environments/environment.ts)
4. Aplicar migraciones

```bash
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

## 📚 Migraciones importantes

Además del esquema base, este proyecto ya contempla:

- [`001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
- [`002_seed_data.sql`](supabase/migrations/002_seed_data.sql)
- [`003_add_matchday_to_matches.sql`](supabase/migrations/003_add_matchday_to_matches.sql)
- [`004_user_roles_and_predictions_export.sql`](supabase/migrations/004_user_roles_and_predictions_export.sql)
- [`005_seed_admin_user.sql`](supabase/migrations/005_seed_admin_user.sql)
- [`006_logical_deactivation.sql`](supabase/migrations/006_logical_deactivation.sql)
- [`007_delete_participant_script.sql`](supabase/migrations/007_delete_participant_script.sql)
- [`008_admin_user_management_policy.sql`](supabase/migrations/008_admin_user_management_policy.sql)

## 👥 Paso 3: Crear Usuario Administrador

### Desde Supabase Dashboard

1. Ir a **Authentication** > **Users**
2. Crear el usuario:
   - Email: `admin@quiniela.com`
   - Password: `Admin123!`
3. Aplicar la migración [`005_seed_admin_user.sql`](supabase/migrations/005_seed_admin_user.sql)

## 🚀 Paso 4: Ejecutar la Aplicación

```bash
# Frontend
pnpm run dev

# Backend
pnpm run backend
```

O ambos juntos:

```bash
pnpm run dev:all
```

### URLs

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`

## ⚽ Paso 5: Sincronizar Datos del Mundial 2026

### Sincronización general

```bash
curl -X POST http://localhost:3000/api/sync/matches
curl -X POST http://localhost:3000/api/sync/results
curl http://localhost:3000/api/cron/sync-matches
```

El endpoint [`/api/cron/sync-matches`](backend/server.js:261) ejecuta una sincronización completa del backend, recalcula puntos de partidos finalizados y bloquea partidos ya iniciados.

### Sincronización de fase de grupos

La fase de grupos del Mundial 2026 tiene **72 partidos** y puede cargarse con:

```bash
curl -X POST http://localhost:3000/api/sync/group-stage-matches
```

Esto persiste en Supabase:

- equipos
- partidos
- grupos
- jornadas
- etapas eliminatorias soportadas por el modelo

Además, el backend ejecuta esta tarea automáticamente cada hora con [`cron.schedule('0 * * * *', ...)`](backend/server.js:299).

## 🔐 Paso 6: Validar autorización y administración

### Flujo esperado

1. Un usuario se registra
2. Queda pendiente de autorización
3. Un administrador entra al módulo `Administración`
4. Autoriza al participante
5. El participante ya puede capturar pronósticos

### Baja lógica

Desde `Administración` el admin puede:

- dar de baja lógicamente a un participante
- reactivarlo después

Un participante dado de baja:

- no aparece en `leaderboard`
- no puede guardar pronósticos
- sigue existiendo en la base de datos

## 🔄 Paso 6.1: Cron automático

El backend define un cron interno usando [`cron.schedule('0 * * * *', ...)`](backend/server.js:299), es decir, una ejecución **cada hora en el minuto 0**. Ese cron invoca internamente [`/api/cron/sync-matches`](backend/server.js:261).

## 🗑️ Paso 7: Eliminación física de un participante

Si necesitas borrar completamente un participante de todas las tablas relacionadas, usa las funciones de [`007_delete_participant_script.sql`](supabase/migrations/007_delete_participant_script.sql).

```sql
SELECT public.delete_participant_by_email('usuario@dominio.com');
SELECT public.delete_participant_by_id('00000000-0000-0000-0000-000000000000');
```

Notas:

- no permite eliminar administradores
- borra desde `auth.users`
- `public.users` y `public.predictions` se eliminan por cascada

## 📤 Paso 8: Validar exportación CSV

El dashboard incluye un botón para descargar el CSV de pronósticos.

Comportamiento esperado:

- está disponible para cualquier usuario autenticado
- incluye datos de usuario, aprobación, estatus activo, partido, pronóstico y puntos

## 🧪 Verificaciones recomendadas

### Verificar base de datos

```bash
supabase db push
```

Consultas útiles:

```sql
SELECT * FROM public.users;
SELECT * FROM public.matches;
SELECT * FROM public.predictions;
SELECT * FROM public.leaderboard;
SELECT * FROM public.predictions_export;
```

### Verificar endpoints

```bash
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/sync/matches
curl -X POST http://localhost:3000/api/sync/results
curl -X POST http://localhost:3000/api/sync/group-stage-matches
```

## 🐛 Solución de Problemas

### No se puede autorizar o dar de baja a un participante

Verifica que esté aplicada la migración [`008_admin_user_management_policy.sql`](supabase/migrations/008_admin_user_management_policy.sql), ya que agrega la política RLS para que administradores puedan actualizar participantes.

### Error al recrear `predictions_export`

Verifica que esté aplicada la versión corregida de [`006_logical_deactivation.sql`](supabase/migrations/006_logical_deactivation.sql), la cual elimina la vista antes de recrearla.

### No se pueden guardar predicciones

Verifica que el usuario:

- esté autenticado
- esté autorizado
- siga activo
- intente guardar antes de que inicie el partido

## 📚 Siguientes documentos

- [`README.md`](README.md)
- [`INICIO_RAPIDO.md`](INICIO_RAPIDO.md)
- [`QUICKSTART.md`](QUICKSTART.md)
- [`AGENTS.md`](AGENTS.md)

---

**Made with Bob** 🤖

# 🤖 AGENTS.md - Guía para Agentes de IA

Este documento proporciona contexto y guías para agentes de IA que trabajen en este proyecto.

## 📋 Resumen del Proyecto

**Quiniela Mundial** es una aplicación web full-stack para gestionar predicciones de partidos del Mundial de Fútbol 2026. Los usuarios pueden registrarse, pero sólo pueden participar cuando un administrador autoriza su cuenta. También existe baja lógica de participantes, exportación pública de pronósticos en CSV y sincronización automática de partidos/resultados.

## 🏗️ Arquitectura

### Stack Tecnológico

- **Frontend**: Angular 19 (Standalone Components)
- **Backend**: Node.js + Express
- **Base de Datos**: Supabase (PostgreSQL con RLS)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS
- **Gestor de Paquetes**: pnpm

### Estructura de Carpetas

```text
src/app/
├── core/
│   ├── guards/             # AuthGuard para rutas protegidas
│   ├── interceptors/       # HTTP interceptor para tokens
│   ├── models/             # Interfaces TypeScript
│   └── services/           # Servicios de negocio
├── features/
│   ├── auth/               # Login y registro
│   ├── dashboard/          # Vista principal + Acerca de + CSV
│   ├── predictions/        # Gestión de predicciones
│   ├── leaderboard/        # Tabla de posiciones
│   └── admin/              # Administración de participantes
└── environments/           # Configuración

backend/
├── server.js               # API Express y sincronización
└── .env.example           # Variables de entorno de backend

supabase/
├── migrations/            # Esquema, políticas y scripts SQL
└── config.toml            # Configuración local
```

## 🔑 Conceptos Clave

### 1. Angular + Standalone Components

- Cada pantalla principal vive en `features/`
- La app usa componentes standalone
- El módulo `Mis Predicciones` ya soporta filtros por fecha, jornada y grupo/fase

### 2. Supabase

- **Auth**: manejo de usuarios y sesiones
- **Database**: PostgreSQL con RLS
- **RLS**: parte central del control de acceso de la app
- **auth.users** y **public.users** están relacionados mediante trigger

### 3. Roles y estatus de usuario

El modelo de usuario soporta:

- `role`: `admin` o `participant`
- `is_approved`: indica si puede participar
- `is_active`: indica si está dado de alta o de baja lógica

Reglas:

- usuario no aprobado → no puede pronosticar
- usuario inactivo → no puede pronosticar y no aparece en ranking
- administrador → puede gestionar participantes

### 4. Exportación de pronósticos

Existe una vista `predictions_export` y un flujo de exportación CSV accesible para cualquier usuario autenticado desde dashboard.

### 5. Mundial 2026

La app soporta sincronización del Mundial 2026, incluyendo:

- fase de grupos de **72 partidos**
- `matchday`
- grupos
- fases eliminatorias:
  - `LAST_32`
  - `LAST_16`
  - `QUARTER_FINALS`
  - `SEMI_FINALS`
  - `THIRD_PLACE`
  - `FINAL`

## 🎯 Flujos Principales

### Flujo de Autenticación y Autorización

1. Usuario se registra → [`AuthService.register()`](src/app/core/services/auth.service.ts:49)
2. Supabase crea usuario en `auth.users`
3. Trigger `handle_new_user()` crea perfil en `public.users`
4. El usuario puede iniciar sesión
5. Mientras no esté autorizado, no puede participar
6. Un admin autoriza al usuario desde `Administración`

### Flujo de Baja Lógica

1. Admin entra a `Administración`
2. Marca al usuario como inactivo
3. El usuario:
   - deja de aparecer en `leaderboard`
   - no puede seguir creando o editando predicciones
4. El admin puede reactivarlo más adelante

### Flujo de Predicciones

1. Usuario autorizado y activo entra a `Mis Predicciones`
2. Filtra por fecha, jornada o grupo
3. Captura marcadores
4. [`PredictionService.savePrediction()`](src/app/core/services/prediction.service.ts:line) guarda en BD
5. La base y la UI impiden guardar si:
   - no está aprobado
   - está inactivo
   - el partido ya comenzó
6. Cuando el partido finaliza, se recalculan puntos
7. `leaderboard` muestra ranking actualizado

### Flujo de Sincronización

1. Endpoint llama a `football-data.org`
2. Se insertan/actualizan equipos y partidos
3. La fase de grupos del Mundial 2026 puede sincronizarse con una sola llamada
4. Para partidos finalizados, se calculan puntos
5. Los partidos se bloquean cuando ya comenzaron
6. El endpoint [`/api/cron/sync-matches`](backend/server.js:261) ejecuta el ciclo completo de sincronización
7. El backend programa la ejecución automática cada hora con [`cron.schedule('0 * * * *', ...)`](backend/server.js:299)

## 🛠️ Tareas Comunes

### Autorizar o administrar participantes

La lógica principal vive en:

- [`AdminComponent`](src/app/features/admin/admin.component.ts)
- [`AdminService`](src/app/core/services/admin.service.ts)
- migración [`008_admin_user_management_policy.sql`](supabase/migrations/008_admin_user_management_policy.sql)

### Sincronizar fase de grupos 2026

Usar el endpoint backend correspondiente. La lógica está centralizada en [`server.js`](backend/server.js).

### Ejecutar sincronización completa por cron

Para ejecutar manualmente el flujo completo de sincronización usar [`GET /api/cron/sync-matches`](backend/server.js:261). Ese endpoint también es consumido internamente por el cron horario definido con [`cron.schedule('0 * * * *', ...)`](backend/server.js:299).

### Crear o ajustar políticas RLS

Revisar primero:

- [`001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
- [`004_user_roles_and_predictions_export.sql`](supabase/migrations/004_user_roles_and_predictions_export.sql)
- [`006_logical_deactivation.sql`](supabase/migrations/006_logical_deactivation.sql)
- [`008_admin_user_management_policy.sql`](supabase/migrations/008_admin_user_management_policy.sql)

### Borrar físicamente un participante

Usar las funciones de [`007_delete_participant_script.sql`](supabase/migrations/007_delete_participant_script.sql):

- [`public.delete_participant_by_id()`](supabase/migrations/007_delete_participant_script.sql:10)
- [`public.delete_participant_by_email()`](supabase/migrations/007_delete_participant_script.sql:33)

Estas funciones:

- eliminan desde `auth.users`
- borran por cascada `public.users` y `public.predictions`
- bloquean el borrado de admins

## 🔒 Seguridad

### Row Level Security (RLS)

Puntos importantes:

- `public.users` permite lectura global
- autoedición del propio perfil
- admins pueden actualizar participantes
- sólo usuarios aprobados y activos pueden modificar predicciones

### Validaciones

- **Frontend**: bloqueo de UI y mensajes al usuario
- **Backend**: sincronización y persistencia de datos
- **Base de Datos**: RLS, constraints, vistas y triggers

## 📊 Modelos de Datos

### User

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  total_points?: number;
  role: 'admin' | 'participant';
  is_approved: boolean;
  is_active: boolean;
}
```

### Match

```typescript
interface Match {
  id: number;
  utc_date: string;
  status: MatchStatus;
  stage: string;
  matchday?: number;
  group_name?: string;
  home_team_id: number;
  away_team_id: number;
  home_score?: number;
  away_score?: number;
  is_locked: boolean;
}
```

### Prediction

```typescript
interface Prediction {
  id: string;
  user_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
  points: number;
}
```

## 🐛 Debugging

### Problemas comunes recientes

- Error al recrear `predictions_export` → en este proyecto se resuelve eliminando la vista antes de recrearla en [`006_logical_deactivation.sql`](supabase/migrations/006_logical_deactivation.sql)
- Error al autorizar/dar de baja usuarios → verificar la política agregada en [`008_admin_user_management_policy.sql`](supabase/migrations/008_admin_user_management_policy.sql)

### Herramientas

- Supabase Dashboard
- Network Tab del navegador
- consola del backend
- Angular DevTools

## 🧪 Testing

Al menos validar manualmente:

- registro de usuario
- autorización por admin
- baja lógica y reactivación
- bloqueo de predicciones para usuarios no autorizados/inactivos
- descarga de CSV
- sincronización de grupos 2026

## 🚀 Despliegue

### Variables de Entorno

Configurar:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`
- `FOOTBALL_API_TOKEN`

### Build

```bash
pnpm build
```

## 📝 Convenciones de Código

### Nombres

- **Componentes**: PascalCase
- **Servicios**: PascalCase + Service
- **Interfaces**: PascalCase
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Recomendaciones para agentes

1. Mantén consistencia con las migraciones existentes
2. Si cambias permisos, revisa siempre RLS
3. Si agregas columnas a vistas existentes, considera `DROP VIEW IF EXISTS` antes de recrearlas
4. Si agregas cambios funcionales, actualiza [`README.md`](README.md) y los `.md` relevantes
5. Antes de modificar administración o predicciones, revisa interacción entre UI, servicio y políticas SQL

## 📚 Recursos Adicionales

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [football-data.org Docs](https://www.football-data.org/documentation/quickstart)

---

**Made with Bob** 🤖

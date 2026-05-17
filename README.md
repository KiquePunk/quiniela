# ⚽ Quiniela Mundial - Aplicación de Predicciones

Aplicación web completa para gestionar una quiniela del Mundial de Fútbol 2026, construida con Angular, backend Node/Express y Supabase.

## 🚀 Características

- **Autenticación de Usuarios**: Sistema completo de registro e inicio de sesión con Supabase Auth
- **Autorización Administrativa**: Los usuarios pueden registrarse, pero sólo participan cuando un administrador autoriza su cuenta
- **Administración de Participantes**: Módulo para autorizar, dar de baja lógicamente y reactivar participantes
- **Dashboard Interactivo**: Visualización de próximos partidos, ranking en tiempo real, sección informativa y descarga pública de CSV
- **Sistema de Predicciones**: Los usuarios pueden predecir marcadores antes de que inicien los partidos
- **Filtros Avanzados de Predicciones**: La pantalla `Mis Predicciones` permite navegar por fecha, jornada y grupo/fase
- **Bloqueo Automático**: Las predicciones se bloquean automáticamente cuando comienza un partido
- **Integración con API Externa**: Sincronización automática con `football-data.org` para obtener equipos, partidos y resultados
- **Mundial 2026**: Soporte para fase de grupos de 72 partidos, jornadas y fases eliminatorias
- **Motor de Puntuación**: Sistema automático que calcula puntos basado en predicciones vs resultados reales
- **Tabla de Posiciones**: Ranking en tiempo real de todos los participantes activos
- **Exportación de Pronósticos**: Cualquier usuario autenticado puede descargar un CSV con los pronósticos para transparencia
- **Diseño Responsivo**: Interfaz optimizada para móviles, tablets y monitores amplios usando Tailwind CSS

## 📋 Requisitos Previos

- Node.js 18+ y pnpm
- Cuenta de Supabase
- API Token de `football-data.org`
- Supabase CLI opcional para aplicar migraciones localmente o remoto

## 🛠️ Stack Tecnológico

- **Frontend**: Angular 19 + Tailwind CSS
- **Backend**: Node.js + Express
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **API Externa**: `football-data.org`
- **Gestor de Paquetes**: pnpm

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd quiniela
```

### 2. Instalar dependencias

```bash
pnpm install
cd backend && pnpm install && cd ..
```

### 3. Configurar Supabase

#### Opción A: Usar Supabase Cloud

```bash
npm install -g supabase
supabase login
supabase link --project-ref txxlwgpjqgffkexkyrnj
supabase db push
```

#### Opción B: Usar Supabase local

```bash
supabase start
supabase db reset
```

### 4. Configurar variables de entorno

Revisar los valores de [`environment.ts`](src/environments/environment.ts) y [`backend/.env.example`](backend/.env.example).

Variables relevantes:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`
- `FOOTBALL_API_TOKEN`

### 5. Crear usuarios de prueba

Puedes crear usuarios desde Supabase Auth o registrarte desde la aplicación.

Usuario recomendado para administración:

- `admin@quiniela.com` / `Admin123!`

> Después de crear el usuario administrador, aplica la migración [`005_seed_admin_user.sql`](supabase/migrations/005_seed_admin_user.sql) para promoverlo como admin si aún no existe ese rol en la base de datos.

## 🚀 Ejecución

### Desarrollo

```bash
pnpm run dev
```

Frontend disponible en `http://localhost:4200`

### Backend

```bash
pnpm run backend
```

Backend disponible en `http://localhost:3000`

### Todo junto

```bash
pnpm run dev:all
```

## 🔄 Sincronización con football-data.org

### Sincronización manual general

```bash
curl -X POST http://localhost:3000/api/sync/matches
curl -X POST http://localhost:3000/api/sync/results
```

### Sincronización específica de fase de grupos 2026

La fase de grupos del Mundial 2026 contiene **72 partidos**. Se obtiene toda la información con una sola llamada al endpoint de `football-data.org` y se persiste en Supabase.

```bash
curl -X POST http://localhost:3000/api/sync/group-stage-matches
```

### Cron

El backend expone el endpoint [`GET /api/cron/sync-matches`](backend/server.js:261), que realiza en una sola ejecución:

- sincronización de equipos y partidos
- recálculo de puntos para partidos finalizados
- bloqueo de partidos ya iniciados

```bash
curl http://localhost:3000/api/cron/sync-matches
```

Además, el backend programa una ejecución automática cada hora con [`cron.schedule('0 * * * *', ...)`](backend/server.js:299), que consume internamente ese endpoint.

## 🎯 Flujo funcional

1. El usuario se registra
2. Se crea su perfil en `public.users`
3. Un administrador autoriza la cuenta desde `Administración`
4. El usuario autorizado puede capturar pronósticos
5. Si un administrador da de baja lógicamente al usuario:
   - ya no aparece en la tabla de posiciones
   - ya no puede seguir pronosticando
   - puede ser reactivado después
6. Cualquier usuario autenticado puede descargar el CSV de pronósticos desde el dashboard

## 🧮 Sistema de Puntuación

- **3 puntos** por acertar el marcador exacto
- **1 punto** por acertar el resultado (ganador o empate)
- **0 puntos** si no aciertas

## 🗄️ Esquema de Base de Datos

### Tablas principales

- `users`: perfiles de usuario, roles, aprobación y estatus activo
- `teams`: equipos
- `matches`: partidos del Mundial con `stage`, `group_name` y `matchday`
- `predictions`: pronósticos por usuario y partido

### Vistas

- `leaderboard`: ranking calculado automáticamente sólo para participantes activos
- `predictions_export`: dataset para exportar pronósticos a CSV

### Funciones y scripts útiles

- `calculate_prediction_points()`
- `update_predictions_points()`
- [`delete_participant_by_id()`](supabase/migrations/007_delete_participant_script.sql:10)
- [`delete_participant_by_email()`](supabase/migrations/007_delete_participant_script.sql:33)

## 🔐 Seguridad

- Row Level Security (RLS) habilitado
- Restricción para que sólo usuarios autorizados y activos puedan crear/editar/eliminar pronósticos
- Política adicional para que administradores puedan gestionar participantes
- Protección contra borrado accidental de administradores en el script de eliminación física

## 🧾 Migraciones recientes relevantes

- [`004_user_roles_and_predictions_export.sql`](supabase/migrations/004_user_roles_and_predictions_export.sql)
- [`005_seed_admin_user.sql`](supabase/migrations/005_seed_admin_user.sql)
- [`006_logical_deactivation.sql`](supabase/migrations/006_logical_deactivation.sql)
- [`007_delete_participant_script.sql`](supabase/migrations/007_delete_participant_script.sql)
- [`008_admin_user_management_policy.sql`](supabase/migrations/008_admin_user_management_policy.sql)

## 👥 Administración de participantes

Desde el módulo `Administración` se puede:

- Autorizar participantes pendientes
- Dar de baja lógicamente participantes
- Reactivar participantes dados de baja

### Baja lógica vs borrado físico

- **Baja lógica**: el participante sigue existiendo, pero no aparece en ranking ni puede pronosticar
- **Borrado físico**: elimina completamente al participante de `auth.users`, `public.users` y sus predicciones en cascada usando [`007_delete_participant_script.sql`](supabase/migrations/007_delete_participant_script.sql)

## 📤 Exportación CSV

La exportación está disponible para todos los usuarios autenticados desde el dashboard.

Contenido del CSV:

- usuario
- nombre completo
- email
- rol
- aprobado
- activo
- fecha del partido
- etapa
- jornada
- grupo
- equipos
- pronóstico
- marcador real
- puntos

## 🧪 Verificación rápida

- Usuario admin puede entrar a `Administración`
- Usuario nuevo no puede pronosticar hasta ser autorizado
- Usuario dado de baja no puede pronosticar ni aparece en ranking
- CSV descarga correctamente desde dashboard
- Sincronización de grupos 2026 inserta 72 partidos

## 📚 Documentación relacionada

- [`INICIO_RAPIDO.md`](INICIO_RAPIDO.md)
- [`QUICKSTART.md`](QUICKSTART.md)
- [`SETUP.md`](SETUP.md)
- [`AGENTS.md`](AGENTS.md)

---

**Made with Bob** 🤖

# ⚡ Inicio Rápido - Quiniela Mundial

Guía ultra-rápida para poner en marcha la aplicación con los cambios más recientes de administración, autorización, baja lógica y sincronización del Mundial 2026.

## 🚀 Comandos Esenciales

```bash
# 1. Instalar dependencias
pnpm install
cd backend && pnpm install && cd ..

# 2. Aplicar migraciones
supabase login
supabase link --project-ref txxlwgpjqgffkexkyrnj
supabase db push

# 3. Iniciar aplicación
pnpm run dev:all
```

## 🌐 URLs Importantes

- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard/project/txxlwgpjqgffkexkyrnj
- **Football API**: https://www.football-data.org/

## 👤 Usuario administrador recomendado

Crear en Supabase Auth o desde la app:

| Email | Password | Username |
|-------|----------|----------|
| admin@quiniela.com | Admin123! | admin |

Luego aplicar la migración [`005_seed_admin_user.sql`](supabase/migrations/005_seed_admin_user.sql).

## 📋 Checklist de Verificación

- [ ] Dependencias instaladas
- [ ] Migraciones aplicadas con [`supabase db push`](QUICKSTART.md)
- [ ] Aplicación corriendo en http://localhost:4200
- [ ] Usuario administrador creado y promovido
- [ ] Fase de grupos 2026 sincronizada
- [ ] Usuario pendiente no puede pronosticar
- [ ] Administración permite autorizar y dar de baja
- [ ] CSV descarga correctamente desde dashboard

## 🔧 Comandos Útiles

```bash
# Desarrollo
pnpm run dev
pnpm run backend
pnpm run dev:all

# Build
pnpm run build

# Supabase
supabase db push
supabase db reset
supabase status

# Sincronización
curl -X POST http://localhost:3000/api/sync/matches
curl -X POST http://localhost:3000/api/sync/results
curl -X POST http://localhost:3000/api/sync/group-stage-matches
curl http://localhost:3000/api/cron/sync-matches
curl http://localhost:3000/api/health
```

El endpoint [`/api/cron/sync-matches`](backend/server.js:261) ejecuta sincronización completa, recalcula puntos para partidos finalizados y bloquea partidos iniciados. También se ejecuta automáticamente cada hora mediante [`cron.schedule('0 * * * *', ...)`](backend/server.js:299).

## ⚽ Flujo de Uso Típico

1. **Registro/Login** → Crear cuenta o iniciar sesión
2. **Autorización** → Un admin autoriza al usuario
3. **Dashboard** → Ver próximos partidos, ranking, sección `Acerca de` y descarga de CSV
4. **Predicciones** → Hacer pronósticos filtrando por fecha, jornada o grupo
5. **Resultados** → Se sincronizan resultados y se calculan puntos
6. **Leaderboard** → Ver posición en ranking si la cuenta sigue activa

## 👥 Administración

El módulo `Administración` permite:

- autorizar usuarios pendientes
- dar de baja lógicamente a participantes
- reactivar participantes dados de baja

### Comportamiento esperado

- **Pendiente**: no puede pronosticar
- **Activo y aprobado**: puede pronosticar
- **Baja lógica**: no puede pronosticar y no aparece en ranking

## 🗑️ Eliminación física de participantes

El proyecto incluye funciones SQL en [`007_delete_participant_script.sql`](supabase/migrations/007_delete_participant_script.sql):

```sql
SELECT public.delete_participant_by_email('usuario@dominio.com');
SELECT public.delete_participant_by_id('00000000-0000-0000-0000-000000000000');
```

## 📁 Estructura Clave

```text
src/app/
├── core/services/          # Lógica de negocio
├── core/models/            # Tipos de usuario, partido y predicción
├── features/auth/          # Login/Register
├── features/dashboard/     # Dashboard + CSV + sección Acerca de
├── features/predictions/   # Captura y filtros de predicciones
├── features/leaderboard/   # Tabla de posiciones
└── features/admin/         # Gestión administrativa

backend/
└── server.js               # API Express y sync con football-data.org

supabase/migrations/        # Esquema, políticas RLS y scripts SQL
```

## 📚 Documentación Completa

- [`README.md`](README.md)
- [`SETUP.md`](SETUP.md)
- [`AGENTS.md`](AGENTS.md)

---

**Made with Bob** 🤖

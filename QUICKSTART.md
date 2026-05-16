# ⚡ Inicio Rápido - Quiniela Mundial

Guía ultra-rápida para poner en marcha la aplicación en 5 minutos.

## 🚀 Comandos Esenciales

```bash
# 1. Instalar dependencias
pnpm install

# 2. Vincular a Supabase (si usas el proyecto existente)
supabase login
supabase link --project-ref txxlwgpjqgffkexkyrnj
supabase db push

# 3. Iniciar aplicación
pnpm dev

# 4. En otra terminal, sincronizar datos del Mundial
curl -X POST http://localhost:5173/api/sync/matches
```

## 🌐 URLs Importantes

- **Aplicación**: http://localhost:5173
- **Supabase Dashboard**: https://supabase.com/dashboard/project/txxlwgpjqgffkexkyrnj
- **Football API**: https://www.football-data.org/

## 👤 Usuarios de Prueba

Crear en Supabase Dashboard o registrarse en la app:

| Email | Password | Username |
|-------|----------|----------|
| admin@quiniela.com | Admin123! | admin |
| juan.perez@example.com | User123! | juanperez |

## 📋 Checklist de Verificación

- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Supabase vinculado y migraciones aplicadas
- [ ] Aplicación corriendo en http://localhost:5173
- [ ] Datos sincronizados (equipos y partidos)
- [ ] Usuario creado y login exitoso
- [ ] Predicción guardada correctamente

## 🔧 Comandos Útiles

```bash
# Desarrollo
pnpm dev                    # Iniciar servidor de desarrollo

# Build
pnpm build                  # Construir para producción
pnpm start                  # Ejecutar build de producción

# Testing
pnpm test                   # Ejecutar tests

# Supabase
supabase db push            # Aplicar migraciones
supabase db reset           # Resetear base de datos
supabase status             # Ver estado de servicios

# API Sync
curl -X POST http://localhost:5173/api/sync/matches   # Sincronizar partidos
curl -X POST http://localhost:5173/api/sync/results   # Actualizar resultados
curl http://localhost:5173/api/cron/sync-matches      # Cron job completo
```

## 🎯 Flujo de Uso Típico

1. **Registrarse/Login** → Crear cuenta o iniciar sesión
2. **Dashboard** → Ver próximos partidos y ranking
3. **Predicciones** → Hacer predicciones de marcadores
4. **Esperar** → Los partidos finalizan y se actualizan resultados
5. **Leaderboard** → Ver tu posición en el ranking

## 📁 Estructura Clave

```
src/app/
├── core/services/          # Lógica de negocio
├── features/               # Componentes de páginas
│   ├── auth/              # Login/Register
│   ├── dashboard/         # Página principal
│   ├── predictions/       # Hacer predicciones
│   └── leaderboard/       # Tabla de posiciones
└── environments/          # Configuración

server/routes/api/         # Backend API
├── sync/                  # Sincronización manual
└── cron/                  # Tareas automáticas

supabase/migrations/       # Esquema de base de datos
```

## 🐛 Problemas Comunes

### No se muestran partidos
```bash
curl -X POST http://localhost:5173/api/sync/matches
```

### Error de autenticación
Verificar credenciales en `src/environments/environment.ts`

### Puerto ocupado
```bash
# Cambiar puerto en vite.config.ts o matar proceso
lsof -ti:5173 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5173   # Windows
```

## 📚 Documentación Completa

- **README.md** - Documentación general del proyecto
- **SETUP.md** - Guía detallada de configuración
- **AGENTS.md** - Guía para agentes de IA y desarrolladores

## 🎉 ¡Listo para Jugar!

Una vez completados los pasos, tu aplicación estará lista para:
- ✅ Registrar usuarios
- ✅ Hacer predicciones
- ✅ Calcular puntos automáticamente
- ✅ Mostrar ranking en tiempo real

---

**Made with Bob** 🤖

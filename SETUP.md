# 🚀 Guía de Configuración Inicial - Quiniela Mundial

Esta guía te llevará paso a paso para configurar y ejecutar la aplicación por primera vez.

## ✅ Pre-requisitos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- [pnpm](https://pnpm.io/) - Gestor de paquetes
- [Git](https://git-scm.com/)
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- API Token de [football-data.org](https://www.football-data.org/) (gratuita)

## 📦 Paso 1: Instalación de Dependencias

```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm

# Instalar dependencias del proyecto
pnpm install
```

## 🗄️ Paso 2: Configurar Supabase

### Opción A: Usar el Proyecto Existente (Recomendado)

El proyecto ya está configurado con las credenciales de Supabase:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar sesión en Supabase
supabase login

# Vincular al proyecto existente
supabase link --project-ref txxlwgpjqgffkexkyrnj

# Aplicar migraciones
supabase db push
```

### Opción B: Crear un Nuevo Proyecto

Si prefieres usar tu propio proyecto de Supabase:

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Obtener URL y anon key del proyecto
3. Actualizar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'TU_SUPABASE_URL',
    key: 'TU_SUPABASE_ANON_KEY',
  },
  footballApi: {
    url: 'https://api.football-data.org/v4',
    token: '9747e3521f4e4d82bb417f465c606180',
  },
};
```

4. Aplicar migraciones:

```bash
supabase link --project-ref TU_PROJECT_REF
supabase db push
```

## 👥 Paso 3: Crear Usuarios de Prueba

### Opción 1: Desde el Dashboard de Supabase

1. Ir a tu proyecto en [supabase.com](https://supabase.com)
2. Navegar a **Authentication** > **Users**
3. Click en **Add user** > **Create new user**
4. Crear usuarios con estos datos:

**Usuario Admin:**
- Email: `admin@quiniela.com`
- Password: `Admin123!`
- User Metadata:
```json
{
  "username": "admin",
  "full_name": "Administrador Quiniela"
}
```

**Usuario de Prueba 1:**
- Email: `juan.perez@example.com`
- Password: `User123!`
- User Metadata:
```json
{
  "username": "juanperez",
  "full_name": "Juan Pérez"
}
```

### Opción 2: Desde la Aplicación

Simplemente ejecuta la aplicación y regístrate usando el formulario de registro.

## ⚽ Paso 4: Sincronizar Datos del Mundial

Una vez que la aplicación esté corriendo, sincroniza los datos:

```bash
# Iniciar la aplicación
pnpm dev

# En otra terminal, sincronizar equipos y partidos
curl -X POST http://localhost:5173/api/sync/matches
```

Esto descargará:
- Equipos participantes
- Calendario de partidos
- Grupos y fases

## 🚀 Paso 5: Ejecutar la Aplicación

```bash
# Modo desarrollo
pnpm dev
```

La aplicación estará disponible en: **http://localhost:5173**

## 🔐 Paso 6: Iniciar Sesión

1. Abre http://localhost:5173
2. Serás redirigido a `/login`
3. Usa las credenciales de los usuarios que creaste:
   - Email: `admin@quiniela.com`
   - Password: `Admin123!`

## ✨ Paso 7: Verificar Funcionalidades

### Dashboard
- Deberías ver los próximos partidos
- El top 10 del ranking (inicialmente vacío)

### Predicciones
- Navega a "Mis Predicciones"
- Ingresa marcadores para partidos próximos
- Guarda tus predicciones

### Tabla de Posiciones
- Navega a "Tabla de Posiciones"
- Verás el ranking de todos los usuarios

## 🔄 Configurar Sincronización Automática (Opcional)

Para mantener los datos actualizados automáticamente:

### Opción 1: Cron Job Local

Crear un cron job que ejecute:

```bash
# Cada hora
0 * * * * curl http://localhost:5173/api/cron/sync-matches
```

### Opción 2: Servicio de Cron Externo

Usar servicios como:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

Configurar para llamar a: `https://tu-dominio.com/api/cron/sync-matches`

## 🧪 Verificar la Instalación

### 1. Verificar Base de Datos

```bash
# Conectarse a Supabase
supabase db remote

# Verificar tablas
\dt

# Verificar usuarios
SELECT * FROM public.users;

# Verificar equipos
SELECT * FROM public.teams;

# Verificar partidos
SELECT * FROM public.matches;
```

### 2. Verificar API Endpoints

```bash
# Sincronizar partidos
curl -X POST http://localhost:5173/api/sync/matches

# Actualizar resultados
curl -X POST http://localhost:5173/api/sync/results

# Cron job
curl http://localhost:5173/api/cron/sync-matches
```

## 🐛 Solución de Problemas

### Error: "Cannot find module"

```bash
# Limpiar e instalar de nuevo
rm -rf node_modules
pnpm install
```

### Error: "Supabase connection failed"

1. Verificar que las credenciales en `environment.ts` sean correctas
2. Verificar que el proyecto de Supabase esté activo
3. Verificar la conexión a internet

### Error: "Football API rate limit"

La API gratuita tiene límites:
- 10 llamadas por minuto
- 100 llamadas por día

Espera unos minutos antes de volver a intentar.

### Los partidos no se muestran

1. Verificar que se ejecutó la sincronización:
```bash
curl -X POST http://localhost:5173/api/sync/matches
```

2. Verificar en Supabase Dashboard que hay datos en la tabla `matches`

### Las predicciones no se guardan

1. Verificar que el usuario esté autenticado
2. Verificar que el partido no esté bloqueado (`is_locked = false`)
3. Verificar que el partido no haya comenzado

## 📱 Probar en Diferentes Dispositivos

### Móvil
```bash
# Obtener IP local
ipconfig  # Windows
ifconfig  # Mac/Linux

# Acceder desde móvil
http://TU_IP_LOCAL:5173
```

### Tablet y Desktop
La aplicación es completamente responsiva y se adapta automáticamente.

## 🚀 Desplegar a Producción

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Netlify

```bash
# Build
pnpm build

# Desplegar carpeta dist/analog/public
```

### Variables de Entorno en Producción

Configurar en tu plataforma de hosting:

```
VITE_SUPABASE_URL=https://txxlwgpjqgffkexkyrnj.supabase.co
VITE_SUPABASE_KEY=tu_supabase_anon_key
FOOTBALL_API_TOKEN=9747e3521f4e4d82bb417f465c606180
```

## 📚 Próximos Pasos

1. ✅ Crear más usuarios de prueba
2. ✅ Hacer predicciones para varios partidos
3. ✅ Esperar a que finalicen partidos (o simular resultados en BD)
4. ✅ Ver cómo se actualizan los puntos automáticamente
5. ✅ Explorar la tabla de posiciones

## 🆘 Soporte

Si encuentras problemas:

1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor
3. Consulta la documentación en `README.md` y `AGENTS.md`
4. Abre un issue en el repositorio

## 🎉 ¡Listo!

Tu aplicación de Quiniela Mundial está configurada y lista para usar.

**¡Que gane el mejor predictor!** ⚽🏆

---

**Made with Bob** 🤖

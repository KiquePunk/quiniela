# ⚽ Quiniela Mundial - Aplicación de Predicciones

Aplicación web completa para gestionar una quiniela del Mundial de Fútbol, construida con Angular, Analog.js y Supabase.

## 🚀 Características

- **Autenticación de Usuarios**: Sistema completo de registro e inicio de sesión con Supabase Auth
- **Dashboard Interactivo**: Visualización de próximos partidos y ranking en tiempo real
- **Sistema de Predicciones**: Los usuarios pueden predecir marcadores antes de que inicien los partidos
- **Bloqueo Automático**: Las predicciones se bloquean automáticamente cuando comienza un partido
- **Integración con API Externa**: Sincronización automática con football-data.org para obtener equipos, partidos y resultados
- **Motor de Puntuación**: Sistema automático que calcula puntos basado en predicciones vs resultados reales
- **Tabla de Posiciones**: Ranking en tiempo real de todos los participantes
- **Diseño Responsivo**: Interfaz optimizada para móviles, tablets y monitores ultrawide usando Tailwind CSS

## 📋 Requisitos Previos

- Node.js 18+ y pnpm
- Cuenta de Supabase (gratuita)
- API Token de football-data.org (gratuita)

## 🛠️ Stack Tecnológico

- **Frontend**: Angular 19 + Tailwind CSS
- **Backend**: Analog.js (API Routes)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **API Externa**: football-data.org
- **Gestor de Paquetes**: pnpm

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd quiniela-mundial
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar Supabase

#### Opción A: Usar Supabase Cloud (Recomendado)

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Obtener las credenciales del proyecto (URL y anon key)
3. Aplicar las migraciones:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar y vincular proyecto
supabase login
supabase link --project-ref txxlwgpjqgffkexkyrnj

# Aplicar migraciones
supabase db push
```

#### Opción B: Usar Supabase Local

```bash
# Iniciar Supabase local
supabase start

# Aplicar migraciones
supabase db reset
```

### 4. Configurar Variables de Entorno

Las credenciales ya están configuradas en `src/environments/environment.ts`:

- **Supabase URL**: `https://txxlwgpjqgffkexkyrnj.supabase.co`
- **Supabase Key**: Ya configurada
- **Football API Token**: `9747e3521f4e4d82bb417f465c606180`

### 5. Crear Usuarios de Prueba

Ver instrucciones en `supabase/seed-users.sql` para crear usuarios de prueba.

**Usuarios recomendados:**
- admin@quiniela.com / Admin123!
- juan.perez@example.com / User123!
- maria.garcia@example.com / User123!

## 🚀 Ejecución

### Modo Desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`

### Modo Producción

```bash
# Construir
pnpm build

# Ejecutar
pnpm start
```

## 📁 Estructura del Proyecto

```
quiniela-mundial/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/          # Guards de autenticación
│   │   │   ├── interceptors/    # HTTP interceptors
│   │   │   ├── models/          # Interfaces y tipos
│   │   │   └── services/        # Servicios de negocio
│   │   ├── features/
│   │   │   ├── auth/            # Login y registro
│   │   │   ├── dashboard/       # Dashboard principal
│   │   │   ├── predictions/     # Gestión de predicciones
│   │   │   └── leaderboard/     # Tabla de posiciones
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   └── environments/            # Configuración de entornos
├── server/
│   └── routes/
│       └── api/
│           ├── sync/            # Endpoints de sincronización
│           └── cron/            # Tareas programadas
├── supabase/
│   ├── migrations/              # Migraciones de BD
│   ├── config.toml              # Configuración de Supabase
│   └── seed-users.sql           # Script de usuarios de prueba
├── angular.json
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## 🔄 Sincronización con Football API

### Sincronización Manual

```bash
# Sincronizar equipos y partidos
curl -X POST http://localhost:5173/api/sync/matches

# Actualizar resultados
curl -X POST http://localhost:5173/api/sync/results
```

### Sincronización Automática (Cron)

El endpoint `/api/cron/sync-matches` puede configurarse para ejecutarse periódicamente:

```bash
# Ejemplo con cron (cada hora)
0 * * * * curl http://localhost:5173/api/cron/sync-matches
```

## 🎯 Sistema de Puntuación

- **3 puntos**: Acertar el marcador exacto
- **1 punto**: Acertar el resultado (ganador o empate)
- **0 puntos**: No acertar

## 🗄️ Esquema de Base de Datos

### Tablas Principales

- **users**: Perfiles de usuarios
- **teams**: Equipos del Mundial
- **matches**: Partidos del torneo
- **predictions**: Predicciones de los usuarios

### Vistas

- **leaderboard**: Ranking calculado automáticamente

### Funciones

- `calculate_prediction_points()`: Calcula puntos de una predicción
- `update_predictions_points()`: Actualiza puntos cuando finaliza un partido
- `lock_started_matches()`: Bloquea partidos que ya comenzaron

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Autenticación JWT con Supabase
- Políticas de acceso granulares
- Validación de datos en frontend y backend

## 🧪 Testing

```bash
pnpm test
```

## 📱 Características Responsivas

- **Móvil**: Diseño optimizado para pantallas pequeñas
- **Tablet**: Layout adaptativo
- **Desktop**: Aprovecha el espacio disponible
- **Ultrawide**: Diseño fluido sin límites de ancho

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- Desarrollado con ❤️ por el equipo de Quiniela Mundial

## 🆘 Soporte

Para reportar bugs o solicitar features, por favor abre un issue en el repositorio.

## 🔗 Enlaces Útiles

- [Documentación de Angular](https://angular.io/docs)
- [Documentación de Analog.js](https://analogjs.org)
- [Documentación de Supabase](https://supabase.com/docs)
- [Football Data API](https://www.football-data.org/documentation/quickstart)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Made with Bob** 🤖

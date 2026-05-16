# 🤖 AGENTS.md - Guía para Agentes de IA

Este documento proporciona contexto y guías para agentes de IA que trabajen en este proyecto.

## 📋 Resumen del Proyecto

**Quiniela Mundial** es una aplicación web full-stack para gestionar predicciones de partidos del Mundial de Fútbol. Los usuarios pueden registrarse, hacer predicciones de marcadores, y competir en un ranking basado en la precisión de sus predicciones.

## 🏗️ Arquitectura

### Stack Tecnológico

- **Frontend**: Angular 19 (Standalone Components)
- **Backend**: Analog.js (API Routes en el mismo proyecto)
- **Base de Datos**: Supabase (PostgreSQL con RLS)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS
- **Gestor de Paquetes**: pnpm

### Estructura de Carpetas

```
src/app/
├── core/                    # Funcionalidad central
│   ├── guards/             # AuthGuard para rutas protegidas
│   ├── interceptors/       # HTTP interceptor para tokens
│   ├── models/             # Interfaces TypeScript
│   └── services/           # Servicios de negocio
├── features/               # Módulos de características
│   ├── auth/              # Login y registro
│   ├── dashboard/         # Vista principal
│   ├── predictions/       # Gestión de predicciones
│   └── leaderboard/       # Tabla de posiciones
└── environments/          # Configuración

server/routes/api/         # Backend con Analog.js
├── sync/                  # Endpoints de sincronización
└── cron/                  # Tareas programadas

supabase/
├── migrations/            # Esquema de base de datos
└── config.toml           # Configuración local
```

## 🔑 Conceptos Clave

### 1. Analog.js

Analog.js permite crear API routes en el mismo proyecto Angular:
- Archivos en `server/routes/` se convierten en endpoints
- `*.get.ts` → GET endpoint
- `*.post.ts` → POST endpoint
- Usa `defineEventHandler` de h3

### 2. Supabase

- **Auth**: Manejo de usuarios y sesiones
- **Database**: PostgreSQL con Row Level Security
- **Realtime**: Actualizaciones en tiempo real (no implementado aún)

### 3. Sistema de Puntuación

```typescript
// Lógica de puntos
if (predicción === resultado_real) return 3;  // Marcador exacto
if (ganador_predicho === ganador_real) return 1;  // Resultado correcto
return 0;  // Sin puntos
```

## 🎯 Flujos Principales

### Flujo de Autenticación

1. Usuario se registra → `AuthService.register()`
2. Supabase crea usuario en `auth.users`
3. Trigger `handle_new_user()` crea perfil en `public.users`
4. Usuario inicia sesión → Token JWT almacenado
5. `authInterceptor` agrega token a peticiones API

### Flujo de Predicciones

1. Usuario ve partidos próximos
2. Ingresa marcador predicho
3. `PredictionService.savePrediction()` guarda en BD
4. Sistema verifica `is_locked` y `utc_date`
5. Cuando partido finaliza, cron actualiza resultados
6. `update_predictions_points()` calcula puntos
7. Vista `leaderboard` muestra ranking actualizado

### Flujo de Sincronización

1. Cron job llama `/api/cron/sync-matches`
2. Endpoint consulta football-data.org API
3. Actualiza equipos y partidos en Supabase
4. Para partidos finalizados, calcula puntos
5. Bloquea partidos que ya comenzaron

## 🛠️ Tareas Comunes

### Agregar un Nuevo Servicio

```typescript
// src/app/core/services/nuevo.service.ts
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class NuevoService {
  constructor(private supabase: SupabaseService) {}
  
  // Métodos del servicio
}
```

### Crear un Nuevo Endpoint API

```typescript
// server/routes/api/nuevo-endpoint.post.ts
import { defineEventHandler } from 'h3';
import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  // Lógica del endpoint
  return { success: true, data: {} };
});
```

### Agregar una Nueva Tabla

1. Crear migración en `supabase/migrations/`
2. Definir tabla con RLS habilitado
3. Crear políticas de seguridad
4. Aplicar con `supabase db push`

### Crear un Nuevo Componente

```bash
# Componente standalone
ng generate component features/nueva-feature --standalone
```

## 🔒 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

```sql
-- Ejemplo de política
CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
```

### Validaciones

- **Frontend**: Validación de formularios con Reactive Forms
- **Backend**: Validación en endpoints API
- **Base de Datos**: Constraints y triggers

## 📊 Modelos de Datos

### User
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  total_points: number;
}
```

### Match
```typescript
interface Match {
  id: number;
  utc_date: string;
  status: MatchStatus;
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

### Logs Útiles

```typescript
// En servicios
console.log('Service data:', data);

// En componentes
console.log('Component state:', this.state);

// En endpoints
console.log('API request:', event);
```

### Herramientas

- **Angular DevTools**: Inspección de componentes
- **Supabase Dashboard**: Ver datos en tiempo real
- **Network Tab**: Monitorear peticiones HTTP

## 🧪 Testing

### Estructura de Tests

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceName);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

## 🚀 Despliegue

### Variables de Entorno

Configurar en el hosting:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_KEY`
- `FOOTBALL_API_TOKEN`

### Build

```bash
pnpm build
# Output en dist/analog/
```

## 📝 Convenciones de Código

### Nombres

- **Componentes**: PascalCase (`DashboardComponent`)
- **Servicios**: PascalCase + Service (`AuthService`)
- **Interfaces**: PascalCase (`User`, `Match`)
- **Variables**: camelCase (`currentUser`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`)

### Estructura de Archivos

- Un componente por archivo
- Servicios en `core/services/`
- Modelos en `core/models/`
- Features agrupadas en carpetas

### Imports

```typescript
// Angular core
import { Component } from '@angular/core';

// Angular modules
import { CommonModule } from '@angular/common';

// Third party
import { createClient } from '@supabase/supabase-js';

// App imports
import { AuthService } from './services/auth.service';
```

## 🔄 Flujo de Trabajo Git

```bash
# Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# Commits descriptivos
git commit -m "feat: agregar filtro de partidos por grupo"

# Push y PR
git push origin feature/nueva-funcionalidad
```

## 📚 Recursos Adicionales

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Analog.js Docs](https://analogjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribuciones

Al trabajar en este proyecto:

1. **Mantén la consistencia**: Sigue los patrones existentes
2. **Documenta cambios**: Actualiza README y AGENTS.md
3. **Prueba localmente**: Verifica que todo funcione antes de commit
4. **RLS siempre**: Nunca desactives Row Level Security
5. **Tipos estrictos**: Usa TypeScript correctamente

## ⚠️ Consideraciones Importantes

### Performance

- Usa `trackBy` en `@for` loops
- Implementa lazy loading para rutas
- Optimiza queries de Supabase con `.select()`

### Seguridad

- Nunca expongas tokens en el código
- Valida datos en frontend Y backend
- Usa políticas RLS restrictivas por defecto

### UX

- Muestra estados de carga
- Maneja errores gracefully
- Proporciona feedback al usuario

---

**Made with Bob** 🤖

Este documento debe actualizarse conforme el proyecto evoluciona.

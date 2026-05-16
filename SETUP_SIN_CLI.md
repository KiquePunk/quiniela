# 🚀 Configuración SIN Supabase CLI

Esta guía te permite configurar el proyecto **sin necesidad de instalar Supabase CLI**, usando únicamente el Dashboard web de Supabase.

## ✅ Opción 1: Usar Supabase Dashboard (Recomendado)

### Paso 1: Acceder al Proyecto

1. Ve a https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Abre el proyecto: https://supabase.com/dashboard/project/txxlwgpjqgffkexkyrnj

### Paso 2: Aplicar el Esquema de Base de Datos

#### 2.1 Abrir SQL Editor

1. En el menú lateral, click en **SQL Editor**
2. Click en **New query**

#### 2.2 Ejecutar Primera Migración

1. Copia todo el contenido de `supabase/migrations/001_initial_schema.sql`
2. Pégalo en el editor SQL
3. Click en **Run** (o presiona Ctrl+Enter)
4. Espera a que termine (verás "Success" en verde)

#### 2.3 Ejecutar Segunda Migración

1. Crea una nueva query
2. Copia todo el contenido de `supabase/migrations/002_seed_data.sql`
3. Pégalo en el editor SQL
4. Click en **Run**
5. Espera confirmación de éxito

### Paso 3: Verificar las Tablas

1. En el menú lateral, click en **Table Editor**
2. Deberías ver estas tablas:
   - ✅ users
   - ✅ teams
   - ✅ matches
   - ✅ predictions

### Paso 4: Crear Usuarios de Prueba

#### Opción A: Desde el Dashboard

1. Ve a **Authentication** > **Users**
2. Click en **Add user** > **Create new user**
3. Completa los datos:

**Usuario Admin:**
```
Email: admin@quiniela.com
Password: Admin123!
```

4. Después de crear, click en el usuario
5. Ve a la pestaña **User Metadata**
6. Click en **Edit**
7. Agrega este JSON:
```json
{
  "username": "admin",
  "full_name": "Administrador Quiniela"
}
```
8. Click en **Save**

**Usuario de Prueba:**
```
Email: juan.perez@example.com
Password: User123!
User Metadata:
{
  "username": "juanperez",
  "full_name": "Juan Pérez"
}
```

#### Opción B: Desde la Aplicación

Simplemente regístrate usando el formulario de registro de la app.

### Paso 5: Instalar Dependencias del Proyecto

```bash
# En la carpeta del proyecto
pnpm install
```

### Paso 6: Iniciar la Aplicación

```bash
pnpm dev
```

La aplicación estará en: http://localhost:5173

### Paso 7: Sincronizar Datos del Mundial

Abre una nueva terminal y ejecuta:

```bash
curl -X POST http://localhost:5173/api/sync/matches
```

O simplemente abre en tu navegador:
```
http://localhost:5173/api/cron/sync-matches
```

## ✅ Opción 2: Usar npx (Sin Instalación Global)

Si prefieres usar comandos de Supabase sin instalarlo globalmente:

```bash
# Usar npx para ejecutar comandos sin instalar
npx supabase login
npx supabase link --project-ref txxlwgpjqgffkexkyrnj
npx supabase db push
```

## ✅ Opción 3: Instalar Localmente en el Proyecto

```bash
# Instalar como dependencia de desarrollo
pnpm add -D supabase

# Usar con npx
npx supabase login
npx supabase link --project-ref txxlwgpjqgffkexkyrnj
npx supabase db push
```

## 🔍 Verificar que Todo Funciona

### 1. Verificar Tablas en Dashboard

1. Ve a **Table Editor**
2. Click en cada tabla y verifica que existan
3. La tabla `teams` debería tener algunos equipos de ejemplo
4. La tabla `matches` debería tener algunos partidos de ejemplo

### 2. Verificar Usuarios

1. Ve a **Authentication** > **Users**
2. Deberías ver los usuarios que creaste
3. Ve a **Table Editor** > **users**
4. Deberías ver los perfiles de usuario creados automáticamente

### 3. Probar la Aplicación

1. Abre http://localhost:5173
2. Inicia sesión con: admin@quiniela.com / Admin123!
3. Deberías ver el dashboard
4. Ve a "Mis Predicciones"
5. Deberías ver los partidos de ejemplo

## 🐛 Solución de Problemas

### No veo las tablas

1. Verifica que ejecutaste ambos scripts SQL
2. Revisa el **SQL Editor** > **History** para ver si hubo errores
3. Si hay errores, cópialos y revisa la sintaxis

### Los usuarios no se crean en la tabla `users`

1. Verifica que el trigger `handle_new_user` existe:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Si no existe, ejecuta de nuevo la parte del trigger en `001_initial_schema.sql`

### Error al sincronizar partidos

1. Verifica que la aplicación esté corriendo
2. Verifica tu conexión a internet
3. La API de football-data.org puede tener límites de rate:
   - 10 llamadas por minuto
   - 100 llamadas por día

### No puedo hacer predicciones

1. Verifica que estés autenticado
2. Verifica que haya partidos en la tabla `matches`
3. Verifica que los partidos no estén bloqueados (`is_locked = false`)

## 📋 Checklist Final

- [ ] Proyecto de Supabase accesible en el dashboard
- [ ] Script `001_initial_schema.sql` ejecutado exitosamente
- [ ] Script `002_seed_data.sql` ejecutado exitosamente
- [ ] Tablas visibles en Table Editor
- [ ] Al menos un usuario creado
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Aplicación corriendo (`pnpm dev`)
- [ ] Datos sincronizados (equipos y partidos)
- [ ] Login exitoso
- [ ] Predicción guardada correctamente

## 🎉 ¡Listo!

Ahora tienes la aplicación funcionando sin necesidad de instalar Supabase CLI. Todas las operaciones se pueden hacer desde el Dashboard web.

## 📚 Recursos Útiles

- **Dashboard de Supabase**: https://supabase.com/dashboard/project/txxlwgpjqgffkexkyrnj
- **SQL Editor**: Para ejecutar queries directamente
- **Table Editor**: Para ver y editar datos
- **Authentication**: Para gestionar usuarios
- **API Docs**: Para ver las URLs de tu API

---

**Made with Bob** 🤖

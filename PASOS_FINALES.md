# 🎯 Pasos Finales para Ejecutar el Proyecto

Sigue estos pasos en orden para poner en marcha la aplicación.

## ✅ Paso 1: Limpiar Proyecto Actual

```powershell
# En la raíz del proyecto (C:\Users\jeper\Personal\Repos\quiniela)

# Eliminar node_modules y archivos de lock
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json, pnpm-lock.yaml -ErrorAction SilentlyContinue

# Eliminar vite.config.ts (ya no lo necesitamos)
Remove-Item vite.config.ts -ErrorAction SilentlyContinue

# Eliminar carpeta server (usaremos backend en su lugar)
Remove-Item -Recurse -Force server -ErrorAction SilentlyContinue
```

## ✅ Paso 2: Instalar Dependencias del Frontend

```powershell
pnpm install
```

## ✅ Paso 3: Instalar Dependencias del Backend

```powershell
cd backend
pnpm install
cd ..
```

## ✅ Paso 4: Configurar Supabase

### Opción A: Usar Dashboard Web (Más Fácil)

1. Ve a https://supabase.com/dashboard/project/txxlwgpjqgffkexkyrnj
2. SQL Editor → Nueva query
3. Copia y ejecuta `supabase/migrations/001_initial_schema.sql`
4. Copia y ejecuta `supabase/migrations/002_seed_data.sql`

### Opción B: Usar CLI

```powershell
npx supabase login
npx supabase link --project-ref txxlwgpjqgffkexkyrnj
npx supabase db push
```

## ✅ Paso 5: Crear Usuario de Prueba

En Supabase Dashboard:
1. Authentication → Users → Add user
2. Email: `admin@quiniela.com`
3. Password: `Admin123!`
4. User Metadata:
```json
{
  "username": "admin",
  "full_name": "Administrador Quiniela"
}
```

## ✅ Paso 6: Ejecutar la Aplicación

### Opción A: Todo Junto (Recomendado)

```powershell
pnpm run dev:all
```

### Opción B: Por Separado

Terminal 1 - Frontend:
```powershell
pnpm run dev
```

Terminal 2 - Backend:
```powershell
pnpm run backend
```

## ✅ Paso 7: Sincronizar Datos del Mundial

Una vez que ambos servidores estén corriendo, en una nueva terminal:

```powershell
curl -X POST http://localhost:3000/api/sync/matches
```

O abre en el navegador:
```
http://localhost:3000/api/cron/sync-matches
```

## 🌐 URLs de la Aplicación

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## ✅ Verificación

1. ✅ Frontend abre automáticamente en http://localhost:4200
2. ✅ Backend muestra: "Backend running on port 3000"
3. ✅ Puedes hacer login con admin@quiniela.com / Admin123!
4. ✅ Dashboard muestra próximos partidos
5. ✅ Puedes hacer predicciones
6. ✅ Leaderboard muestra ranking

## 🎯 Comandos Útiles

```powershell
# Frontend
pnpm run dev              # Iniciar frontend
pnpm run build            # Construir para producción

# Backend
pnpm run backend          # Iniciar backend
cd backend && pnpm start  # Iniciar backend directamente

# Ambos
pnpm run dev:all          # Iniciar frontend y backend juntos

# Sincronización
curl -X POST http://localhost:3000/api/sync/matches   # Sincronizar partidos
curl -X POST http://localhost:3000/api/sync/results   # Actualizar resultados
```

## 🐛 Solución de Problemas

### Error: "ng: command not found"
```powershell
pnpm install -g @angular/cli
```

### Error: "Cannot find module"
```powershell
# En la raíz
pnpm install

# En backend
cd backend
pnpm install
cd ..
```

### Backend no inicia
```powershell
cd backend
node server.js
```

### Frontend no compila
```powershell
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml
pnpm install
```

## 🎉 ¡Listo!

Tu aplicación de Quiniela Mundial ahora está funcionando con:
- ✅ Angular CLI estándar (más estable)
- ✅ Backend Express separado
- ✅ Todos los endpoints API funcionando
- ✅ Sincronización automática cada hora
- ✅ Supabase configurado correctamente

---

**Made with Bob** 🤖

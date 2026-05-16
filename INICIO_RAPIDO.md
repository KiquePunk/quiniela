# 🚀 Inicio Rápido con pnpm

## ⚡ Comandos Rápidos

```powershell
# 1. Instalar dependencias
pnpm install
cd backend && pnpm install && cd ..

# 2. Ejecutar aplicación (frontend + backend)
pnpm run dev:all
```

## 📋 Pasos Detallados

### 1️⃣ Instalar Dependencias

```powershell
# Frontend
pnpm install

# Backend
cd backend
pnpm install
cd ..
```

### 2️⃣ Configurar Supabase (Solo Primera Vez)

Ve a: https://supabase.com/dashboard/project/txxlwgpjqgffkexkyrnj

1. **SQL Editor** → Nueva query
2. Ejecuta `supabase/migrations/001_initial_schema.sql`
3. Ejecuta `supabase/migrations/002_seed_data.sql`

### 3️⃣ Crear Usuario de Prueba (Solo Primera Vez)

En Supabase Dashboard:
- **Authentication** → **Users** → **Add user**
- Email: `admin@quiniela.com`
- Password: `Admin123!`

### 4️⃣ Ejecutar Aplicación

```powershell
# Opción A: Todo junto (recomendado)
pnpm run dev:all

# Opción B: Por separado
# Terminal 1:
pnpm run dev

# Terminal 2:
pnpm run backend
```

### 5️⃣ Sincronizar Datos del Mundial

Una vez que los servidores estén corriendo:

```powershell
curl -X POST http://localhost:3000/api/sync/matches
```

## 🌐 URLs

- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## 🔑 Credenciales de Prueba

- **Email**: admin@quiniela.com
- **Password**: Admin123!

## 🎯 Comandos Útiles

```powershell
# Desarrollo
pnpm run dev              # Solo frontend
pnpm run backend          # Solo backend
pnpm run dev:all          # Frontend + Backend

# Build
pnpm run build            # Construir para producción

# Sincronización
curl -X POST http://localhost:3000/api/sync/matches   # Sincronizar partidos
curl -X POST http://localhost:3000/api/sync/results   # Actualizar resultados
```

## 🐛 Solución Rápida de Problemas

### Error de compilación TypeScript

```powershell
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml
pnpm install
```

### Backend no inicia

```powershell
cd backend
node server.js
```

### Frontend no abre

```powershell
pnpm run dev
# Luego abre manualmente: http://localhost:4200
```

## ✅ Verificación

1. ✅ Frontend en http://localhost:4200
2. ✅ Backend muestra: "Backend running on port 3000"
3. ✅ Login funciona con admin@quiniela.com
4. ✅ Dashboard muestra partidos
5. ✅ Puedes hacer predicciones

---

**Made with Bob** 🤖

Para más detalles, consulta `PASOS_FINALES.md`
# 🔄 Migración a Angular CLI + Express Backend

Guía paso a paso para migrar el proyecto a una arquitectura más estable.

## 📋 Paso 1: Limpiar Proyecto Actual

```bash
# En PowerShell, dentro de C:\Users\jeper\Personal\Repos\quiniela

# Eliminar dependencias y archivos de configuración problemáticos
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json, pnpm-lock.yaml -ErrorAction SilentlyContinue
Remove-Item vite.config.ts -ErrorAction SilentlyContinue
```

## 📦 Paso 2: Actualizar package.json

Reemplaza el contenido de `package.json` con:

```json
{
  "name": "quiniela-mundial",
  "version": "1.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve --port 4200",
    "dev": "ng serve --port 4200 --open",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "backend": "cd backend && node server.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run backend\""
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^18.2.0",
    "@angular/common": "^18.2.0",
    "@angular/compiler": "^18.2.0",
    "@angular/core": "^18.2.0",
    "@angular/forms": "^18.2.0",
    "@angular/platform-browser": "^18.2.0",
    "@angular/platform-browser-dynamic": "^18.2.0",
    "@angular/router": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "rxjs": "^7.8.1",
    "tslib": "^2.6.2",
    "zone.js": "^0.14.3"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^18.2.0",
    "@angular/cli": "^18.2.0",
    "@angular/compiler-cli": "^18.2.0",
    "@types/node": "^20.10.0",
    "autoprefixer": "^10.4.16",
    "concurrently": "^8.2.2",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "~5.4.0"
  }
}
```

## 🔧 Paso 3: Instalar Dependencias

```bash
npm install
```

## 🖥️ Paso 4: Crear Backend con Express

```bash
# Crear carpeta backend
mkdir backend
cd backend

# Crear package.json del backend
npm init -y

# Instalar dependencias del backend
npm install express @supabase/supabase-js cors dotenv node-cron

# Volver a la raíz
cd ..
```

## 📁 Paso 5: Crear Archivos del Backend

Los archivos del backend se crearán automáticamente en los siguientes pasos.

## 🚀 Paso 6: Ejecutar el Proyecto

### Opción A: Frontend y Backend por Separado

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run backend
```

### Opción B: Todo Junto (Recomendado)

```bash
npm run dev:all
```

## 🌐 URLs

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

## ✅ Verificación

1. Frontend debe abrir automáticamente en el navegador
2. Backend debe mostrar: "Backend running on port 3000"
3. Puedes probar el backend en: http://localhost:3000/api/health

## 📝 Próximos Pasos

1. ✅ Limpiar proyecto
2. ✅ Actualizar package.json
3. ✅ Instalar dependencias
4. ✅ Crear backend
5. ⏳ Configurar servicios para usar nuevo backend
6. ⏳ Probar aplicación completa

---

**Made with Bob** 🤖

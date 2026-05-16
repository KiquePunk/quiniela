# 🔧 Solución al Error de Instalación

El error que estás experimentando es un problema conocido con pnpm en Windows. Aquí están las soluciones:

## ✅ Solución 1: Usar npm (Recomendado)

npm viene incluido con Node.js y es más estable en Windows:

```bash
# 1. Limpiar archivos de pnpm
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml -ErrorAction SilentlyContinue

# 2. Instalar con npm
npm install

# 3. Ejecutar la aplicación
npm run dev
```

## ✅ Solución 2: Reinstalar pnpm

Si prefieres usar pnpm, reinstálalo correctamente:

```bash
# Desinstalar pnpm actual
npm uninstall -g pnpm

# Instalar pnpm usando npm
npm install -g pnpm@latest

# Limpiar caché
pnpm store prune

# Instalar dependencias
pnpm install
```

## ✅ Solución 3: Ejecutar PowerShell como Administrador

El error puede ser por permisos:

1. Click derecho en PowerShell
2. Seleccionar "Ejecutar como administrador"
3. Navegar a tu proyecto:
```bash
cd C:\Users\jeper\Personal\Repos\quiniela
```
4. Ejecutar:
```bash
pnpm install
```

## ✅ Solución 4: Cambiar Política de Ejecución

```bash
# Ejecutar como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Luego intentar de nuevo
pnpm install
```

## 🎯 Solución Rápida (La Más Fácil)

**Simplemente usa npm en lugar de pnpm:**

```bash
# Todos los comandos funcionan igual
npm install          # en lugar de pnpm install
npm run dev          # en lugar de pnpm dev
npm run build        # en lugar de pnpm build
```

## 📝 Actualizar Scripts en package.json

Si decides usar npm permanentemente, los scripts ya están configurados y funcionarán sin cambios:

```json
{
  "scripts": {
    "dev": "analog dev",      // npm run dev
    "build": "analog build",  // npm run build
    "start": "node dist/analog/server/index.mjs",
    "test": "vitest"          // npm test
  }
}
```

## 🚀 Pasos Completos con npm

```bash
# 1. Limpiar (si ya intentaste con pnpm)
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item pnpm-lock.yaml -ErrorAction SilentlyContinue

# 2. Instalar dependencias
npm install

# 3. Configurar Supabase (usando npx)
npx supabase login
npx supabase link --project-ref txxlwgpjqgffkexkyrnj
npx supabase db push

# 4. Iniciar aplicación
npm run dev

# 5. En otra terminal, sincronizar datos
curl -X POST http://localhost:5173/api/sync/matches
```

## ⚠️ Nota Importante

- **npm** y **pnpm** son intercambiables para este proyecto
- Todos los comandos funcionan igual, solo cambia el gestor
- npm es más estable en Windows
- El proyecto funcionará exactamente igual con ambos

## 🎉 Resultado Esperado

Después de `npm install`, deberías ver:

```
added 1234 packages in 2m
```

Y después de `npm run dev`:

```
VITE v5.0.10  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## 📚 Comandos Útiles con npm

```bash
npm install              # Instalar dependencias
npm run dev             # Modo desarrollo
npm run build           # Construir para producción
npm start               # Ejecutar producción
npm test                # Ejecutar tests
npm list                # Ver dependencias instaladas
npm outdated            # Ver paquetes desactualizados
```

---

**Recomendación:** Usa npm para este proyecto. Es más simple y evita problemas de permisos en Windows.

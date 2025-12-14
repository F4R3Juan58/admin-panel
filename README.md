# Admin Panel Monorepo

Base funcional para un sistema de administración unificado (web + NUI) para servidores FiveM con QBCore.

## Estructura

```
admin-panel/
  apps/
    web/              # Panel web (React + Vite + TS)
    nui/              # Panel NUI para FiveM (React + Vite + TS)
  packages/
    ui/               # Design system compartido (Tailwind + componentes)
    api/              # Cliente de API con adapters web/NUI
    types/            # Tipos compartidos
  fivem/
    qb-admin-backend/ # Recurso backend (Lua, QBCore, oxmysql)
    qb-admin-nui/     # Recurso NUI (carga build + puente)
  README.md
  schema.sql
```

## Requisitos

- Node.js 18+
- npm 9+
- MySQL/ MariaDB
- Servidor FiveM con QBCore y oxmysql

## Instalación rápida

```bash
npm install
npm run build
```

Para desarrollo web:

```bash
cd apps/web
npm install
npm run dev
```

Para desarrollo NUI:

```bash
cd apps/nui
npm install
npm run dev
```

## Recursos FiveM

1. Copia `fivem/qb-admin-backend` y `fivem/qb-admin-nui` a tu carpeta `resources/`.
2. Ejecuta el SQL de `schema.sql` en tu base de datos.
3. Añade en `server.cfg`:

```
ensure qb-admin-backend
ensure qb-admin-nui
```

## Permisos y configuración

- `fivem/qb-admin-backend/shared/config.lua` contiene las acciones habilitadas, rate limits y permisos por job/ace.
- Todas las acciones pasan por la cola `admin_actions` y son validadas servidor-side.

## Añadir nuevas acciones

1. Declara el tipo en `packages/types/src/actions.ts` y expórtalo en `ActionType`.
2. Añade validación de payload en `fivem/qb-admin-backend/server/actions.lua` y crea un handler en `server/handlers/`.
3. Expón la acción en el frontend usando `AdminApi.executeAction` (web o NUI). Usa los componentes de `packages/ui`.
4. Si la acción requiere UI nueva, añade una tarjeta/botón en las vistas correspondientes.

## Notas

- Listas largas usan virtualización básica.
- El backend incluye worker de cola, rate limit por actor/acción y validación de payload.
- No se ejecutan comandos arbitrarios desde el cliente; todos los `actionType` están controlados en servidor.

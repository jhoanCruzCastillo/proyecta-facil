# Proyecta Fácil

Plataforma de llenado asistido de fichas técnicas de inversión pública (Invierte.pe, Perú).

## Stack

- **Backend:** CodeIgniter 4 (PHP 8.3) — API REST pura, en `backend/`
- **Frontend:** Vue 3 + TypeScript + Vite — SPA, en `frontend/`
- **Base de datos:** MariaDB 11, corre en Docker (único componente contenedorizado)

Ver [`docs/database-design.md`](docs/database-design.md) para el modelo entidad-relación completo y el razonamiento de normalización.

## Arrancar en desarrollo

```bash
# 1. Base de datos
docker compose up -d

# 2. Backend (API en http://localhost:8080)
cd backend
php spark migrate   # solo la primera vez / cuando haya migraciones nuevas
php spark serve --port 8080

# 3. Frontend (en http://localhost:5180, otra terminal)
cd frontend
npm run dev -- --port 5180
```

## Estado actual

Base vacía y funcionando: ambos proyectos arrancan, el backend se conecta a MariaDB, y el esquema completo (34 tablas, 41 llaves foráneas) ya está migrado. Sin datos semilla ni endpoints de API todavía — eso viene en la siguiente etapa, cuando se defina la arquitectura de software sobre esta base.

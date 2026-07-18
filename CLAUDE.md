# Proyecta Fácil — app real

Plataforma de llenado asistido de fichas técnicas de inversión pública (Invierte.pe, Perú). Cliente: José Herrera.

Este es el **rewrite real** del prototipo funcional en `../book/templates_editor` (React + Vite + localStorage, sin backend). El prototipo ya validó exhaustivamente el modelo de dominio y la UX con el cliente — ante cualquier duda de comportamiento ("¿cómo debería verse/comportarse X?"), revisar primero cómo está resuelto ahí antes de diseñar desde cero.

## Stack

- **Backend:** CodeIgniter 4 (PHP 8.3) — API REST pura, en `backend/`. Nunca genera HTML ni usa vistas para el usuario final.
- **Frontend:** Vue 3 + TypeScript + Vite — SPA, en `frontend/`.
- **Base de datos:** MariaDB 11, único componente en Docker (`docker-compose.yml` en la raíz).
- **Deploy real (no en dev):** mismo dominio, Nginx enruta `/api/*` → PHP-FPM, todo lo demás → `frontend/dist` con fallback a `index.html`.

## Comandos

```bash
docker compose up -d                              # base de datos
cd backend && php spark serve --port 8080          # API
cd frontend && npm run dev -- --port 5180          # SPA
cd backend && php spark migrate                    # aplicar migraciones nuevas
```

## Documentación

- [`docs/database-design.md`](docs/database-design.md) — modelo entidad-relación completo, normalizado (1FN/2FN/3FN), con el razonamiento de cada decisión. **Fuente de verdad del esquema** — las migraciones (`backend/app/Database/Migrations/`) son su implementación, no al revés.
- Notion — "STACK TÉCNICO" y "DOCUMENTACIÓN, CONTEXTO PARA LA IA" (esquema JSON oficial de exportación a Excel, sigue vigente como referencia de qué debe poder producir la app).

## Convenciones de trabajo con el usuario

- **El usuario hace los commits él mismo.** Al terminar cambios, proponer el mensaje sugerido (conventional commits) al final de la respuesta — nunca ejecutar `git commit`/`git add` sin que lo pida explícitamente.
- **Al modelar estructura desde el Excel oficial real** (secciones, campos, posición de captura): extraer siempre del `.xlsm`/`.xlsx` real (celdas + merges), nunca asumir ni transcribir desde documentación o capturas de pantalla previas sin verificar contra el archivo.
- **Avanzar por partes con confirmación explícita** — si se está construyendo algo grande hoja por hoja / módulo por módulo, terminar una unidad completa, verificarla, y esperar a que el usuario diga algo como "continúa" antes de seguir con la siguiente. No acumular varias unidades sin revisión intermedia.
- **Priorizar fidelidad real sobre atajos calculados**, cuando hay elección: si algo puede resolverse "de verdad" (ej. fórmulas nativas de Excel en vez de solo el número calculado, preservar estilos/macros del archivo original) vs. una aproximación más simple dentro de la app, el usuario prefiere la solución fiel al 100%, aunque sea más compleja de implementar.

## Qué NO hacer

- No usar CodeIgniter para renderizar vistas de usuario final — es API-only.
- No guardar contraseñas en texto plano — usar `password_hash()` (Argon2id/bcrypt).
- No guardar archivos (Excel, imágenes, firmas) como base64 inline en la base de datos — van a Cloudinary, la BD solo guarda la URL.
- No exponer API keys de servicios de IA (OpenAI/Anthropic/Gemini) en el frontend Vue — todas las llamadas a IA pasan proxeadas por CodeIgniter.

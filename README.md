# WorkHub MTY — Frontend

> Aplicación web de reservación de espacios de trabajo y estacionamiento para Accenture ATC Monterrey.

Proyecto desarrollado para el curso **TC3005B – Planeación de Sistemas de Software** | Tecnológico de Monterrey, Campus Monterrey.

---

## Enlaces clave

| Recurso                      | URL                                                    |
| ---------------------------- | ------------------------------------------------------ |
| **Aplicación en producción** | https://work-hub-mty-3rtn-silk.vercel.app/             |
| **API en producción**        | https://workhub-mty-backend-production.up.railway.app/ |
| **Repositorio frontend**     | https://github.com/SimplicyTech/WorkHUB-MTY            |
| **Repositorio backend**      | https://github.com/SimplicyTech/WorkHUB-MTY-Backend    |
| **CI/CD de este repo**       | https://github.com/SimplicyTech/WorkHUB-MTY/actions    |

### Accesos de prueba

| Rol                 | Correo               | Contraseña |
| ------------------- | -------------------- | ---------- |
| Empleado            | luis@accenture.com   | user       |
| Administrador       | oliver@accenture.com | admin      |
| Guardia (lector QR) | alva@accenture.com   | guardia    |

> El sistema no tiene registro público: el alta de empleados la gestiona Accenture internamente.

---

## Arquitectura

El sistema sigue una **arquitectura de tres capas**; este repositorio es la capa de presentación (SPA):

```
┌─────────────────┐      HTTPS/JSON      ┌──────────────────────┐      SQL/SSL      ┌─────────────────┐
│   Frontend      │ ──────────────────▶  │       Backend        │ ───────────────▶  │  Base de Datos  │
│  (este repo)    │                      │  Node.js + Express   │                   │     MySQL       │
│ React + Vite    │ ◀──────────────────  │      (Railway)       │ ◀───────────────  │    (Railway)    │
│   (Vercel)      │                      └──────────────────────┘                   └─────────────────┘
└─────────────────┘                        integra Gemini (IA) y Brevo (correos)
```

### Stack tecnológico

| Tecnología                  | Propósito                                |
| --------------------------- | ---------------------------------------- |
| React 19 + Vite 8           | SPA con JavaScript (JSX)                 |
| Tailwind CSS v4             | Estilos (tema oscuro, paleta Accenture)  |
| React Router v7             | Navegación                               |
| Context API (AuthContext)   | Estado de sesión (JWT)                   |
| html5-qrcode / qrcode.react | Lectura y generación de códigos QR       |
| Google Gemini (vía backend) | Asistente de reservación por texto y voz |
| Vercel                      | Hosting y despliegue continuo            |

### Estructura del código

```
client/
├── src/
│   ├── pages/
│   │   ├── Landing/        → página de inicio
│   │   ├── Login/          → inicio de sesión
│   │   ├── Reserve/        → mapa, reservación, estacionamiento, mis reservas, puntos
│   │   ├── Admin/          → panel operativo (dashboard, reportes, espacios, bloqueos)
│   │   ├── ReadQR/         → lector QR (rol guardia)
│   │   └── Visita/         → confirmación de visitas (acceso por token, sin login)
│   ├── components/         → componentes reutilizables (mapas de piso, sidebar, asistente IA…)
│   ├── context/            → AuthContext, LecturaContext
│   ├── services/           → llamadas a la API (fetch con JWT)
│   ├── hooks/ y utils/     → lógica compartida (estatus de reservación, dashboard…)
│   └── data/               → datos de respaldo del mapa
└── public/
```

---

## Uso del sistema

1. **Iniciar sesión** con el correo corporativo (sin registro público).
2. **Reservar un escritorio**: elegir piso, fecha y horario; el mapa interactivo muestra cada espacio (disponible / ocupado / bloqueado); seleccionar y confirmar.
3. **Estacionamiento**: al confirmar el escritorio se puede agregar un cajón (asignación automática Est. 1 → 2 → 3).
4. **Reservar para un visitante**: el visitante recibe un correo con un link para confirmar, sin necesidad de cuenta.
5. **Check-in**: por botón en la reservación o mostrando el QR al guardia. Sin check-in en los primeros 15 minutos, la reserva se libera automáticamente (no-show, −25 puntos).
6. **Asistente de IA**: reservar por texto o voz en lenguaje natural ("resérvame un lugar mañana de 9 a 2").
7. **Puntos y rangos**: el buen uso (check-in/check-out) da puntos que amplían la ventana de anticipación para reservar.
8. **Panel de administración**: dashboard de ocupación en tiempo real, reportes, gestión de espacios, bloqueos y eventos.

---

## Desarrollo local

Por defecto el dev server corre en **HTTPS** (necesario para entrar desde el celular en la red local: el micrófono y el lector QR requieren contexto seguro).

```bash
# Backend
cd ../WorkHUB-MTY-Backend
npm run dev

# Frontend
cd WorkHUB-MTY/client
npm install
cp .env.example .env   # ajustar VITE_API_URL
npm run dev
```

URLs locales (desde la misma laptop):

- Frontend: `https://localhost:5173/login`
- Backend: `https://localhost:5500`
- `client/.env` debe usar `VITE_API_URL=https://localhost:5500/api/workhub`

Para probar desde celular en la misma red, usa la IP LAN de la laptop (sigue siendo HTTPS):

```bash
VITE_API_URL=https://<IP-LAN-de-tu-laptop>:5500/api/workhub
```

No uses `localhost` desde el celular; ahí `localhost` significa el propio celular, no la laptop.

Si prefieres trabajar en HTTP plano desde la laptop (sin avisos de certificado), apaga el HTTPS:

```bash
# Frontend (Windows)
set VITE_DEV_HTTPS=false&& npm run dev
```

### Scripts

| Script            | Comando        | Descripción                   |
| ----------------- | -------------- | ----------------------------- |
| `npm run dev`     | `vite`         | Servidor de desarrollo        |
| `npm run build`   | `vite build`   | Build de producción           |
| `npm run lint`    | `eslint .`     | Linter (mismo gate que el CI) |
| `npm test`        | `vitest run`   | Tests unitarios               |
| `npm run preview` | `vite preview` | Previsualizar el build        |

---

## CI/CD (GitHub Actions)

El workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) corre en cada push y pull request a `main`:

1. **Lint** — `eslint .` (reglas de React Hooks incluidas).
2. **Tests** — `vitest`: pruebas unitarias de la lógica de estatus de reservaciones (clasificación y estilos por estatus de la BD).
3. **Build** — `vite build` verifica que la app compila.
4. **Deploy** — solo en push a `main` y si los tres jobs anteriores pasan: despliega a producción en Vercel con la CLI.

### Secrets requeridos en GitHub

| Secret              | Uso                                                                  |
| ------------------- | -------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Token personal de Vercel                                             |
| `VERCEL_ORG_ID`     | ID de la organización (de `.vercel/project.json` tras `vercel link`) |
| `VERCEL_PROJECT_ID` | ID del proyecto (mismo archivo)                                      |

---

## Equipo

| Nombre                      | Matrícula |
| --------------------------- | --------- |
| Oliver Vázquez Lima         | A01738020 |
| Marco Antonio Ramos Jalife  | A00840530 |
| José Mauricio Valdez Galván | A00839011 |
| Alejandro Vásquez Ávila     | A00839091 |
| Luis Eduardo Cantu Leyva    | A00840016 |
| Emilio Barragán Godoy       | A01286583 |

## Licencia

Proyecto académico desarrollado para Tecnológico de Monterrey – TC3005B.
Cliente: Accenture ATC Monterrey.

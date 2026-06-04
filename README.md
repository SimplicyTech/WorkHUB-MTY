# React + Vite

## Desarrollo local

Para trabajar desde la misma laptop usa HTTP:

```bash
# Backend
cd ../WorkHUB-MTY-Backend
npm run dev

# Frontend
cd ../WorkHUB-MTY/client
npm run dev
```

URLs locales:

- Frontend: `http://localhost:5173/login`
- Backend: `http://localhost:5500`
- `client/.env` debe usar `VITE_API_URL=http://localhost:5500/api/workhub`

Para probar desde celular en la misma red usa HTTPS y la IP LAN de la laptop:

```bash
# Backend
set LOCAL_HTTPS=true&& npm run dev

# Frontend
set VITE_DEV_HTTPS=true&& npm run dev -- --host 0.0.0.0
```

En ese modo, `client/.env` debe apuntar a la IP LAN, por ejemplo:

```bash
VITE_API_URL=https://10.22.170.3:5500/api/workhub
```

No uses `localhost` desde el celular; en un celular `localhost` significa el propio celular, no la laptop.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

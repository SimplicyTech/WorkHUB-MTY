import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ command }) => {
  const useHttps = process.env.VITE_DEV_HTTPS === 'true'

  return {
    plugins: [
      react(),
      tailwindcss(),
      command === 'serve' && useHttps && basicSsl()
    ].filter(Boolean),

    server: {
      host: true,
      https: useHttps,
    }
  }
})

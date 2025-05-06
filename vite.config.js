import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [react()],
    server: {
      host: true,
      port: parseInt(env.VITE_PORT) || 5173,
    },
  }
})

/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    host: true, // Ecoute sur toutes les interfaces (0.0.0.0)
    port: 6284,
  }
})*/




import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Los cuatro microservicios del backend escuchan en puertos distintos.
// Para que el navegador solo necesite una URL base, el servidor de desarrollo de Vite
// actúa como proxy inverso: cada prefijo de ruta se reenvía a su servicio.
// Ver FR-FE-13 en documentation/Software-requeriments(SRS)/Frontend.md.
const backend = {
  identity: 'http://localhost:3001',
  store: 'http://localhost:3002',
  economy: 'http://localhost:3003',
  payments: 'http://localhost:3004',
} as const

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // identity-service
      '/api/v1/auth': backend.identity,
      '/api/v1/users': backend.identity,
      // store-service
      '/api/v1/carts': backend.store,
      '/api/v1/categories': backend.store,
      '/api/v1/discounts': backend.store,
      '/api/v1/inventory': backend.store,
      '/api/v1/orders': backend.store,
      '/api/v1/products': backend.store,
      // economy-service
      '/api/v1/gacha': backend.economy,
      '/api/v1/items': backend.economy,
      '/api/v1/rewards': backend.economy,
      '/api/v1/transactions': backend.economy,
      '/api/v1/wallet': backend.economy,
      // payments-service
      '/api/v1/packages': backend.payments,
      '/api/v1/payments': backend.payments,
      '/api/v1/recharges': backend.payments,
    },
  },
})

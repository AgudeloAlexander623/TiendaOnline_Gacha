import { Link } from 'react-router-dom'
import PageHeader from '../components/shared/PageHeader'

/**
 * Historial de pedidos del usuario.
 * Placeholder: se conectará al store-service cuando exista autenticación.
 */
function OrdersPage() {
  return (
    <div>
      <PageHeader title="Mis pedidos" description="Historial y estado de tus compras." />

      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-lg font-medium text-gray-700">Aún no tienes pedidos</p>
        <p className="mt-1 text-sm text-gray-500">
          Cuando realices tu primera compra, aparecerá aquí con su estado. Esta vista se conectará
          al backend en la fase de pedidos.
        </p>
        <Link
          to="/catalog"
          className="mt-4 inline-block rounded-lg bg-emerald-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600"
        >
          Explorar productos
        </Link>
      </div>
    </div>
  )
}

export default OrdersPage

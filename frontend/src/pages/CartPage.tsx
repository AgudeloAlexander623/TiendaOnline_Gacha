import { Link } from 'react-router-dom'
import PageHeader from '../components/shared/PageHeader'

/**
 * Carrito de compras.
 * Placeholder: la lógica de carrito (estado global) llega en una fase posterior.
 */
function CartPage() {
  return (
    <div>
      <PageHeader title="Carrito" description="Revisa los productos antes de generar tu pedido." />

      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-lg font-medium text-gray-700">Tu carrito está vacío</p>
        <p className="mt-1 text-sm text-gray-500">
          Agrega productos desde el catálogo para verlos aquí. Esta pantalla se conectará al
          carrito del backend en la fase de carrito y pedidos.
        </p>
        <Link
          to="/catalog"
          className="mt-4 inline-block rounded-lg bg-emerald-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600"
        >
          Ir al catálogo
        </Link>
      </div>
    </div>
  )
}

export default CartPage

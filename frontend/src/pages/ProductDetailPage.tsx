import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/shared/PageHeader'

/**
 * Detalle de producto.
 * Hoy muestra datos de ejemplo; consumirá el store-service por `productId`.
 */
function ProductDetailPage() {
  const { productId } = useParams()

  return (
    <div>
      <Link to="/catalog" className="text-sm font-medium text-emerald-600 hover:underline">
        ← Volver al catálogo
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Imagen */}
        <div className="flex h-72 items-center justify-center rounded-xl bg-gray-100 text-gray-400 lg:h-96">
          Imagen del producto
        </div>

        {/* Información */}
        <div>
          <PageHeader
            title="Producto (demo)"
            description={`Identificador de la ruta: ${productId ?? 'sin id'}`}
          />

          <p className="text-3xl font-bold text-gray-900">$189.900</p>
          <p className="mt-4 text-gray-600">
            Esta es la vista de detalle de producto. Aquí se mostrarán la descripción,
            imágenes, disponibilidad y opciones de descuento cuando el catálogo esté
            conectado al backend.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-lg bg-gray-300 px-5 py-2.5 font-medium text-gray-500"
              title="Disponible cuando el carrito esté implementado"
            >
              Agregar al carrito
            </button>
            <Link
              to="/catalog"
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Seguir explorando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage

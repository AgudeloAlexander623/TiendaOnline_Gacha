import { Link } from 'react-router-dom'
import PageHeader from '../components/shared/PageHeader'

// Datos de ejemplo (mock) hasta conectar con el store-service.
const mockProducts = [
  { id: 'demo-1', name: 'Teclado mecánico GQ Pro', price: '$189.900', stock: 'Disponible' },
  { id: 'demo-2', name: 'Mouse inalámbrico GQ Air', price: '$99.900', stock: 'Disponible' },
  { id: 'demo-3', name: 'Audífonos GQ Stereo', price: '$149.900', stock: 'Últimas unidades' },
  { id: 'demo-4', name: 'Mousepad XL GQ Surface', price: '$59.900', stock: 'Disponible' },
  { id: 'demo-5', name: 'Webcam GQ Vision 1080p', price: '$129.900', stock: 'Agotado' },
  { id: 'demo-6', name: 'Soporte de monitor GQ Arm', price: '$109.900', stock: 'Disponible' },
]

function CatalogPage() {
  return (
    <div>
      <PageHeader
        title="Catálogo"
        description="Explora todos los periféricos disponibles en GearQuest."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockProducts.map((product) => (
          <article
            key={product.id}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow"
          >
            <div className="mb-3 flex h-36 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              Imagen
            </div>
            <h2 className="font-medium text-gray-900">{product.name}</h2>
            <p className="mt-1 text-lg font-bold text-gray-900">{product.price}</p>
            <p
              className={`mt-1 text-sm ${
                product.stock === 'Agotado' ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              {product.stock}
            </p>
            <Link
              to={`/catalog/${product.id}`}
              className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline"
            >
              Ver detalle →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

export default CatalogPage

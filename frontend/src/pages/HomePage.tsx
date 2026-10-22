import { Link } from 'react-router-dom'

// Productos de ejemplo para que la home no esté vacía.
// Reemplazados cuando el catálogo consuma la API (store-service).
const highlights = [
  { id: 'demo-1', name: 'Teclado mecánico GQ Pro', price: '$189.900' },
  { id: 'demo-2', name: 'Mouse inalámbrico GQ Air', price: '$99.900' },
  { id: 'demo-3', name: 'Audífonos GQ Stereo', price: '$149.900' },
]

function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="rounded-2xl bg-gray-900 px-6 py-12 text-center text-white sm:px-12">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Gear<span className="text-emerald-400">Quest</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-300">
          Periféricos para tu equipo, con un toque de juego: gana monedas jugando, cámbialas por
          descuentos y equipa tu setup.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/catalog"
            className="rounded-lg bg-emerald-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Ver catálogo
          </Link>
          <Link
            to="/register"
            className="rounded-lg border border-gray-600 px-5 py-2.5 font-medium text-gray-200 transition-colors hover:bg-gray-800"
          >
            Crear cuenta
          </Link>
        </div>
      </section>

      {/* Destacados */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Destacados</h2>
          <Link to="/catalog" className="text-sm font-medium text-emerald-600 hover:underline">
            Ver todo →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((product) => (
            <article
              key={product.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow"
            >
              <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                Imagen
              </div>
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="mt-1 text-lg font-bold text-gray-900">{product.price}</p>
              <Link
                to={`/catalog/${product.id}`}
                className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline"
              >
                Ver detalle →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-900">1. Juega y gana</h3>
          <p className="mt-1 text-sm text-gray-600">
            Completa el minijuego y recibe monedas. Las monedas ganadas vencen a los 30 días.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-900">2. Recarga (simulada)</h3>
          <p className="mt-1 text-sm text-gray-600">
            También puedes obtener monedas con recargas simuladas: esas no vencen nunca.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-900">3. Obtén descuentos</h3>
          <p className="mt-1 text-sm text-gray-600">
            Canjea monedas por descuentos del 10 % al 90 % en tus compras.
          </p>
        </div>
      </section>
    </div>
  )
}

export default HomePage

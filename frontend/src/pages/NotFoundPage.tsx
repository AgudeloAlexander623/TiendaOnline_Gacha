import { Link } from 'react-router-dom'

/**
 * Página 404: ruta no encontrada.
 */
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-6xl font-bold text-gray-300">404</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Página no encontrada</h1>
      <p className="mt-1 text-gray-600">La ruta que buscas no existe o fue movida.</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-emerald-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600"
      >
        Volver al inicio
      </Link>
    </div>
  )
}

export default NotFoundPage

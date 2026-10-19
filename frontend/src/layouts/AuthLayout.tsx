import { Link, Outlet } from 'react-router-dom'

/**
 * Layout para las páginas de autenticación (login y registro).
 * Muestra la marca, un contenido centrado y sin la navegación principal.
 */
function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-900">
      <header className="bg-gray-900 text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Gear<span className="text-emerald-400">Quest</span>
          </Link>
          <Link to="/catalog" className="text-sm text-gray-300 hover:text-white">
            Volver a la tienda
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full flex-1 max-w-md flex-col justify-center px-4 py-12">
        <Outlet />
      </main>

      <footer className="bg-gray-900 py-4 text-center text-xs text-gray-400">
        © 2026 GearQuest — Proyecto académico
      </footer>
    </div>
  )
}

export default AuthLayout

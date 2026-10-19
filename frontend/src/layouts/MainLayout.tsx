import { Link, NavLink, Outlet } from 'react-router-dom'

// Enlaces de navegación principales de la tienda.
// /orders y /profile se protegerán cuando exista autenticación (Fase auth).
const navLinks = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalog', label: 'Catálogo' },
  { to: '/cart', label: 'Carrito' },
  { to: '/orders', label: 'Pedidos' },
  { to: '/profile', label: 'Perfil' },
]

function navLinkClasses(isActive: boolean) {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white',
  ].join(' ')
}

/**
 * Layout principal de la tienda: header con navegación, contenido (Outlet) y footer.
 * Envuelve las páginas públicas y, en el futuro, las protegidas.
 */
function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 bg-gray-900 text-white shadow">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Gear<span className="text-emerald-400">Quest</span>
          </Link>

          <nav aria-label="Navegación principal" className="flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => navLinkClasses(isActive)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-sm text-gray-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 GearQuest — Proyecto académico</p>
          <p>Compras y recargas simuladas. No se procesa dinero real.</p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout

import { Link } from 'react-router-dom'

/**
 * Inicio de sesión.
 * Placeholder visual: la validación y el envío al identity-service llegan en la fase de auth.
 */
function LoginPage() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow">
      <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-gray-500">
        Accede a tu cuenta para comprar y usar tus monedas.
      </p>

      <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            disabled
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 disabled:cursor-not-allowed"
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled
            className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled
          className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2.5 font-medium text-gray-500"
          title="Se habilita cuando exista autenticación"
        >
          Entrar (próximamente)
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-medium text-emerald-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}

export default LoginPage

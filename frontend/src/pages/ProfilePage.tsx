import { Link } from 'react-router-dom'
import PageHeader from '../components/shared/PageHeader'

/**
 * Perfil del usuario (datos, monedero y niveles de descuento).
 * Placeholder: se poblará cuando exista autenticación y el economy-service.
 */
function ProfilePage() {
  return (
    <div>
      <PageHeader title="Mi perfil" description="Tu cuenta, monedas y descuentos." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Cuenta</h2>
          <p className="mt-1 text-sm text-gray-500">
            Datos personales, correo y contraseña. Se habilita con el inicio de sesión.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Monedero</h2>
          <p className="mt-1 text-sm text-gray-500">
            Monedas ganadas (vencen a 30 días) y compradas (sin vencimiento), con su
            historial de movimientos.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:col-span-2">
          <h2 className="font-semibold text-gray-900">Nivel de descuento</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tus niveles de descuento activos (10 %, 30 %, 50 %, 70 %, 90 %) y su elegibilidad.
          </p>
        </section>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        Esta es una vista previa.{' '}
        <Link to="/login" className="font-medium text-emerald-600 hover:underline">
          Inicia sesión
        </Link>{' '}
        cuando la autenticación esté lista.
      </div>
    </div>
  )
}

export default ProfilePage

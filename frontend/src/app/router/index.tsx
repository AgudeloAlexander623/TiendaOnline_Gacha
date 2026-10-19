import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import AuthLayout from '../../layouts/AuthLayout'
import HomePage from '../../pages/HomePage'
import CatalogPage from '../../pages/CatalogPage'
import ProductDetailPage from '../../pages/ProductDetailPage'
import CartPage from '../../pages/CartPage'
import OrdersPage from '../../pages/OrdersPage'
import ProfilePage from '../../pages/ProfilePage'
import LoginPage from '../../pages/LoginPage'
import RegisterPage from '../../pages/RegisterPage'
import NotFoundPage from '../../pages/NotFoundPage'

/**
 * Rutas de la aplicación.
 *
 * - Layout principal (header + footer): tienda y áreas del usuario.
 * - Layout de auth: login y registro.
 * - Pendiente (fase auth): proteger /orders y /profile, y redirigir
 *   a /login cuando no haya sesión.
 */
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/catalog/:productId', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/orders', element: <OrdersPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
])

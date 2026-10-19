interface PageHeaderProps {
  title: string
  description?: string
}

/**
 * Encabezado estándar de las páginas de la aplicación: título y descripción opcional.
 */
function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6 border-b border-gray-200 pb-4">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {description ? <p className="mt-1 text-gray-600">{description}</p> : null}
    </header>
  )
}

export default PageHeader

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  count?: number
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1
          className="font-bold tracking-tight"
          style={{ fontSize: '22px', color: '#0F172A', lineHeight: 1.2 }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-shrink-0">{actions}</div>
      )}
    </div>
  )
}

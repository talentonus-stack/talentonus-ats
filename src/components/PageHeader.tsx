import { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
}

export default function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="sm:flex sm:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-light flex items-center gap-3">
          {Icon && <Icon className="w-8 h-8 text-accent" />}
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-muted">{description}</p>
        )}
      </div>
      {action && (
        <div className="mt-4 sm:mt-0 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

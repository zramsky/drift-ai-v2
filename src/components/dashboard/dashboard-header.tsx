interface DashboardHeaderProps {
  title: string
  description: string
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            {title}
          </h1>
          <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
import * as React from "react"

interface ProjectPageShellProps {
  title: string
  description?: React.ReactNode
  headerAction?: React.ReactNode
  children: React.ReactNode
}

export function ProjectPageShell({
  title,
  description,
  headerAction,
  children,
}: ProjectPageShellProps) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 pt-7 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
      </header>
      <div className="flex-1 px-6 py-8">{children}</div>
    </div>
  )
}
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="mb-4 flex items-start justify-between gap-4 border-b border-border pb-3">
      <div>
        <h1 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-primary-text">
          {title}
        </h1>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-secondary-text">
          {subtitle}
        </p>
      </div>
      {actions ? <div className="shrink-0 pt-0.5">{actions}</div> : null}
    </header>
  );
}

interface EmptyModuleStateProps {
  moduleName: string;
}

export function EmptyModuleState({ moduleName }: EmptyModuleStateProps) {
  return (
    <section className="max-w-xl rounded-panel border border-border bg-panel p-4 shadow-panel">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-planning-blue">
        Module foundation ready
      </p>
      <p className="mt-2 text-[13px] leading-5 text-primary-text">
        {moduleName} is wired into the application shell. Screen content will be
        added in a later iteration.
      </p>
      <p className="mt-2 text-[12px] leading-5 text-secondary-text">
        Data source: local mock corridor UDR–MVJ. No backend connected.
      </p>
    </section>
  );
}

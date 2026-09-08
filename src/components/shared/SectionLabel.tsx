interface SectionLabelProps {
  children: string;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary-text">
      {children}
    </p>
  );
}

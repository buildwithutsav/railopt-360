interface RailCodeProps {
  value: string;
}

export function RailCode({ value }: RailCodeProps) {
  return (
    <span className="font-mono text-[12px] tracking-wide text-primary-text">
      {value}
    </span>
  );
}

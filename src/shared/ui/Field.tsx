import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode };

export function Field({ label, hint, id, className = '', ...rest }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={id}>
      <span className="font-bold">{label}</span>
      <input id={id} className={`min-h-11 w-full rounded-lg border border-[#CFC8B9] bg-[#FDFCF8] px-4 ${className}`} {...rest} />
      {hint && <span className="text-ink/70">{hint}</span>}
    </label>
  );
}

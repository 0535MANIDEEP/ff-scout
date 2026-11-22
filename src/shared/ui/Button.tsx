import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  const base = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-6 text-center text-sm font-bold leading-[1.2] no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion';
  const tone = variant === 'primary'
    ? 'border-vermilion bg-vermilion text-panel hover:border-danger hover:bg-danger active:translate-y-px'
    : 'border border-line bg-transparent text-ink hover:bg-black/5';
  return <button className={`${base} ${tone} ${className}`} {...rest} />;
}

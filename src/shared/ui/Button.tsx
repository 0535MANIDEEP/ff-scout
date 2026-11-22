import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  const base = 'min-h-11 rounded-lg px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion';
  const tone = variant === 'primary'
    ? 'bg-vermilion text-white hover:brightness-95'
    : 'border border-line bg-transparent text-ink hover:bg-black/5';
  return <button className={`${base} ${tone} ${className}`} {...rest} />;
}

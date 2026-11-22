import { BRAND } from '@/shared/config/brand';

type Variant = 'text' | 'button' | 'footer';

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermilion';
const STYLES: Record<Variant, string> = {
  text: `text-vermilion underline underline-offset-2 ${FOCUS}`,
  button: `inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-6 text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px ${FOCUS}`,
  footer: `inline-flex min-h-11 items-center text-danger no-underline hover:text-vermilion ${FOCUS}`,
};

// The address stays in the mailto target, never in rendered text.
export function ContactNow({ variant = 'text', subject }: { variant?: Variant; subject?: string }) {
  const href = subject
    ? `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${BRAND.email}`;
  return <a href={href} className={STYLES[variant]}>Contact now</a>;
}

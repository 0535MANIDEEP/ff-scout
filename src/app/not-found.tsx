const NARROW = 'mx-auto max-w-[760px] px-6 py-16 max-[860px]:py-12';
const H1 = 'font-bold leading-[1.2] tracking-[-0.03em] text-ink';
const SUBTEXT = 'text-lg leading-[1.55] text-muted';
const BTN = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-vermilion bg-vermilion px-[22px] py-3 text-center text-sm font-bold leading-[1.2] text-panel no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-danger hover:bg-danger active:translate-y-px';

export default function NotFound() {
  return (
    <div className={NARROW}>
      <h1 className={`mb-2 text-[64px] ${H1}`}>404</h1>
      <p className={SUBTEXT}>That page isn't on the board.</p>
      <a className={`mt-[18px] ${BTN}`} href="/">Back to home</a>
    </div>
  );
}

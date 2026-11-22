// Sign-out is a POST so a stray GET (bot, prefetch) can never log a user out.
export default function SignOut({ className = 'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#CFC8B9] bg-panel px-6 text-center text-sm font-bold leading-[1.2] text-ink no-underline transition-[background-color,border-color,color,transform] duration-[120ms] ease-[ease] hover:border-line hover:bg-[#E4DFD1] active:translate-y-px' }: { className?: string }) {
  return (
    <form action="/sign-out" method="post">
      <button className={className} type="submit">Sign out</button>
    </form>
  );
}

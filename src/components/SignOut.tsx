// Sign-out is a POST so a stray GET (bot, prefetch) can never log a user out.
export default function SignOut({ className = 'btn-ghost' }: { className?: string }) {
  return (
    <form action="/sign-out" method="post">
      <button className={className} type="submit">Sign out</button>
    </form>
  );
}

// Affiliate links, always disclosed, env-gated.
// NEXT_PUBLIC_AMAZON_TAG and NEXT_PUBLIC_FLIPKART_TAG set at build/runtime.
// No tag → plain search links, no commission. Never a fake URL, never a fake tag.
export function amazon(q: string): string {
  const tag = process.env.NEXT_PUBLIC_AMAZON_TAG;
  const base = `https://www.amazon.in/s?k=${encodeURIComponent(q)}`;
  return tag ? `${base}&tag=${encodeURIComponent(tag)}` : base;
}

export function flipkart(q: string): string {
  const tag = process.env.NEXT_PUBLIC_FLIPKART_TAG;
  const base = `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`;
  return tag ? `${base}&affid=${encodeURIComponent(tag)}` : base;
}

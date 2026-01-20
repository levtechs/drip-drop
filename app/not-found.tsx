import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="space-y-6">
        <div className="relative mx-auto h-24 w-24 sm:h-32 sm:w-32">
          <span className="text-8xl sm:text-9xl">💧</span>
          <div className="absolute -bottom-2 -right-2 text-4xl sm:text-5xl">❓</div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            404
          </h1>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Page Not Found
          </h2>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Oops! It looks like this page has evaporated. Let's get you back to the flow.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/listings"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Browse Listings
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-8 text-base font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

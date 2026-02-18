import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-teal rounded-xl flex items-center justify-center mx-auto mb-6">
          <span className="text-greenery text-2xl font-bold">404</span>
        </div>
        <h1 className="text-2xl font-bold text-teal mb-2">Page not found</h1>
        <p className="text-teal/60 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="bg-teal text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-light transition-colors inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

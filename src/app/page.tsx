import Link from "next/link";
import AmpBoltIcon from "@/components/AmpBoltIcon";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-teal mb-4">
          <span className="text-teal">Propwell</span> <span className="bg-teal text-greenery px-3 py-1 rounded-lg">AMP</span>
        </h1>
        <p className="text-xl text-teal/80 mb-8">
          Asset management tools for single-family rental portfolios.
          Comp analysis, portfolio insights, and underwriting — all in one platform.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signin"
            className="bg-teal text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-light transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-greenery text-teal px-6 py-3 rounded-lg font-medium hover:bg-greenery-dark transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-secondary-950">404</h1>
      <h2 className="text-xl font-bold text-secondary-800 mt-2">Page Not Found</h2>
      <p className="text-sm text-secondary-600 mt-1 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold text-sm transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
}

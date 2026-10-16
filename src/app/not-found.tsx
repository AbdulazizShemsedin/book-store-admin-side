import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">404</h1>
      <p className="mt-2 text-base text-slate-600 font-medium">Page Not Found</p>
      <p className="mt-1 text-xs text-slate-400 max-w-sm">
        The requested admin resource or page could not be located.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-[#1e4634] text-white hover:bg-[#153426] transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

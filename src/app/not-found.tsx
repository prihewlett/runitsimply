import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFBFD] px-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-lg font-extrabold text-white">
          R
        </div>
        <div className="text-xl font-extrabold tracking-tight">RunItSimply</div>
      </div>

      <div className="text-center">
        <p className="text-6xl font-extrabold text-blue-600">404</p>
        <h1 className="mt-4 text-xl font-bold text-[#1A1D26]">Page not found</h1>
        <p className="mt-2 font-body text-sm text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-[10px] bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}

'use client';
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold text-[#252722]">Something went wrong</h2>
      <button onClick={() => reset()} className="mt-4 px-4 py-2 bg-[#252722] text-[#F8F6F1] rounded">
        Try Again
      </button>
    </div>
  );
}

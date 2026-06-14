/**
 * LoadingSpinner — Full-page loading indicator
 * Shown during auth state resolution and data fetching.
 */
export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#0f0f23] flex flex-col items-center justify-center">
      {/* Animated spinning ring */}
      <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin" />
      <p className="mt-4 text-gray-400 text-sm tracking-wide">Loading...</p>
    </div>
  );
}

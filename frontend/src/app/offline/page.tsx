'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 mb-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-500"
        >
          <path d="M10.61 4.39a10 10 0 0 1 12.06 6.3M2.75 8a10 10 0 0 1 2.37-2.32M1.2 5l21.6 21.6" />
          <path d="M1 18h2M21 18h2M5 22h14" />
        </svg>
      </div>
      <h1 className="text-3xl font-playfair font-semibold text-white mb-4">
        You're Offline
      </h1>
      <p className="text-neutral-400 max-w-md mx-auto mb-8 text-lg">
        It looks like you've lost your internet connection. Some parts of ComraidShops might be unavailable until you reconnect.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

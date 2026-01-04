/**
 * ErrorMessage Component
 * Displays error messages with retry option
 */

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="my-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
      <div className="flex items-start gap-3">
        <svg
          viewBox="0 0 24 24"
          className="mt-0.5 h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="flex-1">
          <div className="text-sm font-semibold">Error</div>
          <div className="text-sm">{message}</div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-md px-2 py-1 text-sm text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        )}
      </div>

      {message.includes("credentials") && (
        <p className="mt-3 text-xs text-red-700">
          Tip: Set up your Reddit API credentials in{" "}
          <code className="rounded bg-red-100 px-1">.env.local</code>. See{" "}
          <code className="rounded bg-red-100 px-1">.env.example</code> for instructions.
        </p>
      )}

      {message.includes("Rate limit") && (
        <p className="mt-3 text-xs text-red-700">
          Reddit API rate limit exceeded. Please wait a moment and try again.
        </p>
      )}
    </div>
  );
}

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
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
      <div className="flex items-start">
        {/* Error icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Error message */}
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Error
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {message}
          </p>
        </div>

        {/* Retry button */}
        {onRetry && (
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={onRetry}
              className="text-sm font-medium text-red-600 dark:text-red-400 
                         hover:text-red-500 dark:hover:text-red-300
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Additional help for common errors */}
      {message.includes("credentials") && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">
          💡 Make sure you&apos;ve set up your Reddit API credentials in the{" "}
          <code className="bg-red-100 dark:bg-red-900 px-1 rounded">
            .env.local
          </code>{" "}
          file. See{" "}
          <code className="bg-red-100 dark:bg-red-900 px-1 rounded">
            .env.example
          </code>{" "}
          for instructions.
        </p>
      )}

      {message.includes("Rate limit") && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">
          ⏱️ Reddit API rate limit exceeded. Please wait a moment and try again.
        </p>
      )}
    </div>
  );
}


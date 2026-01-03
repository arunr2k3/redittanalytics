/**
 * LoadingSpinner Component
 * Displays a spinning loader with optional message
 */

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({
  message = "Loading...",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Spinner */}
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-gray-300 border-t-reddit-orange`}
        role="status"
        aria-label="Loading"
      />
      {/* Message */}
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}


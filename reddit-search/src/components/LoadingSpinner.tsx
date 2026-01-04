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
  const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-4",
  } as const;

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div
        className={`animate-spin rounded-full border-gray-200 border-t-reddit-orange ${sizeMap[size]}`}
        aria-label="Loading"
      />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}

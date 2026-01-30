'use client';

type LoadingSpinnerProps = {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function LoadingSpinner({ text = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: { spinner: 'w-8 h-8 border-2', text: 'text-sm', dots: 'w-1.5 h-1.5' },
    md: { spinner: 'w-12 h-12 border-3', text: 'text-base', dots: 'w-2 h-2' },
    lg: { spinner: 'w-16 h-16 border-4', text: 'text-xl', dots: 'w-2.5 h-2.5' },
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      {/* Spinner */}
      <div className="relative">
        <div className={`${classes.spinner} border-green-400/30 rounded-full`} />
        <div className={`absolute top-0 left-0 ${classes.spinner} border-green-400 rounded-full border-t-transparent animate-spin`} />
      </div>

      {/* Loading text */}
      <div className={`${classes.text} font-medium text-gray-400`}>{text}</div>

      {/* Pulsing dots */}
      <div className="flex gap-1">
        <div className={`${classes.dots} bg-green-400 rounded-full animate-pulse`} style={{ animationDelay: '0ms' }} />
        <div className={`${classes.dots} bg-green-400 rounded-full animate-pulse`} style={{ animationDelay: '150ms' }} />
        <div className={`${classes.dots} bg-green-400 rounded-full animate-pulse`} style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

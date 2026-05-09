"use client";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Bir hata oluştu",
  message = "Veriler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-on-error-container">
          error
        </span>
      </div>
      <div className="text-center max-w-sm">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-1">
          {title}
        </h3>
        <p className="text-sm text-on-surface-variant">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Tekrar Dene
        </button>
      )}
    </div>
  );
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-error-container/30 border border-error/20 rounded-lg animate-fade-in">
      <span className="material-symbols-outlined text-error text-lg shrink-0">warning</span>
      <p className="text-sm text-on-surface-variant flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold text-secondary hover:underline shrink-0"
        >
          Tekrar Dene
        </button>
      )}
    </div>
  );
}

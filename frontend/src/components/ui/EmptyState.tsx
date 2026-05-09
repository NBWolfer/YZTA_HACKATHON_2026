"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = "inbox", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
      <span className="material-symbols-outlined text-5xl text-surface-container-highest">
        {icon}
      </span>
      <div className="text-center max-w-sm">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-on-surface-variant">{description}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

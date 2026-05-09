"use client";

interface TopNavProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function TopNav({ title = "SME AI Command", onMenuClick }: TopNavProps) {
  return (
    <header className="flex justify-between items-center px-4 md:px-6 py-2 w-full z-40 bg-surface-bright border-b border-outline-variant shrink-0">
      {/* Mobile menu + title */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onMenuClick}
          className="p-1.5 -ml-1 hover:bg-surface-container-high rounded-full transition-colors"
          aria-label="Menüyü aç"
        >
          <span className="material-symbols-outlined text-on-surface">menu</span>
        </button>
        <span className="font-headline text-lg font-bold text-primary">{title}</span>
      </div>
      <div className="hidden md:block">
        <h2 className="font-headline text-xl font-semibold text-primary">{title}</h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Search */}
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Arama yap..."
            className="pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none w-48 lg:w-64 transition-all"
          />
        </div>

        {/* Mobile search button */}
        <button className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors sm:hidden">
          <span className="material-symbols-outlined text-primary">search</span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-0.5 md:gap-1 text-primary">
          <button className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors hidden sm:block">
            <span className="material-symbols-outlined">monitor_heart</span>
          </button>
          <button className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </button>
          <button className="p-1.5 hover:bg-surface-container-high rounded-full transition-colors hidden sm:block">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-xs font-semibold border border-outline-variant">
          AB
        </div>
      </div>
    </header>
  );
}

import { useId, useState, useSyncExternalStore, type ReactNode } from "react";

const query = "(max-width: 719px)";
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

export function SheetCard({
  title,
  children,
  actions,
  className = "",
  group,
  count,
  mobileOpen = false,
  level = 2,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  group?: string;
  count?: number;
  mobileOpen?: boolean;
  level?: 2 | 3;
}) {
  const mobile = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
  const [choice, setChoice] = useState<boolean>();
  const expanded = choice ?? (!mobile || mobileOpen);
  const id = useId();
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <section
      className={`manager-card ${className}`}
      data-group={group}
      aria-label={title}
    >
      <div className="manager-card-heading">
        <Heading>
          <button
            type="button"
            className="manager-card-toggle"
            aria-label={title}
            aria-expanded={expanded}
            aria-controls={id}
            onClick={() => setChoice(!expanded)}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
              <path d="m4 6 4 4 4-4" />
            </svg>
            <span>{title}</span>
            {count !== undefined && <small>{count}</small>}
          </button>
        </Heading>
        {actions && <div className="manager-card-actions">{actions}</div>}
      </div>
      <div id={id} className="manager-card-body" hidden={!expanded}>
        {children}
      </div>
    </section>
  );
}

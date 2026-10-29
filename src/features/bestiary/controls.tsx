"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type InputHTMLAttributes,
  type ButtonHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import { requestReference } from "../../services/content";
import { sourceLabel } from "../../engine/sources.mjs";
import {
  abilityName,
  descriptionKey,
  showsDescription,
} from "../../engine/gm/ability-presentation.mjs";

export const BestiaryContext = createContext<any>(null);
export const useBestiary = () => useContext(BestiaryContext);
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const context = useBestiary();
  const issues =
    context?.result?.issues?.filter(
      (issue: any) => props.id && issue.control?.target === `#${props.id}`,
    ) ?? [];
  const issueId = issues.length ? `${props.id}-issue` : undefined;
  const neutralRequired =
    props.id === "gm-profile-search" && !context?.ui?.profileValidation;
  return (
    <>
      <input
        {...props}
        name={props.name ?? props.id ?? "choice"}
        autoComplete={props.autoComplete ?? "off"}
        inputMode={
          props.inputMode ?? (props.type === "number" ? "decimal" : undefined)
        }
        aria-invalid={
          issues.length && !neutralRequired ? true : props["aria-invalid"]
        }
        aria-describedby={
          [props["aria-describedby"], issueId].filter(Boolean).join(" ") ||
          undefined
        }
      />
      {issueId && (
        <p
          id={issueId}
          className={neutralRequired ? "ui-field-hint" : "ui-field-issue"}
        >
          {issues.map((issue: any) => issue.message).join(" ")}
        </p>
      )}
    </>
  );
}
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type={props.type || "button"}
      className={props.className ?? "quiet"}
    />
  );
}
export function DiceIcon() {
  return (
    <svg className="ui-dice-icon" aria-hidden="true" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1" />
      <circle cx="16" cy="8" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="8" cy="16" r="1" />
      <circle cx="16" cy="16" r="1" />
    </svg>
  );
}
export const numberValue = (value: string) =>
  value === "" ? null : Number(value);
export function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  id: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Input
        {...props}
        id={id}
        type={type}
        value={value ?? ""}
        inputMode={type === "number" ? "decimal" : props.inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
export function Select({
  label,
  id,
  options,
  value,
  onChange,
  disabled = false,
  ...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> & {
  label: string;
  id: string;
  options: any[];
  value: any;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        {...props}
        id={id}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {options.map((item) => {
          const [key, name] = Array.isArray(item) ? item : [item, item];
          return (
            <option key={String(key)} value={key}>
              {name}
            </option>
          );
        })}
      </select>
    </div>
  );
}
export function Check({
  children,
  checked,
  onChange,
  disabled,
  id,
  ...props
}: {
  children: ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  id?: string;
  value?: string;
  "data-lore"?: string;
  "data-training"?: string;
  "data-profile-lore"?: string;
  "data-sacred-mark"?: string;
}) {
  return (
    <label className="gm-check">
      <input
        {...props}
        id={id}
        type="checkbox"
        checked={!!checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {children}
    </label>
  );
}
export function DescriptionToggle({
  kind,
  entry,
}: {
  kind: "trait" | "talent";
  entry: any;
}) {
  const { draft, edit } = useBestiary();
  return (
    <label className="gm-description-toggle">
      <input
        type="checkbox"
        role="switch"
        aria-label={`${abilityName(kind, entry)} description`}
        checked={showsDescription(kind, entry, draft)}
        onChange={(event) => {
          const enabled = event.target.checked;
          edit((next: any) => {
            const key = descriptionKey(kind, entry, next);
            const hidden = next.hiddenDescriptions || [];
            next.hiddenDescriptions = enabled
              ? hidden.filter((id: string) => id !== key)
              : [...new Set([...hidden, key])];
          });
        }}
      />
      <span>Description</span>
    </label>
  );
}
export function Details({
  id,
  title,
  children,
  initial = false,
  className = "",
}: {
  id: string;
  title: ReactNode;
  children: ReactNode;
  initial?: boolean;
  className?: string;
}) {
  const context = useBestiary();
  const key = id.startsWith("gm:") ? id : `gm:${id}`;
  const [open, setOpen] = useState(
    () => context?.disclosures?.get(key) ?? initial,
  );
  return (
    <details
      className={`ui-disclosure gm-detail ${className}`}
      data-detail-key={key}
      open={open}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        setOpen(next);
        context?.disclosures?.set(key, next);
      }}
    >
      <summary>{title}</summary>
      <div className="gm-detail-body">{children}</div>
    </details>
  );
}
export function Modal({
  title,
  children,
  close,
  className = "",
  trapFocus = false,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  className?: string;
  trapFocus?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
    };
  }, []);
  useEffect(() => {
    ref.current
      ?.querySelector<HTMLElement>("[autofocus],input,select,button")
      ?.focus();
  }, [title]);
  return (
    <dialog
      ref={ref}
      className={`creator-dialog ${className}`}
      aria-labelledby="gm-dialog-title"
      onCancel={close}
      onKeyDown={(event) => {
        if (!trapFocus || event.key !== "Tab" || event.defaultPrevented) return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            "button, input, select, textarea, summary, a[href], [tabindex]",
          ),
        ].filter(
          (node) =>
            node.tabIndex >= 0 &&
            !node.matches(":disabled") &&
            node.getClientRects().length,
        );
        const first = controls[0],
          last = controls.at(-1);
        if (!event.shiftKey && document.activeElement === last && first) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first && last) {
          event.preventDefault();
          last.focus();
        }
      }}
    >
      <div className="gm-dialog-heading">
        <h2 id="gm-dialog-title">{title}</h2>
        <Button
          type="button"
          onClick={close}
          aria-label={
            className.includes("mobile-creator-menu")
              ? "Close creator menu"
              : "Close"
          }
        >
          Close
        </Button>
      </div>
      {children}
    </dialog>
  );
}
export function Metadata({ entry }: { entry: any }) {
  const context = useBestiary();
  return (
    <>
      <small className="gm-small">
        {entry.custom
          ? `Custom · Based on ${entry.baseName} · ${sourceLabel(context?.rules || { books: [] }, { source: entry.baseSource })}`
          : sourceLabel(context?.rules || { books: [] }, entry)}
      </small>
      <Legacy entry={entry} />
    </>
  );
}
export function Legacy({ entry }: { entry: any }) {
  const context = useBestiary();
  return entry?.adaptation ? (
    <Button
      className="legacy-tag"
      aria-label={`Read ${entry.name} adaptation`}
      onClick={() =>
        context?.setModal({
          kind: "message",
          title: `${entry.name} · Legacy`,
          message: `${entry.adaptation} (${sourceLabel(context.rules, { ...entry, source: entry.adaptationSource || entry.source })})`,
        })
      }
    >
      Legacy
    </Button>
  ) : null;
}
export function Rule({ entry, kind }: { entry: any; kind?: string }) {
  return (
    <>
      <p>
        {entry?.summary ||
          entry?.description ||
          entry?.text ||
          "See the cited source."}
      </p>
      <Metadata entry={entry} />
      {kind && (
        <Button
          type="button"
          aria-label={`Read ${entry.name}`}
          onClick={() =>
            requestReference({
              kind,
              name: entry.name,
              book: entry.source?.book,
              id: entry.contentId,
            })
          }
        >
          ?
        </Button>
      )}
    </>
  );
}
export function Remove({ entryKey }: { entryKey: string }) {
  const { remove } = useBestiary();
  return (
    <Button
      type="button"
      className="gm-remove quiet"
      onClick={() => remove(entryKey)}
      aria-label="Remove this entry"
      title="Remove entry"
    >
      ×
    </Button>
  );
}
export function SectionHeading({
  children,
  action,
  label,
}: {
  children: ReactNode;
  action?: () => void;
  label?: string;
}) {
  return (
    <div className="gm-section-heading">
      <h2>{children}</h2>
      {action && (
        <Button type="button" className="primary" onClick={action}>
          {label}
        </Button>
      )}
    </div>
  );
}

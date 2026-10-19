"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type FieldProps = {
  id: string;
  label: string;
  value: any;
  onValue: (value: any) => void;
  numeric?: boolean;
  nullable?: boolean;
  readOnly?: boolean;
  area?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  attributes?: Record<string, string>;
  onBlur?: () => void;
  bare?: boolean;
  hideLabel?: boolean;
};

// A text buffer preserves a temporarily empty numeric field until blur. Values
// sent to the domain stay numbers/null; display formatting never enters inputs.
export function Field({
  id,
  label,
  value,
  onValue,
  numeric,
  nullable,
  readOnly,
  area,
  ariaLabel,
  placeholder,
  attributes,
  onBlur,
  bare,
  hideLabel,
}: FieldProps) {
  const [text, setText] = useState(String(value ?? ""));
  useEffect(() => {
    setText(String(value ?? ""));
  }, [value, readOnly]);
  const input = {
    id,
    name: id,
    autoComplete: "off",
    inputMode: numeric ? ("decimal" as const) : undefined,
    "aria-label": ariaLabel,
    placeholder,
    readOnly,
    ...attributes,
    value: text,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const next = event.target.value;
      setText(next);
      if (!numeric) onValue(next);
      else if (next !== "" && Number.isFinite(Number(next)))
        onValue(Number(next));
    },
    onBlur: () => {
      if (numeric && text === "") {
        onValue(nullable ? null : 0);
        if (!nullable) setText("0");
      }
      onBlur?.();
    },
  };
  const content = (
    <>
      {!hideLabel && <label htmlFor={id}>{label}</label>}
      {area ? (
        <textarea {...input} rows={3} />
      ) : (
        <input
          {...input}
          type={numeric ? "number" : "text"}
          step={numeric ? "any" : undefined}
        />
      )}
    </>
  );
  return bare ? content : <div className="field">{content}</div>;
}

export function Select({
  id,
  label,
  value,
  options,
  onValue,
  ariaLabel,
  attributes,
}: {
  id: string;
  label: string;
  value: any;
  options: (string | number | any[])[];
  onValue: (value: string) => void;
  ariaLabel?: string;
  attributes?: Record<string, string>;
}) {
  const normalized = options.map((x) => (Array.isArray(x) ? x : [x, x]));
  if (value && !normalized.some(([id]) => String(id) === String(value)))
    normalized.push([value, value + " (custom)"]);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={id}
        value={value ?? ""}
        aria-label={ariaLabel}
        {...attributes}
        onChange={(event) => onValue(event.target.value)}
      >
        {normalized.map(([id, text]) => (
          <option key={id} value={id}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Action({
  children,
  action,
  onClick,
  className = "quiet",
  disabled = false,
  label,
  attributes,
}: {
  children: ReactNode;
  action: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  label?: string;
  attributes?: Record<string, string>;
}) {
  return (
    <button
      type="button"
      className={className}
      data-action={action}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      {...attributes}
    >
      {children}
    </button>
  );
}

export function Disclosure({
  id,
  children,
  summary,
  open,
  onToggle,
  className = "",
}: {
  id: string;
  children: ReactNode;
  summary: ReactNode;
  open: boolean;
  onToggle: (open: boolean) => void;
  className?: string;
}) {
  const node = useRef<HTMLDetailsElement>(null);
  // A native toggle is queued. A section jump may reopen it before that event
  // reaches React, leaving the previous prop equal to the requested new prop.
  // Reconcile the native state after each render, including repeated jumps.
  useLayoutEffect(() => {
    if (node.current && node.current.open !== open) node.current.open = open;
  });
  return (
    <details
      ref={node}
      className={className}
      data-detail-key={id}
      open={open}
      onToggle={(event) => {
        const value = event.currentTarget.open;
        if (value !== open) onToggle(value);
      }}
    >
      <summary
        onClick={(event) => {
          event.preventDefault();
          onToggle(!open);
        }}
      >
        {summary}
      </summary>
      {children}
    </details>
  );
}

export const numericSize = (value: any) =>
  ({
    "--mm-number-size": `${Math.max(6, String(value ?? "").length + 2)}ch`,
  }) as CSSProperties;

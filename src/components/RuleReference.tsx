"use client";
import type { ReactNode } from "react";
import { requestReference, type ReferenceRequest } from "../services/content";

export function RuleReference({
  reference,
  onOpen,
}: {
  reference: ReferenceRequest;
  onOpen?: () => void;
}) {
  return (
    <button
      type="button"
      className="quiet rule-reference"
      aria-label={`Read ${reference.name}`}
      title={`Read ${reference.name}`}
      aria-haspopup="dialog"
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        onOpen?.();
        requestReference(reference);
      }}
    >
      ?
    </button>
  );
}

export function RuleName({
  reference,
  children,
}: {
  reference: ReferenceRequest | null;
  children?: ReactNode;
}) {
  return (
    <div className="rule-name-row">
      <strong>{children || reference?.name}</strong>
      {reference && <RuleReference reference={reference} />}
    </div>
  );
}

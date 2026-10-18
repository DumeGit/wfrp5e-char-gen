"use client";
import {
  createElement,
  useLayoutEffect,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

type FieldProps = (
  | InputHTMLAttributes<HTMLInputElement>
  | TextareaHTMLAttributes<HTMLTextAreaElement>
) & { tag: "input" | "textarea" };
// Keep the native typing buffer separate from committed numeric values. This
// permits clearing, multi-digit entry and validation on the native change event.
export function NativeTextField({ tag, ...props }: FieldProps) {
  const intended = String(props.value ?? "");
  const [text, setText] = useState(intended),
    [focused, setFocused] = useState(false);
  const [previous, setPrevious] = useState(intended);
  useLayoutEffect(() => {
    if (intended !== previous || !focused) {
      setText(intended);
      setPrevious(intended);
    }
  }, [intended, previous, focused]);
  return createElement(tag, {
    ...props,
    value: text,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setText(event.currentTarget.value),
  });
}

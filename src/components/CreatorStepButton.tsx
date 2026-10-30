"use client";

export function CreatorStepButton({
  destination,
  direction = "next",
  step,
  onNavigate,
  desktop = false,
}: {
  destination: string;
  direction?: "back" | "next";
  step?: number;
  onNavigate?: () => void;
  desktop?: boolean;
}) {
  return (
    <button
      type="button"
      className={`quiet creator-step-button creator-${direction}${desktop ? ` creator-desktop-${direction}` : ""}`}
      aria-label={`${direction === "back" ? "Back" : "Next"}: ${destination}`}
      title={`${direction === "back" ? "Back" : "Continue"} to ${destination}`}
      data-action={step === undefined ? undefined : "step"}
      data-step={step}
      onClick={(event) => {
        const workspace = event.currentTarget.closest(".workspace");
        onNavigate?.();
        requestAnimationFrame(() => {
          const heading = workspace?.querySelector<HTMLElement>("main h1");
          if (heading) {
            heading.tabIndex = -1;
            heading.focus({ preventScroll: true });
          }
          const selector = workspace?.querySelector<HTMLElement>(
            ".workspace-compact-selector",
          );
          if (selector && selector.getBoundingClientRect().top < 0) {
            selector.scrollIntoView({ block: "start", behavior: "instant" });
          }
        });
      }}
    >
      {direction === "back" ? "Back" : "Next"}
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d={
            direction === "back"
              ? "M20 12H5m6-6-6 6 6 6"
              : "M4 12h15m-6-6 6 6-6 6"
          }
        />
      </svg>
    </button>
  );
}

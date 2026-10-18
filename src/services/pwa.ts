export type PwaState = {
  installed: boolean;
  ready: boolean;
  online: boolean;
  updateAvailable: boolean;
  applying: boolean;
  failed: boolean;
  development: boolean;
};
export type PwaController = {
  install: () => Promise<boolean>;
  update: () => void;
  dispose: () => void;
};
type InstallEvent = Event & { prompt: () => Promise<void> };

// Called only from an effect. Disposing a route/remount cancels callbacks and
// removes every listener; no browser globals are accessed during prerendering.
export function connectPwa(onChange: (state: PwaState) => void): PwaController {
  let disposed = false;
  let registration: ServiceWorkerRegistration | undefined;
  let installPrompt: InstallEvent | undefined;
  const cleanups: (() => void)[] = [];
  const standalone = window.matchMedia("(display-mode: standalone)");
  const state: PwaState = {
    installed:
      standalone.matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
    ready: false,
    online: navigator.onLine,
    updateAvailable: false,
    applying: false,
    failed: false,
    development: process.env.NODE_ENV !== "production",
  };
  const emit = () => {
    if (!disposed) onChange({ ...state });
  };
  const listen = (
    target: EventTarget,
    name: string,
    listener: EventListener,
  ) => {
    target.addEventListener(name, listener);
    cleanups.push(() => target.removeEventListener(name, listener));
  };
  const showUpdate = () => {
    state.updateAvailable = Boolean(
      registration?.waiting && registration.active,
    );
    emit();
  };
  const watch = (worker: ServiceWorker | null) => {
    if (!worker) return;
    listen(worker, "statechange", () => {
      if (worker.state === "installed") showUpdate();
      if (worker.state === "redundant" && !registration?.active) {
        state.failed = true;
        emit();
      }
    });
  };
  const check = () => {
    if (!disposed && navigator.onLine)
      void registration?.update().catch(() => {});
  };
  listen(standalone, "change", () => {
    state.installed = standalone.matches;
    emit();
  });
  listen(window, "beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event as InstallEvent;
    emit();
  });
  listen(window, "appinstalled", () => {
    installPrompt = undefined;
    state.installed = true;
    emit();
  });
  listen(window, "online", () => {
    state.online = true;
    emit();
    check();
  });
  listen(window, "offline", () => {
    state.online = false;
    emit();
  });
  listen(document, "visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    listen(navigator.serviceWorker, "controllerchange", () => {
      if (state.applying) window.location.reload();
    });
    void navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none", scope: "/" })
      .then((value) => {
        if (disposed) return;
        registration = value;
        showUpdate();
        watch(value.installing);
        listen(value, "updatefound", () => watch(value.installing));
        void navigator.serviceWorker.ready.then(() => {
          if (disposed) return;
          state.ready = true;
          emit();
          showUpdate();
        });
      })
      .catch(() => {
        state.failed = true;
        emit();
      });
  } else if (process.env.NODE_ENV === "production") {
    state.failed = true;
  }
  emit();
  return {
    install: async () => {
      if (!installPrompt) return false;
      const prompt = installPrompt;
      installPrompt = undefined;
      await prompt.prompt();
      return true;
    },
    update: () => {
      if (!registration?.waiting || disposed) return;
      window.dispatchEvent(new Event("wfrp-before-update"));
      state.applying = true;
      emit();
      registration.waiting.postMessage({ type: "APPLY_UPDATE" });
    },
    dispose: () => {
      disposed = true;
      for (const cleanup of cleanups.splice(0)) cleanup();
    },
  };
}

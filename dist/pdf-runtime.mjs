// Every mode shares one retryable, on-demand PDF runtime. Editing and mode
// navigation do not need to download or execute this large export dependency.
let pending;
export function loadPDFLibrary() {
  if (globalThis.PDFLib?.PDFDocument) return Promise.resolve(globalThis.PDFLib);
  if (!pending)
    pending = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const fail = () => {
        script.remove();
        reject(
          new Error(
            "Could not load PDF export tools. Check your connection and try again.",
          ),
        );
      };
      script.src = new URL("./assets/pdf-lib.min.js", import.meta.url).href;
      script.async = true;
      script.onload = () =>
        globalThis.PDFLib?.PDFDocument ? resolve(globalThis.PDFLib) : fail();
      script.onerror = fail;
      document.head.append(script);
    }).catch((error) => {
      pending = null;
      throw error;
    });
  return pending;
}

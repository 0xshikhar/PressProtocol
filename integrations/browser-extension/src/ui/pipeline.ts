/**
 * Cryptographic Pipeline Stepper
 */

export function updatePipelineStep(
  el: HTMLElement,
  state: "pending" | "active" | "completed",
  customText?: string
): void {
  el.classList.remove("active", "completed");
  if (state !== "pending") {
    el.classList.add(state);
  }
  if (customText) {
    const textEl = el.querySelector(".step-text");
    if (textEl) {
      textEl.textContent = customText;
    }
  }
}

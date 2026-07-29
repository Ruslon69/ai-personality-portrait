export function focusElementByIdOnNextFrame(elementId: string) {
  const animationFrame = window.requestAnimationFrame(() => {
    document.getElementById(elementId)?.focus();
  });

  return () => window.cancelAnimationFrame(animationFrame);
}

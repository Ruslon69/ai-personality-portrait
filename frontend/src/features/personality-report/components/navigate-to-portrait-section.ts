export function navigateToPortraitSection(id: string, focusHeading = false) {
  const target = document.getElementById(id);
  if (!target) return false;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  window.history.replaceState(null, '', `#${id}`);
  if (focusHeading) {
    window.requestAnimationFrame(() => {
      const headingId = target.getAttribute('aria-labelledby');
      if (headingId) document.getElementById(headingId)?.focus({ preventScroll: true });
    });
  }
  return true;
}

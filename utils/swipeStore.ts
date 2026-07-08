// ── Tiny external store: "a Swiper page-flip transition is in progress" ──────
// Shared between App's Swiper transition events and the page renderer's
// fit-lines scheduler. Deliberately NOT React state in App, because App is a
// huge component and re-rendering it on every swipe start/end would itself
// cause jank. Instead the renderer subscribes with a ref-only callback (see
// QPCV2PageRenderer) so it reacts to swipe start/end WITHOUT re-rendering — it
// just flips a ref and nudges the deferred fit scheduler.
let active = false;
const listeners = new Set<(v: boolean) => void>();

/** Mark a flip transition as in-progress (true) or finished (false). */
export const setSwipeActive = (v: boolean) => {
    if (active === v) return;
    active = v;
    listeners.forEach((l) => {
        try { l(active); } catch { /* ignore listener errors */ }
    });
};

/** Subscribe to swipe start/end. Returns an unsubscribe function. */
export const subscribeSwipeActive = (cb: (v: boolean) => void) => {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
};

/** Read the current value (imperative, for guards that must not subscribe). */
export const isSwipeActive = () => active;

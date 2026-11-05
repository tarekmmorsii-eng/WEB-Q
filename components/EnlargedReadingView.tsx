import React, { useEffect, useRef, useState } from 'react';
import { X, Minus, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { readingViewText } from '../i18n/readingViewText';
import './enlargedReading.css';

export const MIN_READING_SIZE = 24;
export const MAX_READING_SIZE = 52;
export const clampReadingSize = (value: number) => Math.max(MIN_READING_SIZE, Math.min(MAX_READING_SIZE, Math.round(value)));

interface Props {
    pageNumber: number;
    totalPages: number;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    onExit: () => void;
    onNavigate: (page: number) => void;
    language: string;
    controlsVisible?: boolean;
    pinchZoomEnabled?: boolean;
    children: (gestureBlocked: React.MutableRefObject<boolean>) => React.ReactNode;
}

/** Owns gestures only in the additional reading view. The original pager is untouched. */
export default function EnlargedReadingView(props: Props) {
    const { pageNumber, totalPages, fontSize, onFontSizeChange, onExit, onNavigate, language, children } = props;
    const rootRef = useRef<HTMLDivElement>(null);
    const gestureBlocked = useRef(false);
    const sizeRef = useRef(fontSize);
    sizeRef.current = fontSize;
    const onSizeRef = useRef(onFontSizeChange);
    onSizeRef.current = onFontSizeChange;
    const navigationRef = useRef({ pageNumber, totalPages, onNavigate });
    navigationRef.current = { pageNumber, totalPages, onNavigate };
    const labels = readingViewText(language);
    const [headerSpace, setHeaderSpace] = useState(0);
    const controlsVisible = props.controlsVisible !== false;
    const pinchZoomEnabledRef = useRef(props.pinchZoomEnabled !== false);
    pinchZoomEnabledRef.current = props.pinchZoomEnabled !== false;

    useEffect(() => {
        const header = document.getElementById('mushaf-controls-header');
        if (!header) return;
        const measure = () => setHeaderSpace(Math.max(0, header.offsetHeight - (rootRef.current?.getBoundingClientRect().top || 0)));
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(header);
        window.addEventListener('resize', measure);
        return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
    }, []);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        let distance = 0, initialSize = 0, releaseTimer: ReturnType<typeof setTimeout> | undefined;
        let drag: { x: number; y: number; time: number; dx: number; dy: number; intent: 'pending' | 'horizontal' | 'vertical' } | null = null;
        let pinching = false;
        const release = () => {
            clearTimeout(releaseTimer);
            releaseTimer = setTimeout(() => { gestureBlocked.current = false; }, 700);
        };
        const gap = (touches: TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
        const start = (event: TouchEvent) => {
            if (event.touches.length === 1) {
                const target = event.target as Element;
                if (gestureBlocked.current || !target.closest('.enlarged-reading-scroll') || target.closest('button, a, input, select, textarea')) return;
                const point = event.touches[0];
                drag = { x: point.clientX, y: point.clientY, time: performance.now(), dx: 0, dy: 0, intent: 'pending' };
                return;
            }
            if (event.touches.length < 2) return;
            clearTimeout(releaseTimer);
            drag = null;
            pinching = true;
            gestureBlocked.current = true;
            distance = gap(event.touches);
            initialSize = sizeRef.current;
            event.stopPropagation();
            if (event.cancelable) event.preventDefault();
        };
        const move = (event: TouchEvent) => {
            if (!pinching && event.touches.length === 1 && drag) {
                drag.dx = event.touches[0].clientX - drag.x;
                drag.dy = event.touches[0].clientY - drag.y;
                const x = Math.abs(drag.dx), y = Math.abs(drag.dy);
                if (drag.intent === 'pending') {
                    if (y > 12 && y > x) drag.intent = 'vertical';
                    else if (x > 16 && x > y * 1.5) drag.intent = 'horizontal';
                }
                if (drag.intent === 'horizontal') {
                    gestureBlocked.current = true;
                    event.stopPropagation();
                    if (event.cancelable) event.preventDefault();
                }
                return;
            }
            if (!gestureBlocked.current) return;
            event.stopPropagation();
            if (event.touches.length >= 2 && distance > 0) {
                if (event.cancelable) event.preventDefault();
                if (pinchZoomEnabledRef.current) onSizeRef.current(clampReadingSize(initialSize * gap(event.touches) / distance));
            }
        };
        const end = (event: TouchEvent, cancelled = false) => {
            if (event.touches.length === 0 && drag) {
                const last = drag;
                drag = null;
                if (!cancelled && !pinching && last.intent === 'horizontal' && Math.abs(last.dx) >= 70 && Math.abs(last.dx) > Math.abs(last.dy) * 1.5 && performance.now() - last.time < 1500) {
                    const current = navigationRef.current;
                    // Match the original RTL Mushaf pager: drag right to advance.
                    const next = current.pageNumber + (last.dx > 0 ? 1 : -1);
                    if (next >= 1 && next <= current.totalPages) current.onNavigate(next);
                }
            }
            if (!gestureBlocked.current) return;
            event.stopPropagation();
            if (event.touches.length === 0) {
                distance = 0;
                pinching = false;
                // Suppress the compatibility click and any pending word long press.
                release();
            }
        };
        const cancel = (event: TouchEvent) => end(event, true);
        root.addEventListener('touchstart', start, { passive: false });
        root.addEventListener('touchmove', move, { passive: false });
        root.addEventListener('touchend', end);
        root.addEventListener('touchcancel', cancel);
        return () => {
            clearTimeout(releaseTimer);
            gestureBlocked.current = false;
            root.removeEventListener('touchstart', start);
            root.removeEventListener('touchmove', move);
            root.removeEventListener('touchend', end);
            root.removeEventListener('touchcancel', cancel);
        };
    }, []);

    useEffect(() => {
        rootRef.current?.querySelector('.enlarged-reading-scroll')?.scrollTo(0, 0);
    }, [pageNumber]);

    return <section ref={rootRef} data-enlarged-reading className="enlarged-reading-view"
        style={{ '--reading-font-size': `${fontSize}px`, '--reading-toolbar-top': controlsVisible ? `calc(${headerSpace}px + var(--android-status-bar-height, 0px))` : '0px' } as React.CSSProperties}
        onClickCapture={event => {
            if (gestureBlocked.current) { event.preventDefault(); event.stopPropagation(); }
        }}>
        <div className="enlarged-reading-toolbar" data-reading-controls={String(controlsVisible)} aria-hidden={!controlsVisible} inert={!controlsVisible}
            onClick={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
            <button type="button" className="enlarged-reading-exit" onClick={onExit}><X size={20} className="reading-close-icon" aria-hidden="true" />{labels.original}</button>
            <div className="enlarged-reading-center" role="group" aria-label={labels.size} dir="rtl">
                <button type="button" aria-label={labels.decrease} disabled={fontSize <= MIN_READING_SIZE} onClick={() => onFontSizeChange(clampReadingSize(fontSize - 2))}><Minus size={18} /></button>
                <output aria-label={labels.size} aria-live="polite">{Math.round(fontSize / 32 * 100)}%</output>
                <button type="button" aria-label={labels.increase} disabled={fontSize >= MAX_READING_SIZE} onClick={() => onFontSizeChange(clampReadingSize(fontSize + 2))}><Plus size={18} /></button>
            </div>
        </div>
        <div className="enlarged-reading-scroll">{children(gestureBlocked)}
            <nav className="enlarged-reading-pages" dir="rtl" aria-label={labels.open} onClick={e => e.stopPropagation()}>
                <button type="button" disabled={pageNumber <= 1} onClick={() => onNavigate(pageNumber - 1)}><ChevronRight size={18} />{labels.previous}</button>
                <span>{pageNumber} / {totalPages}</span>
                <button type="button" disabled={pageNumber >= totalPages} onClick={() => onNavigate(pageNumber + 1)}>{labels.next}<ChevronLeft size={18} /></button>
            </nav>
            <div className="enlarged-reading-close-bottom">
                <button type="button" aria-label={labels.close} title={labels.close} onClick={event => { event.stopPropagation(); onExit(); }}>
                    <X size={26} className="reading-close-icon" aria-hidden="true" />
                </button>
            </div>
        </div>
    </section>;
}

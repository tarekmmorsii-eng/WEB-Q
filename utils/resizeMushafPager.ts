import type { Swiper } from 'swiper';

/** Preserve the logical page while rebuilding the virtual pager's pixel grid. */
export function resizeMushafPager(swiper: Swiper, page: number) {
    if (swiper.destroyed || !swiper.el.clientWidth) return;
    if (swiper.width === swiper.el.clientWidth && swiper.height === swiper.el.clientHeight) return;

    const index = Math.max(0, page - 1);
    swiper.setTransition(0);
    swiper.updateSize();
    swiper.updateSlides();
    // setTranslate inside slideTo updates Virtual, which reads the active index
    // from the translate. Move to the preserved page BEFORE forcing Virtual.
    swiper.slideTo(index, 0, false);
    swiper.virtual?.update(true);
    swiper.updateSlidesClasses();
}

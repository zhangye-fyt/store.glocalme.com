if (!customElements.get('image-slider-with-text')) {
  class imageSliderWithText extends HTMLElement {
    constructor() {
      super()

      const columnsElements = this.querySelector('.image-slider-with-text__columns')
      columnsElements.addEventListener('mouseover', this.onColumnsMouseover.bind(this))
    }

    onColumnsMouseover({ target }) {
      const columnElement = target.closest('.image-slider-with-text__column')
      if (columnElement) {
        const imageElement = this.querySelector(
          `.image-slider-with-text__media[data-block-id="${columnElement.dataset.blockId}"]`
        )
        if (imageElement) {
          const swiperElement = this.querySelector('swiper-component')
          const index = Number(imageElement.dataset.index || 0)
          swiperElement.swiper.slideTo(index, 1000, false);
        }
      }
    }
  }
  customElements.define('image-slider-with-text', imageSliderWithText)
}

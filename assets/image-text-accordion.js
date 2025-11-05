class ImageTextAccordion extends HTMLElement {
  constructor() {
    super()

    this.addEventListener('mousemove', this.handleMouseEnter)

    this.setLineClamp()
    window.addEventListener(
      'resize',
      debounce(() => {
        this.setLineClamp()
      }, 200)
    )
  }

  handleMouseEnter({ target, currentTarget }) {
    const targetElement = target.closest('.image-text-accordion__image')
    if (targetElement && currentTarget.contains(targetElement)) {
      const targetElements = this.querySelectorAll('.image-text-accordion__image')
      for (const element of targetElements) {
        if (element === targetElement) {
          element.classList.add('active')
        } else {
          element.classList.remove('active')
        }
      }
    }
  }

  getLineHeight(element) {
    const computedStyle = window.getComputedStyle(element)
    let lineHeight = computedStyle.lineHeight
    if (lineHeight === 'normal') {
      const fontSize = parseFloat(computedStyle.fontSize)
      return fontSize * 1.2
    }
    return parseFloat(lineHeight)
  }

  getElementPadding(element) {
    const style = window.getComputedStyle(element)
    return {
      top: parseFloat(style.paddingTop),
      right: parseFloat(style.paddingRight),
      bottom: parseFloat(style.paddingBottom),
      left: parseFloat(style.paddingLeft)
    }
  }

  setLineClamp() {
    const imgElement = this.querySelector('.image-text-accordion__image')
    const textElment = this.querySelector('.image-text-accordion__text')
    if (imgElement && textElment) {
      const lineHeight = this.getLineHeight(textElment)
      const textPadding = this.getElementPadding(textElment)
      const imgRect = imgElement.getBoundingClientRect()

      const textInnerElements = this.querySelectorAll('.image-text-accordion__text-inner')

      Array.from(textInnerElements).forEach((element) => {
        const lineClamp = Math.floor((imgRect.height - (textPadding.top + textPadding.bottom)) / lineHeight)
        element.style.height = (lineClamp * lineHeight - 10).toFixed(2) + 'px'
        element.style.setProperty('--text-line-clamp', lineClamp - 1)
      })
      textElment
    }
  }
}
customElements.define('image-text-accordion', ImageTextAccordion)

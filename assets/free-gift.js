if (!customElements.get('free-gift')) {
  class FreeGift extends HTMLElement {
    constructor() {
      super()
      this.addEventListener('dropdownItemSelected', this.handleDropdownItemSeleced.bind(this))
    }

    handleDropdownItemSeleced(event) {
      const { source } = event.detail
      if (!source) return

      const scriptElement = source.querySelector('script[type="text/html"]')
      if (scriptElement) {
        const dropdownComponent = source.closest('dropdown-component')
        const selectedElement = dropdownComponent.querySelector('.free-gift__selected-product')
        if (selectedElement) {
          selectedElement.innerHTML = scriptElement.innerHTML
        }
      }
    }
  }
  customElements.define('free-gift', FreeGift)
}

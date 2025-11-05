if (!customElements.get('country-checker')) {
  class CountryChecker extends HTMLElement {
    constructor() {
      super()

      this.init()
      this.addEventListener('dropdownItemSelected', this.handleDropdownItemSeleced.bind(this))
    }

    init() {
      const jsonScript = this.querySelector(`[type="application/json"]`)
      if (jsonScript) {
        this.coverageArea = JSON.parse(jsonScript.textContent) || []
      }
    }

    handleDropdownItemSeleced(event) {
      const { source } = event.detail
      if (!source) return
      const country = source?.innerHTML
      const countryCode = source?.dataset.param

      const flagElement = this.querySelector('.country-checker__flag')
      if (flagElement) {
        flagElement.src = `https://cdn.shopify.com/static/images/flags/${countryCode?.toLowerCase()}.svg`
        flagElement.alt = country
      }

      const descriptionElement = this.querySelector('.country-checker__description')
      if (descriptionElement && this.coverageArea?.length) {
        function replacePlaceholders(str, type, country) {
          return str.replace('[type]', type).replace('[country]', country)
        }

        let html = `<strong class="block body-large">${country}</strong>`
        let tempAvailable = []
        const { availableText, notAvailableText } = descriptionElement.dataset
        for (let area of this.coverageArea) {
          if (area.area.includes(countryCode)) {
            html += `<span class="block body-normal">${replacePlaceholders(availableText, area.type, country)}</span>`
            tempAvailable.push(true)
          } else {
            html += `<span class="block body-normal">${replacePlaceholders(
              notAvailableText,
              area.type,
              country
            )}</span>`
            tempAvailable.push(false)
          }
        }
        this.setResultContentBackground(tempAvailable)
        descriptionElement.innerHTML = html
      }

      const conmtentElement = this.querySelector('.country-checker__content')
      if (conmtentElement) {
        conmtentElement.classList.remove('hidden')
      }
    }

    setResultContentBackground(arr) {
      const conmtentElement = this.querySelector('.country-checker__content')
      if (arr.every((item) => item === true)) {
        conmtentElement.setAttribute('data-available', true)
      } else if (arr.every((item) => item === false)) {
        conmtentElement.setAttribute('data-available', false)
      } else {
        conmtentElement.removeAttribute('data-available')
      }
    }
  }
  customElements.define('country-checker', CountryChecker)
}

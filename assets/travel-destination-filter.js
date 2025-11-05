if (!customElements.get('travel-destination-filter')) {
  class TravelDestinationFilter extends HTMLElement {
    constructor() {
      super()
      this.addEventListener('dropdownItemSelected', this.handleDropdownItemSeleced.bind(this))
    }

    handleDropdownItemSeleced(event) {
      const { source } = event.detail
      if (!source) return
      const countryTags = source?.dataset.tags
      if (FacetFiltersForm && countryTags?.length > 0) {
        let filterParams = ''
        for (const tag of countryTags.split(',')) {
          filterParams += `&filter.p.tag=${tag}`
        }
        this.dataset.filterParams = filterParams

        let filterFormElement = this.closest('facet-filters-form')
        if (filterFormElement) {
          filterFormElement?.onSubmitHandler?.(event)
        } else {
          const filterSubstituteElement = document.querySelector('travel-destination-filter[type="substitute"]')
          if (filterSubstituteElement) {
            filterSubstituteElement.addEventListener('submit', (e) => {
              e.target.closest('facet-filters-form')?.onSubmitHandler?.(e)
            })
            filterSubstituteElement.dataset.filterParams = filterParams
            filterSubstituteElement.dispatchEvent(new Event('submit', { bubbles: true }))
          }
        }
      }
    }
  }
  customElements.define('travel-destination-filter', TravelDestinationFilter)
}

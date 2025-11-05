if (!customElements.get("tabs-products-list")) {
  class TabsProductsList extends HTMLElement {
    constructor() {
      super();

      const tabsElement = document.querySelector(".tabs-products-list__tabs");
      tabsElement?.addEventListener("click", this.handleTabsClick.bind(this));
    }

    handleTabsClick(event) {
      const target = event.target.closest(".tabs-products-list__tab");
      if (!target) return;
      const index = target.dataset.index;
      const tabElements = this.querySelectorAll(".tabs-products-list__tab");
      tabElements.forEach((ele, idx) => {
        ele.classList.toggle("active", idx === parseInt(index));
      });

      const panelElements = this.querySelectorAll(`.tabs-products-list__tabs-panel`);
      panelElements?.forEach((ele, idx) => {
        ele.classList.toggle("hidden", idx !== parseInt(index));
      });
    }
  }
  customElements.define("tabs-products-list", TabsProductsList);
}

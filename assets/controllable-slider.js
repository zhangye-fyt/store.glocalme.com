if (!customElements.get("controllable-slider")) {
  class ControllableSlider extends SwiperComponent {
    constructor() {
      super();

      const tabsElement = this.querySelector(".controllable-slider__tabs");
      tabsElement.addEventListener("click", this.onTabsClick.bind(this));
    }

    onTabsClick({ target }) {
      const tabsItem = target.closest(".controllable-slider__tabs-item");
      if (tabsItem) {
        const { index } = tabsItem.dataset;
        this.swiper.slideTo(index);
        this.handleTabsItemStatus(index);
      }
    }

    handleTabsItemStatus(index) {
      const tabsItems = this.querySelectorAll(".controllable-slider__tabs-item");
      tabsItems.forEach((element) => {
        if (element.dataset.index == index) {
          element.classList.add("active");
        } else {
          element.classList.remove("active");
        }
      });
    }

    slideChange() {
      this.handleTabsItemStatus(this.swiper.realIndex);
    }
  }
  customElements.define("controllable-slider", ControllableSlider);
}

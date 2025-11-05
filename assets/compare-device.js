if (!customElements.get("compare-device")) {
  class CompareDevice extends HTMLElement {
    constructor() {
      super();
      function throttle(fn, delay) {
        let lastCall = 0;
        return function (...args) {
          const now = Date.now();
          if (now - lastCall >= delay) {
            lastCall = now;
            fn.apply(this, args);
          }
        };
      }

      const target = this.querySelector(".compare-device__container");

      window.addEventListener(
        "scroll",
        throttle(() => this.checkElementPosition(target), 100)
      );
    }

    checkElementPosition(element) {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const isAtMiddle = rect.top <= viewportHeight / 2 && rect.bottom >= viewportHeight / 2;

      const elementHeight = rect.height;
      const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      const isPartOutOfView = visibleHeight < elementHeight * (1 / 2);

      const innerElements = this.querySelectorAll(".compare-device__item-back-inner");
      if (isAtMiddle) {
        innerElements.forEach((element) => {
          const ulElement = element.querySelector("ul");
          const ulElementHeight = ulElement?.getBoundingClientRect().height || 0;
          element.style.height = ulElementHeight + "px";
        });
      }
      if (isPartOutOfView) {
        innerElements.forEach((element) => {
          element.style.height = 0;
        });
      }
    }
  }
  customElements.define("compare-device", CompareDevice);
}

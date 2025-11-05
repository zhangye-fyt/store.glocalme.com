if (!customElements.get("banner-newsletter")) {
  class BannerNewsletter extends HTMLElement {
    constructor() {
      super();

      const button = this.querySelector('button[type="submit"]');
      button.addEventListener("click", this.onButtonClick.bind(this));
    }

    onButtonClick(e) {
      e.preventDefault();
      const form = this.querySelector("form");
      const checkbox = this.querySelector(".banner-newsletter__form-agreement input[type='checkbox']");
      const message = this.querySelector(".banner-newsletter__form-agreement-message");
      if (!checkbox?.checked) {
        message?.classList.remove("hidden");
        return;
      }
      message?.classList.add("hidden");
      form.submit();
    }
  }
  customElements.define("banner-newsletter", BannerNewsletter);
}

if (!customElements.get("group-products")) {
  class GroupProducts extends HTMLElement {
    constructor() {
      super();

      this.getElements();
      this.setupEventListeners();
    }

    getElements() {
      this.elements = {
        inputs: this.querySelectorAll(".dropdown__input"),
        cart: document.querySelector("cart-notification") || document.querySelector("cart-drawer"),
        addToCartButton: this.querySelector('button[data-type="add-to-cart"]'),
        buyNowButton: this.querySelector('button[data-type="buy-now"]')
      };
    }

    setupEventListeners() {
      this.addEventListener("dropdownItemSelected", this.handleDropdownItemSeleced.bind(this));
      this.elements.addToCartButton?.addEventListener("click", this.onAddToCartButtonClick.bind(this));
      this.elements.buyNowButton?.addEventListener("click", this.onBuyNowButtonClick.bind(this));
    }

    handleDropdownItemSeleced(event) {
      const { source } = event.detail;
      if (!source) return;
      console.log("source", source);
      fetch(`${source.dataset.url}?variant=${source.dataset.param}&section_id=price`)
        .then((response) => response.text())
        .then((text) => {
          const sectionInnerHTML = new DOMParser().parseFromString(text, "text/html").querySelector(".shopify-section");
          const productElement = source.closest(".group-products__product");
          const priceElement = productElement.querySelector(".group-products__product-price");
          priceElement.innerHTML = sectionInnerHTML.innerHTML;
        })
        .catch((err) => {
          console.log("err", err);
        });
    }

    enableLoading() {
      this.elements.addToCartButton.classList.add("disabled");
      this.elements.buyNowButton.classList.add("disabled");
    }

    disableLoading() {
      if (this.elements.cart && this.elements.cart.classList.contains("is-empty"))
        this.elements.cart.classList.remove("is-empty");
      this.elements.addToCartButton.classList.remove("disabled");
      this.elements.buyNowButton.classList.remove("disabled");
    }

    onAddToCartButtonClick() {
      this.enableLoading();

      const items = Array.from(this.elements.inputs).map((element) => {
        return {
          id: Number(element.dataset.param),
          quantity: 1
        };
      });

      let formData = {
        items
      };

      if (this.elements.cart) {
        formData.sections = this.elements.cart.getSectionsToRender().map((section) => section.id);
        formData.sections_url = window.location.pathname;
      }

      fetch(window.Shopify.routes.root + "cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
        .then((response) => response.json())
        .then((response) => {
          this.elements.cart.renderContents(response);
        })
        .catch((error) => {
          console.error("Error occurred:", error);
        })
        .finally(() => {
          this.disableLoading();
        });
    }

    onBuyNowButtonClick() {
      this.enableLoading();

      const lines = Array.from(this.elements.inputs).map((element) => {
        return {
          merchandiseId: `gid://shopify/ProductVariant/${element.dataset.param}`,
          quantity: 1
        };
      });

      const params = {
        query: `mutation cartCreate($input: CartInput) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables: {
          input: {
            lines
          }
        }
      };

      fetch(`/api/2025-01/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": "2fcecfeb950d76c006e7676210261d14"
        },
        body: JSON.stringify(params)
      })
        .then((response) => response.json())
        .then((response) => {
          const checkoutUrl = response.data.cartCreate.cart.checkoutUrl;
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
          }
        })
        .catch((error) => {
          console.error("Error occurred:", error);
        })
        .finally(() => {
          this.disableLoading();
        });
    }
  }
  customElements.define("group-products", GroupProducts);
}

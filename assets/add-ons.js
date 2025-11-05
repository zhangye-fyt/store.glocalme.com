if (!customElements.get("add-ons")) {
  class AddOns extends HTMLElement {
    constructor() {
      super();
      this.getElements();
      this.setupEventListeners();
    }

    getElements() {
      this.elements = {
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
      const { variantCount, param } = source.dataset;

      const scriptElement = source.querySelector('script[type="text/html"][data-type="product"]');
      if (scriptElement) {
        const dropdownComponent = source.closest("dropdown-component");
        const selectedElement = dropdownComponent.querySelector(".add-ons__selected-product");
        if (selectedElement) {
          selectedElement.innerHTML = scriptElement.innerHTML;
        }
      }

      const priceScriptElement = source.querySelector('script[type="text/html"][data-type="price"]');
      if (priceScriptElement) {
        const priceElement = this.querySelector(".add-ons__price");
        if (priceElement) {
          priceElement.innerHTML = priceScriptElement.innerHTML;
        }
      }

      this.dataset.variantId = param;
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

      let formData = {
        items: [
          {
            id: this.dataset.variantId,
            quantity: 1
          }
        ]
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

      const lines = [
        {
          merchandiseId: `gid://shopify/ProductVariant/${this.dataset.variantId}`,
          quantity: 1
        }
      ];

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

  customElements.define("add-ons", AddOns);
}

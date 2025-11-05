if (!customElements.get("bundle-up")) {
  class BundleUp extends HTMLElement {
    constructor() {
      super();

      this.getElements();
      this.setupEventListeners();
    }

    getElements() {
      this.elements = {
        checkbox: this.querySelectorAll('input[type="checkbox"]'),
        cart: document.querySelector("cart-notification") || document.querySelector("cart-drawer"),
        addToCartButton: this.querySelector('button[data-type="add-to-cart"]'),
        buyNowButton: this.querySelector('button[data-type="buy-now"]')
      };
    }

    setupEventListeners() {
      Array.from(this.elements.checkbox).forEach((element) => {
        element.addEventListener("change", this.onCheckboxChange.bind(this));
      });
      this.elements.addToCartButton?.addEventListener("click", this.onAddToCartButtonClick.bind(this));
      this.elements.buyNowButton?.addEventListener("click", this.onBuyNowButtonClick.bind(this));
    }

    onCheckboxChange({ target }) {
      const productElement = target.closest(".bundle-up__product");
      if (productElement) {
        if (target.checked) {
          productElement.classList.add("active");
        } else {
          productElement.classList.remove("active");
        }
      }
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

      const checkedCheckboxEelemnts = this.querySelectorAll(
        '.bundle-up__product-checkbox input[type="checkbox"]:checked'
      );

      const items = Array.from(checkedCheckboxEelemnts).map((element) => {
        return {
          id: Number(element.dataset.variantId),
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

      const checkedCheckboxEelemnts = this.querySelectorAll(
        '.bundle-up__product-checkbox input[type="checkbox"]:checked'
      );

      const lines = Array.from(checkedCheckboxEelemnts).map((element) => {
        return {
          merchandiseId: `gid://shopify/ProductVariant/${element.dataset.variantId}`,
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
  customElements.define("bundle-up", BundleUp);
}

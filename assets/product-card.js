const generateSrcset = (image, widths = []) => {
  const imageUrl = new URL(image["src"]);
  return widths
    .filter((width) => width <= image["width"])
    .map((width) => {
      imageUrl.searchParams.set("width", width.toString());
      return `${imageUrl.href} ${width}w`;
    })
    .join(", ");
};

const createImageElement = (image, classes, sizes, productTitle) => {
  const previewImage = image["preview_image"];
  const newImage = new Image(previewImage["width"], previewImage["height"]);
  newImage.className = classes;
  newImage.alt = image["alt"] || productTitle;
  newImage.sizes = sizes;
  newImage.src = previewImage["src"];
  newImage.srcset = generateSrcset(previewImage, [165, 360, 533, 720, 940, 1066]);
  newImage.loading = "lazy";
  return newImage;
};

const checkSwatches = () => {
  document.querySelectorAll(".js-color-swatches-wrapper").forEach((wrapper) => {
    wrapper.querySelectorAll(".js-color-swatches input").forEach((input) => {
      input.addEventListener("click", (event) => {
        const primaryImage = wrapper.querySelector(".media--first");
        const secondaryImage = wrapper.querySelector(".media--second");
        const handleProduct = wrapper.dataset.product;

        if (event.currentTarget.checked && primaryImage) {
          wrapper
            .querySelector(".js-color-swatches-link")
            .setAttribute("href", event.currentTarget.dataset.variantLink);
          if (wrapper.querySelector('.card__add-to-cart button[name="add"]')) {
            wrapper.querySelector('.card__add-to-cart button[name="add"]').setAttribute("aria-disabled", false);
            if (wrapper.querySelector('.card__add-to-cart button[name="add"] > span')) {
              wrapper.querySelector('.card__add-to-cart button[name="add"] > span').classList.remove("hidden");
              wrapper.querySelector('.card__add-to-cart button[name="add"] .sold-out-message').classList.add("hidden");
            }
            wrapper.querySelector('.card__add-to-cart input[name="id"]').value = event.currentTarget.dataset.variantId;
          }

          const currentColor = event.currentTarget.value;

          jQuery.getJSON(window.Shopify.routes.root + `products/${handleProduct}.js`, function (product) {
            const variant = product.variants.filter(
              (item) => item.featured_media != null && item.options.includes(currentColor)
            )[0];

            if (variant) {
              const newPrimaryImage = createImageElement(
                variant["featured_media"],
                primaryImage.className,
                primaryImage.sizes,
                product.title
              );

              if (newPrimaryImage.src !== primaryImage.src) {
                let flag = false;
                if (secondaryImage) {
                  const secondaryImagePathname = new URL(secondaryImage.src).pathname;
                  const newPrimaryImagePathname = new URL(newPrimaryImage.src).pathname;

                  if (secondaryImagePathname == newPrimaryImagePathname) {
                    primaryImage.remove();
                    secondaryImage.classList.remove("media--second");
                    secondaryImage.classList.add("media--first");
                    flag = true;
                  }
                }
                if (flag == false) {
                  primaryImage.animate({ opacity: [1, 0] }, { duration: 200, easing: "ease-in", fill: "forwards" })
                    .finished;
                  setTimeout(function () {
                    primaryImage.replaceWith(newPrimaryImage);
                    newPrimaryImage.animate({ opacity: [0, 1] }, { duration: 200, easing: "ease-in" });
                    if (secondaryImage) {
                      secondaryImage.remove();
                    }
                  }, 200);
                }
              }
            }
          });
        }
      });
    });
  });
};

function colorSwatches() {
  checkSwatches();

  document.addEventListener("shopify:section:load", function () {
    checkSwatches();
  });
}

(function () {
  colorSwatches();
})();

if (!customElements.get("product-card")) {
  class ProductCard extends HTMLElement {
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
      this.elements.addToCartButton?.addEventListener("click", this.onAddToCartButtonClick.bind(this));
      this.elements.buyNowButton?.addEventListener("click", this.onBuyNowButtonClick.bind(this));
    }

    enableLoading() {
      this.elements.addToCartButton?.classList.add("disabled");
      this.elements.buyNowButton?.classList.add("disabled");
    }

    disableLoading() {
      if (this.elements.cart && this.elements.cart.classList.contains("is-empty"))
        this.elements.cart.classList.remove("is-empty");
      this.elements.addToCartButton?.classList.remove("disabled");
      this.elements.buyNowButton?.classList.remove("disabled");
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
          this.elements.cart?.renderContents?.(response);
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

  customElements.define("product-card", ProductCard);
}

class SwiperComponent extends HTMLElement {
  constructor() {
    super();
    try {
      this.init();
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }

  init() {
    const swiperElement = this.querySelector(".swiper");
    if (!window.Swiper || !swiperElement) return;

    const { options, arrow, pagination } = this.dataset;
    let swiperOptions = {};
    if (options) {
      swiperOptions = JSON.parse(options);
    }
    if (arrow == "true") {
      swiperOptions = {
        navigation: {
          nextEl: this.querySelector(".swiper-button-next"),
          prevEl: this.querySelector(".swiper-button-prev")
        },
        ...swiperOptions
      };
    }
    if (pagination == "true") {
      swiperOptions = {
        pagination: {
          el: this.querySelector(".swiper-pagination")
        },
        on: {
          slideChangeTransitionEnd: () => {
            this.slideChange?.();
          }
        },
        ...swiperOptions
      };
    }
    this.swiper = new Swiper(swiperElement, swiperOptions);
  }

  slideTo(index, speed, runCallbacks) {
    this.swiper.slideTo(index, speed, runCallbacks);
  }
}
customElements.define("swiper-component", SwiperComponent);

class TabsComponent extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const tabsElement = this.querySelector("[data-tabs]");
    tabsElement.addEventListener("click", ({ target }) => {
      try {
        const tabElement = target.closest("[data-tab]");
        if (tabElement && tabsElement.contains(tabElement)) {
          const { index } = tabElement.dataset;
          const tabElements = tabsElement.querySelectorAll("[data-tab]");

          Array.from(tabElements).forEach((element) => {
            if (element === tabElement) {
              element.classList.add("active");
            } else {
              element.classList.remove("active");
            }
          });

          const tabsContentElements = this.querySelectorAll("[data-tabs-content]");
          Array.from(tabsContentElements).forEach((element) => {
            if (element.dataset.index === index) {
              element.classList.remove("hidden");
            } else {
              element.classList.add("hidden");
            }
          });
        }
      } catch (error) {
        console.error("Error occurred:", error);
      }
    });
  }
}
customElements.define("tabs-component", TabsComponent);

class AnchorTargetText extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const anchorsElement = this.querySelector("[data-anchors]");
    if (!anchorsElement) return;

    // 点击事件绑定
    anchorsElement.addEventListener("click", (event) => {
      try {
        const anchorElement = event.target.closest("[data-anchor]");
        if (!anchorElement || !anchorsElement.contains(anchorElement)) return;

        const { anchorTargetText } = anchorElement.dataset;
        if (!anchorTargetText) return;

        // 获取全局查找根节点（优先 main，退回 body）
        const anchorTargetElement = document.querySelector("main") || document.body;

        // 排除当前组件所在的顶层 section（或最近的带 id 的父节点）
        const skipNode = this;

        // 收集文本节点（排除自身区域）
        const textNodes = [];
        const walker = document.createTreeWalker(anchorTargetElement, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            return skipNode.contains(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
          }
        });

        let node;
        while ((node = walker.nextNode())) {
          textNodes.push(node);
        }

        // 拼接所有文本（仅用于查找索引，不影响真实节点）
        const fullText = textNodes.map((n) => n.textContent).join("");
        const index = fullText.indexOf(anchorTargetText);

        if (index !== -1) {
          this.handleTextAnchor(anchorTargetText, index, anchorTargetElement, skipNode);
        } else {
          // 匹配 alt 文本
          const imgElements = anchorTargetElement.querySelectorAll("img");
          for (const img of imgElements) {
            if (skipNode.contains(img)) continue; // 跳过自己
            const altText = img.getAttribute("alt");
            if (altText && altText.includes(anchorTargetText)) {
              this.scrollToImage(img);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error occurred:", error);
      }
    });
  }

  handleTextAnchor(anchorTargetText, index, anchorTargetElement, skipNode) {
    let textRange = document.createRange();
    let selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();

    // 计算目标文本起止节点
    const startInfo = this.findNodeAtOffset(anchorTargetElement, index, skipNode);
    const endInfo = this.findNodeAtOffset(anchorTargetElement, index + anchorTargetText.length, skipNode);

    if (!startInfo.node || !endInfo.node) return;

    textRange.setStart(startInfo.node, startInfo.offset);
    textRange.setEnd(endInfo.node, endInfo.offset);
    selection.addRange(textRange);

    const rect = textRange.getBoundingClientRect();
    const fixedHeaderHeight = document.querySelector(".shopify-section-header-sticky")?.offsetHeight || 0;
    const scrollY = window.scrollY + rect.top - fixedHeaderHeight;
    window.scrollTo({ top: scrollY, behavior: "smooth" });
  }

  scrollToImage(img) {
    const rect = img.getBoundingClientRect();
    const fixedHeaderHeight = document.querySelector(".shopify-section-header-sticky")?.offsetHeight || 0;
    const scrollY = window.scrollY + rect.top - fixedHeaderHeight;
    window.scrollTo({ top: scrollY, behavior: "smooth" });
  }

  // 在节点树中找到特定偏移的文本节点
  findNodeAtOffset(rootNode, targetOffset, skipNode) {
    if (!rootNode || targetOffset < 0) {
      return { node: null, offset: 0 };
    }

    let currentOffset = 0;
    let found = null;

    function traverse(node) {
      if (skipNode.contains(node)) return; // 跳过自身区域

      if (node.nodeType === Node.TEXT_NODE) {
        const length = node.textContent.length;
        if (currentOffset + length > targetOffset) {
          found = { node, offset: targetOffset - currentOffset };
          return true;
        }
        currentOffset += length;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of node.childNodes) {
          if (traverse(child)) return true;
        }
      }
      return false;
    }

    traverse(rootNode);
    return found || { node: null, offset: 0 };
  }
}

customElements.define("anchor-target-text", AnchorTargetText);

class DropdownComponent extends HTMLElement {
  constructor() {
    super();
    this.getElements();
    this.setupEventListeners();
  }

  getElements() {
    this.elements = {
      input: this.querySelector(":scope > .dropdown__input"),
      list: this.querySelector(":scope > .dropdown__list")
    };
  }

  setupEventListeners() {
    if (this.elements.input && !this.elements.input.hasAttribute("hidden")) {
      this.elements.input.addEventListener("focus", this.onOpen.bind(this));
    } else {
      this.addEventListener("click", this.onOpen.bind(this));
    }
    const debouncedOnInput = debounce((event) => {
      this.onInputInput(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);
    this.elements.input?.addEventListener("input", (event) => {
      event.stopPropagation();
      debouncedOnInput(event);
    });
    this.elements.list?.addEventListener("click", this.onListClick.bind(this));
    document.addEventListener("click", (event) => {
      if (!this.contains(event.target) || event.target.closest("dropdown-component") !== this) {
        this.removeAttribute("open");
      }
    });
  }

  onOpen(event) {
    if (event.target.closest("dropdown-component") !== this) return;
    this.setAttribute("open", "");
  }

  onInputInput(event) {
    if (!this.hasAttributes("open")) this.onOpen(event);
    const value = event.target.value.toLowerCase();
    const itemsElements = this.querySelectorAll(".dropdown__item");
    Array.from(itemsElements).forEach((element) => {
      const itemValue = element.innerHTML.toLowerCase();
      if (!value.length || itemValue.includes(value) || value.includes(itemValue)) {
        element.classList.remove("hidden");
      } else {
        element.classList.add("hidden");
      }
    });
  }

  onListClick(event) {
    event.stopPropagation();

    const itemElement = event.target.closest(".dropdown__item");
    if (itemElement && event.currentTarget.contains(itemElement)) {
      if (this.elements.input) {
        this.elements.input.value = itemElement.dataset.value;
        this.elements.input.dispatchEvent(new Event("change", { bubbles: true }));
        this.elements.input.dataset.param = itemElement.dataset.param;
      }
      this.isClickingItem = false;
      this.removeAttribute("open");

      this.dispatchEvent(
        new CustomEvent("dropdownItemSelected", {
          detail: { source: itemElement },
          bubbles: true
        })
      );
    }
  }
}
customElements.define("dropdown-component", DropdownComponent);

class CopyButton extends HTMLElement {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  connectedCallback() {
    this.classList.add("cursor-pointer");
    this.addEventListener("click", this.handleClick);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick);
  }

  async handleClick() {
    const textToCopy = this.dataset.copyData || this.textContent.trim();
    const textOriginal = this.dataset.textOriginal || this.textContent.trim();
    const textSuccess = this.dataset.textSuccess || "已复制";

    try {
      await navigator.clipboard.writeText(textToCopy);

      this.innerHTML = textSuccess;
      this.style.opacity = "0.7";
      setTimeout(() => {
        this.innerHTML = textOriginal;
        this.style.opacity = "1";
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  }
}

customElements.define("copy-button", CopyButton);

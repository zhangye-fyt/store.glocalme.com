if (!customElements.get("tab-anchor")) {
  class TabAnchor extends HTMLElement {
    constructor() {
      super();
      this.sectionTabAnchor = this.closest(".section-tab-anchor");
      this.anchorsElement = this.querySelector("[data-anchors]");
      this.listElement = this.querySelector(".tab-anchor__list");

      document.addEventListener("DOMContentLoaded", () => this.updateStickyOffset());
      this.init();
    }

    init() {
      if (this.listElement) {
        this.listElement.addEventListener("click", this.handleListClick.bind(this));
      }

      if (!this.anchorsElement) return;

      this.anchorsElement.addEventListener("click", (event) => {
        const anchorElement = event.target.closest("[data-anchor]");
        if (!anchorElement || !this.anchorsElement.contains(anchorElement)) return;

        const { anchorTargetText } = anchorElement.dataset;
        if (!anchorTargetText) return;

        this.handleAnchorClick(anchorTargetText);
      });
    }

    handleAnchorClick(anchorTargetText) {
      try {
        const root = document.querySelector("main") || document.body;
        const skipNode = this;

        // 搜集所有文本节点（排除当前组件）
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => (skipNode.contains(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
        });

        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) textNodes.push(node);

        const fullText = textNodes.map((n) => n.textContent).join("");
        const index = fullText.indexOf(anchorTargetText);

        if (index !== -1) {
          this.scrollToText(anchorTargetText, index, root, skipNode);
          return;
        }

        // 匹配 alt 文本（图片）
        const targetImg = [...root.querySelectorAll("img")].find(
          (img) => !skipNode.contains(img) && img.alt?.includes(anchorTargetText)
        );
        if (targetImg) this.scrollToElement(targetImg);
      } catch (error) {
        console.error("TabAnchor Error:", error);
      }
    }

    scrollToText(text, index, root, skipNode) {
      const start = this.findNodeAtOffset(root, index, skipNode);
      const end = this.findNodeAtOffset(root, index + text.length, skipNode);
      if (!start.node || !end.node) return;

      const range = document.createRange();
      range.setStart(start.node, start.offset);
      range.setEnd(end.node, end.offset);

      const rect = range.getBoundingClientRect();
      this.scrollToRect(rect);

      // 移除蓝色选中状态
      const selection = window.getSelection();
      if (selection) selection.removeAllRanges();
    }

    scrollToElement(el) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      this.scrollToRect(rect);
    }

    scrollToRect(rect) {
      const offset =
        (document.querySelector(".announcement-bar")?.offsetHeight || 0) +
        (document.querySelector("sticky-header")?.offsetHeight || 0) +
        (this.sectionTabAnchor?.offsetHeight || 0) +
        50;

      window.scrollTo({ top: window.scrollY + rect.top - offset, behavior: "smooth" });
    }

    findNodeAtOffset(root, targetOffset, skipNode) {
      let currentOffset = 0;
      let result = null;

      function traverse(node) {
        if (skipNode.contains(node)) return false;
        if (node.nodeType === Node.TEXT_NODE) {
          const len = node.textContent.length;
          if (currentOffset + len > targetOffset) {
            result = { node, offset: targetOffset - currentOffset };
            return true;
          }
          currentOffset += len;
        } else {
          for (const child of node.childNodes) if (traverse(child)) return true;
        }
        return false;
      }

      traverse(root);
      return result || { node: null, offset: 0 };
    }

    updateStickyOffset() {
      const top =
        (document.querySelector(".announcement-bar")?.offsetHeight || 0) +
        (document.querySelector("sticky-header")?.offsetHeight || 0);
      if (this.sectionTabAnchor) this.sectionTabAnchor.style.top = `${top}px`;
    }

    handleListClick(event) {
      const target = event.target.closest(".tab-anchor__item");
      if (!target) return;
      this.querySelectorAll(".tab-anchor__item").forEach((el) => el.classList.remove("active"));
      target.classList.add("active");
    }
  }

  customElements.define("tab-anchor", TabAnchor);
}

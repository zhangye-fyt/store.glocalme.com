(function () {
  //Fix for Shopify customizer
  function fallbackCopyTextToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; 
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const successful = document.execCommand("copy");
      return successful;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
  
  function copyLink(e, copyButton) {
		e.preventDefault();
    const url = window.location.href;

    const handleCopy = (btn, success) => {
      if (success) {
        btn.classList.add("copied");
        setTimeout(() => {
          btn.classList.remove("copied");
        }, 1000);
      } else {
        btn.classList.add("notCopied");
        setTimeout(() => {
          btn.classList.remove("notCopied");
        }, 1000);
      }
    };

    if (window.Shopify && window.Shopify.designMode) {
      const success = fallbackCopyTextToClipboard(url);
      handleCopy(copyButton, success);
    }
    else {
      navigator.clipboard.writeText(url).then(
        () => {
          handleCopy(copyButton, true);
        },
        () => {
          handleCopy(copyButton, false);
        }
      );
    }
  }

  const copyButtons = document.querySelectorAll(".copy-btn");

  if (copyButtons.length) {
    for (const copyButton of copyButtons) {
      copyButton.addEventListener("click", (e) => copyLink(e, copyButton));
    }
  }

  document.addEventListener("shopify:section:load", function (event) {
    const copyButtons = document.querySelectorAll(".copy-btn");

    if (copyButtons.length) {
      for (const copyButton of copyButtons) {
        copyButton.addEventListener("click", (e) => copyLink(e, copyButton));
      }
    }
  });
})();
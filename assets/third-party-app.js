;(() => {
  function isPC() {
    const userAgent = navigator.userAgent
    const mobileRegex = /Android|iPhone|iPad|iPod|Windows Phone|Mobile|BlackBerry/i
    return !mobileRegex.test(userAgent)
  }

  function handleIframe() {
    if (isPC()) {
      const iframe = document.querySelector('.mgmt-tv-elevate-widgetss iframe')
      if (iframe) {
        iframe.style.height = 'auto'

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
        const iframeHead = iframeDoc.head
        const stylesElement = document.createElement('style')
        stylesElement.innerHTML = `
				.top-row .tp-widget-stars {
					margin-bottom: 16px;
				}
				.tp-widget-review .header {
					margin-bottom: 10px;
					font-size: 17px;
				}
				.tp-widget-review .text {
					margin-bottom: 10px;
					font-size: 15px;
				}
				.tp-widget-reviews-filter-label {
					margin-top: 10px;
				}
			`
        iframeHead.appendChild(stylesElement)
      }
    }
  }

  function handleGTranslate() {
    const twImgs = document.querySelectorAll(
      '.g-translate-selector img[src="https://cdn.gtranslate.net/flags/svg/zh-TW.svg"],.g-translate-selector img[data-gt-lazy-src="https://cdn.gtranslate.net/flags/svg/zh-TW.svg"],.g-translate-selector img[alt="zh-TW"]'
    )
    twImgs.forEach((img) => {
      const cnFlag = 'https://cdn.gtranslate.net/flags/svg/zh-CN.svg'
      img.src = cnFlag
      img.setAttribute('data-gt-lazy-src', cnFlag)
    })
    const gTranslateSelectors = document.querySelectorAll('.g-translate-selector')
    gTranslateSelectors.forEach((selector) => {
      selector.style.display = 'block'
    })
  }

  window.addEventListener('load', () => {
    handleIframe()
    handleGTranslate()
  })

  window.addEventListener('resize', () => {
    handleIframe()
  })
})()

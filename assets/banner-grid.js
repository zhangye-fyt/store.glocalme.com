;(() => {
	let bannerGridSlider

	const initSlider = (slider) => {
		slider.classList.add('swiper')

		const wrapper = slider.querySelector('.banner-grid__grid')

		if (!wrapper) return

		wrapper.classList.add('swiper-wrapper')

		const slides = slider.querySelectorAll('.banner-grid__card')

		if (!slides || !slides.length) return

		slides.forEach((slide) => {
			slide.classList.add('swiper-slide')
		})

		bannerGridSlider = new Swiper(slider, {
			loop: false,
			slidesPerView: 1.1,
			spaceBetween: 16,
			speed: 1000,
			mousewheel: {
				forceToAxis: true,
			},
		})
	}

	const destroySlider = (section) => {
		if (!section || !section?.classList.contains('banner-grid-section')) return

		const slider = section.querySelector('.banner-grid-slider')
		const slides = section.querySelectorAll('.banner-grid__card')
		const wrapper = section.querySelector('.banner-grid__grid')

		if (!slider || !slides || !slides.length || !wrapper) return

		slider.classList.remove('swiper')

		slides.forEach((slide) => {
			slide.classList.remove('swiper-slide')
		})

		wrapper.classList.remove('swiper-wrapper')

		bannerGridSlider.destroy(true, true)
		bannerGridSlider = null
	}

	const calcHeightButton = (section, width) => {
		let parent
		if (document.currentScript) {
			parent = document.currentScript.parentElement
		} else {
			parent = section
		}

		const cards = parent.querySelectorAll('.banner-grid__card_full-link')
		cards.forEach((card) => {
			const button = card.querySelector('.banner-grid__button')
			let heightButton
			if (button && width >= 750) {
				heightButton =
					button.getBoundingClientRect().height +
					parseFloat(
						window.getComputedStyle(button, null).getPropertyValue('margin-top')
					)
			} else {
				if (width < 750) heightButton = 16
				else heightButton = 24
			}

			card.style = `--height-button: ${heightButton}px`
			if (card.querySelector('.banner-grid__top')) {
				card.querySelector('.banner-grid__top').style.marginBottom =
					heightButton + 'px'
			} else if (card.querySelector('.banner-grid__title-content')) {
				card.querySelector('.banner-grid__title-content').style.marginTop =
					heightButton + 'px'
			}
		})
	}

	const initSection = (section) => {
		let sectionBannerGrid

		if (document.currentScript) {
			sectionBannerGrid = document.currentScript.parentElement
		} else {
			sectionBannerGrid = section
		}

		if (!sectionBannerGrid) return

		const slider = sectionBannerGrid.querySelector('.banner-grid-slider')

		const sectionResizeObserver = new ResizeObserver((entries) => {
			const [entry] = entries

			calcHeightButton(sectionBannerGrid, entry.contentRect.width)

			if (entry.contentRect.width < 576 && slider) {
				initSlider(slider)
			} else if (bannerGridSlider) {
				destroySlider(sectionBannerGrid)
			}
		})

		sectionResizeObserver.observe(sectionBannerGrid)
	}

	initSection()

	document.addEventListener('shopify:section:load', function (section) {
		initSection(section.target)
	})
})()

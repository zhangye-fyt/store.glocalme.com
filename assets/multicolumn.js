;(function () {
	let multicolumnSlider

	const initSlider = (slider) => {
		slider.classList.add('swiper')

		const wrapper = slider.querySelector('.multicolumn-list__wrapper')

		if (!wrapper) return

		wrapper.classList.add('swiper-wrapper')

		const slides = slider.querySelectorAll('.multicolumn-card')

		if (!slides || !slides.length) return

		slides.forEach((slide) => {
			slide.classList.add('swiper-slide')
		})

		multicolumnSlider = new Swiper(slider, {
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
		if (!section || !section?.classList.contains('multicolumn-section')) return

		const slider = section.querySelector('.multicolumn-slider')
		const slides = section.querySelectorAll('.multicolumn-card')
		const wrapper = section.querySelector('.multicolumn-list__wrapper')

		if (!slider || !slides || !slides.length || !wrapper) return

		slider.classList.remove('swiper')

		slides.forEach((slide) => {
			slide.classList.remove('swiper-slide')
		})

		wrapper.classList.remove('swiper-wrapper')

		multicolumnSlider.destroy(true, true)
		multicolumnSlider = null
	}

	const initMulticolumn = (section) => {
		if (!section || !section?.classList.contains('multicolumn-section')) return

		const slider = section.querySelector('.multicolumn-slider')

		if (!slider) return

		const sectionResizeObserver = new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.contentRect.width < 576 && slider) {
					initSlider(slider)
				} else if (multicolumnSlider) {
					destroySlider(section)
				}
			})
		})

		sectionResizeObserver.observe(section)
	}

	if (multicolumnSlider) {
		destroySlider(document.currentScript.parentElement)
	}

	initMulticolumn(document.currentScript.parentElement)

	document.addEventListener('shopify:section:load', function (e) {
		if (multicolumnSlider) {
			destroySlider(e.target)
		}

		initMulticolumn(e.target)
	})
})()

;(function () {
	let popularProductsSwiper

	const initSlider = (slider) => {
		slider.classList.add('swiper')

		const wrapper = slider.querySelector('.popular-products__wrapper')

		if (!wrapper) return

		wrapper.classList.add('swiper-wrapper')

		const slides = slider.querySelectorAll(
			'.popular-products__item, .popular-products__item_placeholder'
		)

		if (!slides || !slides.length) return

		slides.forEach((slide) => {
			slide.classList.add('swiper-slide')
		})

		popularProductsSwiper = new Swiper(slider, {
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
		if (!section || !section?.classList.contains('popular-products-section'))
			return

		const slider = section.querySelector('.popular-products-slider')
		const slides = section.querySelectorAll(
			'.popular-products__item, .popular-products__item_placeholder'
		)
		const wrapper = section.querySelector('.popular-products__wrapper')

		if (!slider || !slides || !slides.length || !wrapper) return

		slider.classList.remove('swiper')

		slides.forEach((slide) => {
			slide.classList.remove('swiper-slide')
		})

		wrapper.classList.remove('swiper-wrapper')

		popularProductsSwiper.destroy(true, true)
		popularProductsSwiper = null
	}

	const initPopularProducts = (section) => {
		if (!section || !section?.classList.contains('popular-products-section'))
			return

		const slider = section.querySelector('.popular-products-slider')

		if (!slider) return

		const sectionResizeObserver = new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.contentRect.width < 576 && slider) {
					initSlider(slider)
				} else if (popularProductsSwiper) {
					destroySlider(section)
				}
			})
		})

		sectionResizeObserver.observe(section)
	}

	if (popularProductsSwiper) {
		destroySlider(document.currentScript.parentElement)
	}

	initPopularProducts(document.currentScript.parentElement)

	document.addEventListener('shopify:section:load', function (e) {
		if (popularProductsSwiper) {
			destroySlider(e.target)
		}

		initPopularProducts(e.target)
	})
})()

if (!customElements.get('full-screen-video')) {
  class FullScreenVideo extends HTMLElement {
    constructor() {
      super()
      this.init()
      this.addEventListener('click', this.handleClear.bind(this))
    }

    init() {
      this.videoElement = this.querySelector('video')
      if (this.videoElement) {
        document.body.classList.add('overflow-hidden')
        this.videoElement.play()
        this.videoElement.addEventListener('ended', () => {
          this.handleClear()
        })
      } else {
        this.remove()
      }
    }

    handleClear() {
      this.videoElement?.pause()
      this.remove()
      document.body.classList.remove('overflow-hidden')
    }
  }
  customElements.define('full-screen-video', FullScreenVideo)
}

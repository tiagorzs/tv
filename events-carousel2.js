document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".events-carousel-inner")
  const prevButton = document.querySelector(".events-carousel-prev")
  const nextButton = document.querySelector(".events-carousel-next")
  const progressBar = document.querySelector(".progress-bar")

  let currentIndex = 0
  let totalSlides = 0
  let slideWidth = 0
  let autoplayInterval

  function initCarousel() {
    const slides = carousel.children
    totalSlides = slides.length
    slideWidth = slides[0].offsetWidth

    // Clone first and last slide for infinite effect
    carousel.appendChild(slides[0].cloneNode(true))
    carousel.insertBefore(slides[totalSlides - 1].cloneNode(true), slides[0])

    // Set initial position
    carousel.style.transform = `translateX(-${slideWidth}px)`

    updateButtonStates()
    updateProgressBar()

    // Start autoplay if enabled
    startAutoplay()
  }

  function moveCarousel(direction) {
    currentIndex += direction
    const translateX = -((currentIndex + 1) * slideWidth)
    carousel.style.transition = "transform 0.3s ease-in-out"
    carousel.style.transform = `translateX(${translateX}px)`

    if (currentIndex === totalSlides) {
      setTimeout(() => {
        carousel.style.transition = "none"
        currentIndex = 0
        carousel.style.transform = `translateX(-${slideWidth}px)`
      }, 300)
    } else if (currentIndex === -1) {
      setTimeout(() => {
        carousel.style.transition = "none"
        currentIndex = totalSlides - 1
        carousel.style.transform = `translateX(-${totalSlides * slideWidth}px)`
      }, 300)
    }

    updateButtonStates()
    updateProgressBar()
    resetAutoplay()
  }

  function updateButtonStates() {
    prevButton.disabled = false
    nextButton.disabled = false
  }

  function updateProgressBar() {
    if (progressBar) {
      const progress = ((currentIndex + 1) / totalSlides) * 100
      progressBar.style.width = `${progress}%`
    }
  }

  function startAutoplay() {
    // Check if autoplay is enabled via data attribute
    const autoplayEnabled = carousel.dataset.autoplay !== "false"

    if (autoplayEnabled) {
      autoplayInterval = setInterval(() => {
        moveCarousel(1)
      }, 5000) // Change slide every 5 seconds
    }
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval)
    startAutoplay()
  }

  function handleSwipe() {
    let touchStartX = 0
    let touchEndX = 0

    carousel.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX
      },
      { passive: true },
    )

    carousel.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX
        const diff = touchStartX - touchEndX
        if (Math.abs(diff) > 50) {
          // Minimum swipe distance
          moveCarousel(diff > 0 ? 1 : -1)
        }
      },
      { passive: true },
    )
  }

  prevButton.addEventListener("click", () => moveCarousel(-1))
  nextButton.addEventListener("click", () => moveCarousel(1))

  // Handle window resize
  window.addEventListener("resize", () => {
    slideWidth = carousel.children[0].offsetWidth
    carousel.style.transition = "none"
    carousel.style.transform = `translateX(-${(currentIndex + 1) * slideWidth}px)`
  })

  initCarousel()
  handleSwipe()
})


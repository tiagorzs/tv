document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const carousel = document.querySelector(".channels-carousel")
  const track = document.querySelector(".channels-track")
  const items = document.querySelectorAll(".channel-item")
  const prevButton = document.querySelector(".channels-carousel-container .carousel-prev")
  const nextButton = document.querySelector(".channels-carousel-container .carousel-next")
  const indicatorsContainer = document.querySelector(".carousel-indicators")

  // Variables
  let currentIndex = 0
  let itemWidth = 0
  let itemsPerSlide = 0
  let totalSlides = 0
  const indicators = []
  let autoplayInterval
  let isDragging = false
  let startPos = 0
  let currentTranslate = 0
  let prevTranslate = 0
  let position = 0 // Added from update

  // Initialize carousel
  function initCarousel() {
    calculateDimensions()
    //createIndicators() //Removed as per update
    setupEventListeners()
    updateCarousel()
    startAutoplay()
  }

  // Calculate dimensions and responsive values
  function calculateDimensions() {
    const carouselWidth = carousel.offsetWidth

    // Determine items per slide based on screen width
    if (window.innerWidth >= 1200) {
      itemsPerSlide = 10 // Show 10 items on large screens
    } else if (window.innerWidth >= 992) {
      itemsPerSlide = 8
    } else if (window.innerWidth >= 768) {
      itemsPerSlide = 6
    } else if (window.innerWidth >= 576) {
      itemsPerSlide = 4
    } else {
      itemsPerSlide = 3
    }

    itemWidth = carouselWidth / itemsPerSlide
    totalSlides = Math.ceil(items.length / itemsPerSlide)

    // Set width for each item
    items.forEach((item) => {
      item.style.width = `${itemWidth}px`
    })

    // Set track width
    track.style.width = `${itemWidth * items.length}px`
  }

  // Setup event listeners
  function setupEventListeners() {
    // Navigation buttons
    prevButton.addEventListener("click", goToPrevSlide)
    nextButton.addEventListener("click", goToNextSlide)

    // Keyboard navigation
    document.addEventListener("keydown", handleKeyboardNavigation)

    // Touch events for swiping
    carousel.addEventListener("touchstart", touchStart, { passive: true })
    carousel.addEventListener("touchmove", touchMove, { passive: true })
    carousel.addEventListener("touchend", touchEnd, { passive: true })

    // Mouse events for dragging
    carousel.addEventListener("mousedown", dragStart)
    carousel.addEventListener("mousemove", drag)
    carousel.addEventListener("mouseup", dragEnd)
    carousel.addEventListener("mouseleave", dragEnd)

    // Window resize
    window.addEventListener("resize", handleResize)

    // Touch events for mobile swiping from update
    let touchStartX = 0
    let touchEndX = 0

    track.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX
      },
      { passive: true },
    )

    track.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX
        if (touchStartX - touchEndX > 50) {
          goToNextSlide()
        } else if (touchEndX - touchStartX > 50) {
          goToPrevSlide()
        }
      },
      { passive: true },
    )
  }

  // Navigation functions
  function goToPrevSlide() {
    if (currentIndex > 0) {
      currentIndex--
      updateCarousel()
    } else {
      // Optional: loop back to the end
      // currentIndex = totalSlides - 1;
      // updateCarousel();

      // Or bounce effect
      bounceEffect("left")
    }
    resetAutoplay()
  }

  function goToNextSlide() {
    if (currentIndex < totalSlides - 1) {
      currentIndex++
      updateCarousel()
    } else {
      // Optional: loop back to the beginning
      // currentIndex = 0;
      // updateCarousel();

      // Or bounce effect
      bounceEffect("right")
    }
    resetAutoplay()
  }

  function goToSlide(index) {
    currentIndex = index
    updateCarousel()
    resetAutoplay()
  }

  // Update carousel position and state
  function updateCarousel() {
    position = -currentIndex * (itemWidth * itemsPerSlide) //updated from update
    track.style.transform = `translateX(${position}px)`

    // Update indicators
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex)
    })

    // Update button states
    updateButtonStates()

    // Update from update
    prevButton.style.display = position < 0 ? "flex" : "none"
    nextButton.style.display = position > -(track.offsetWidth - window.innerWidth) ? "flex" : "none"
  }

  // Update button states (disabled/enabled)
  function updateButtonStates() {
    prevButton.disabled = currentIndex === 0
    prevButton.classList.toggle("disabled", currentIndex === 0)

    nextButton.disabled = currentIndex === totalSlides - 1
    nextButton.classList.toggle("disabled", currentIndex === totalSlides - 1)
  }

  // Bounce effect when reaching the end
  function bounceEffect(direction) {
    const bounceDistance = 50
    const bounceTime = 300
    const originalTransform = track.style.transform

    if (direction === "left") {
      track.style.transform = `translateX(${bounceDistance}px)`
    } else {
      const currentTranslate = -currentIndex * (itemWidth * itemsPerSlide)
      track.style.transform = `translateX(${currentTranslate - bounceDistance}px)`
    }

    setTimeout(() => {
      track.style.transform = originalTransform
    }, bounceTime)
  }

  // Handle keyboard navigation
  function handleKeyboardNavigation(e) {
    if (e.key === "ArrowLeft") {
      goToPrevSlide()
    } else if (e.key === "ArrowRight") {
      goToNextSlide()
    }
  }

  // Touch event handlers
  function touchStart(e) {
    startPos = e.touches[0].clientX
    isDragging = true
    prevTranslate = currentTranslate
  }

  function touchMove(e) {
    if (!isDragging) return

    const currentPosition = e.touches[0].clientX
    currentTranslate = prevTranslate + (currentPosition - startPos)

    // Limit dragging to prevent excessive movement
    const maxTranslate = 0
    const minTranslate = -(totalSlides - 1) * (itemWidth * itemsPerSlide)

    if (currentTranslate > maxTranslate) {
      currentTranslate = maxTranslate + (currentTranslate - maxTranslate) * 0.3
    } else if (currentTranslate < minTranslate) {
      currentTranslate = minTranslate + (currentTranslate - minTranslate) * 0.3
    }

    track.style.transform = `translateX(${currentTranslate}px)`
  }

  function touchEnd(e) {
    isDragging = false

    const movedBy = currentTranslate - prevTranslate

    // Determine if slide should change based on movement
    if (movedBy < -100 && currentIndex < totalSlides - 1) {
      goToNextSlide()
    } else if (movedBy > 100 && currentIndex > 0) {
      goToPrevSlide()
    } else {
      // Return to current slide
      updateCarousel()
    }

    resetAutoplay()
  }

  // Mouse drag event handlers
  function dragStart(e) {
    e.preventDefault()
    startPos = e.clientX
    isDragging = true
    prevTranslate = currentTranslate
  }

  function drag(e) {
    if (!isDragging) return

    const currentPosition = e.clientX
    currentTranslate = prevTranslate + (currentPosition - startPos)

    // Apply same limits as touch events
    const maxTranslate = 0
    const minTranslate = -(totalSlides - 1) * (itemWidth * itemsPerSlide)

    if (currentTranslate > maxTranslate) {
      currentTranslate = maxTranslate + (currentTranslate - maxTranslate) * 0.3
    } else if (currentTranslate < minTranslate) {
      currentTranslate = minTranslate + (currentTranslate - minTranslate) * 0.3
    }

    track.style.transform = `translateX(${currentTranslate}px)`
  }

  function dragEnd(e) {
    if (!isDragging) return
    isDragging = false

    const movedBy = currentTranslate - prevTranslate

    // Determine if slide should change based on movement
    if (movedBy < -100 && currentIndex < totalSlides - 1) {
      goToNextSlide()
    } else if (movedBy > 100 && currentIndex > 0) {
      goToPrevSlide()
    } else {
      // Return to current slide
      updateCarousel()
    }

    resetAutoplay()
  }

  // Handle window resize
  function handleResize() {
    // Recalculate dimensions
    calculateDimensions()

    // If current index is now out of bounds, adjust it
    if (currentIndex >= totalSlides) {
      currentIndex = totalSlides - 1
    }

    // Recreate indicators if needed
    //createIndicators() //Removed as per update

    // Update carousel position
    updateCarousel()
  }

  // Autoplay functionality
  function startAutoplay() {
    // Check if autoplay is enabled via data attribute
    const autoplayEnabled = carousel.dataset.autoplay !== "false"

    if (autoplayEnabled) {
      autoplayInterval = setInterval(() => {
        if (currentIndex < totalSlides - 1) {
          goToNextSlide()
        } else {
          currentIndex = 0
          updateCarousel()
        }
      }, 5000)
    }
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval)
    startAutoplay()
  }

  // Initialize the carousel
  initCarousel()
})


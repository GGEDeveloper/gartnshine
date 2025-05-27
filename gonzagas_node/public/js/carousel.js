document.addEventListener('DOMContentLoaded', function() {
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-nav.prev');
  const nextBtn = document.querySelector('.carousel-nav.next');
  const cards = document.querySelectorAll('.collection-card');
  const cardWidth = cards[0] ? cards[0].offsetWidth + 32 : 332; // width + gap
  let scrollPosition = 0;
  let maxScroll = track.scrollWidth - track.clientWidth;

  // Update max scroll on window resize
  window.addEventListener('resize', () => {
    maxScroll = track.scrollWidth - track.clientWidth;
  });

  // Previous button click
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      scrollPosition = Math.max(scrollPosition - cardWidth, 0);
      track.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      updateButtons();
    });
  }

  // Next button click
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      scrollPosition = Math.min(scrollPosition + cardWidth, maxScroll);
      track.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      updateButtons();
    });
  }


  // Update button states based on scroll position
  function updateButtons() {
    if (prevBtn) prevBtn.disabled = scrollPosition <= 0;
    if (nextBtn) nextBtn.disabled = scrollPosition >= maxScroll - 10; // Small threshold for floating point inaccuracies
  }

  // Initial button state
  updateButtons();

  // Handle scroll events for the track
  if (track) {
    track.addEventListener('scroll', () => {
      scrollPosition = track.scrollLeft;
      updateButtons();
    });
  }

  // Add animation to product cards when they come into view
  const productCards = document.querySelectorAll('.product-card');
  const animateOnScroll = () => {
    productCards.forEach((card, index) => {
      const cardTop = card.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      // If the card is in the viewport
      if (cardTop < windowHeight - 100) {
        // Add a delay based on the card's position for a staggered effect
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }
    });
  };

  // Initial check
  animateOnScroll();
  
  // Check on scroll
  window.addEventListener('scroll', animateOnScroll);
});

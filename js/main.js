document.addEventListener('DOMContentLoaded', () => {
    // Sparkle animation handler
    const sparkleWrapper = document.getElementById('sparkle-wrapper');
    if (sparkleWrapper) {
        setTimeout(() => {
            sparkleWrapper.classList.remove('sparkle-animation');
        }, 2000); // Stop animation after 2 seconds
    }

    // Smooth scroll for the explore button
    const exploreBtn = document.getElementById('explore-btn');
    const featuredSection = document.getElementById('featured');

    if (exploreBtn && featuredSection) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            featuredSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

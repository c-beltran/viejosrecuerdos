document.addEventListener('DOMContentLoaded', () => {
    const exploreBtn = document.getElementById('explore-btn');
    const featuredSection = document.getElementById('featured');

    if (exploreBtn && featuredSection) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            featuredSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

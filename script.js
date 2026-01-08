// Website Interactions
document.addEventListener('DOMContentLoaded', function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Hide loading overlay after page loads
    window.addEventListener('load', function() {
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            
            // Trigger initial animations
            setTimeout(() => {
                triggerInitialAnimations();
            }, 200);
        }, 800); // Shorter loading time for website feel
    });
    
    // Mobile Hamburger Navigation
    initializeMobileNavigation();
    
    // Portfolio Filter
    initializePortfolioFilter();
    
    // Smooth interactions
    initializeSmoothInteractions();
});

// Initialize mobile navigation
function initializeMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const mobileSidebar = document.querySelector('.mobile-sidebar');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const navbar = document.querySelector('.navbar');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileSidebar.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileSidebar.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking on sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileSidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking on sidebar CTA buttons
    document.querySelectorAll('.sidebar-cta a').forEach(button => {
        button.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileSidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking on overlay
    mobileOverlay.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileSidebar.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Initialize portfolio filter
function initializePortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(filterBtn => filterBtn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filter portfolio cards
            portfolioCards.forEach((card, index) => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Initialize smooth interactions
function initializeSmoothInteractions() {
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('button, .btn-primary, .btn-secondary, .service-card, .portfolio-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// Trigger initial animations for hero section with proper staggering
function triggerInitialAnimations() {
    const heroElements = document.querySelectorAll('#home .reveal-left, #home .reveal-right, #home .reveal');
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('active');
        }, index * 300 + 500); // 500ms initial delay, then 300ms between elements
    });
}


// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


// Enhanced scroll-triggered animations with staggered timing
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            
            // Check if element has stagger class for sequential animations
            const staggerDelay = element.classList.contains('stagger-1') ? 150 :
                                element.classList.contains('stagger-2') ? 300 :
                                element.classList.contains('stagger-3') ? 450 :
                                element.classList.contains('stagger-4') ? 600 : 0;
            
            setTimeout(() => {
                element.classList.add('active');
            }, staggerDelay);
        }
    });
}, observerOptions);

// Observe all reveal elements
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
});

// Parallax effect for hero section
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroVideo = document.querySelector('.hero-video');
    
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
    
    if (heroVideo) {
        heroVideo.style.transform = `translateY(${scrolled * 0.05}px)`;
    }
    
    ticking = false;
}

window.addEventListener('scroll', function() {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// Add magnetic effect to buttons
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.02)';
        this.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Normal scrolling - no custom momentum

// Enhanced smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});
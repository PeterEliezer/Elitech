// Navigation
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li');

// Debug: Check if elements are found
console.log('Burger element:', burger);
console.log('Nav element:', nav);
console.log('Nav links:', navLinks);

// Toggle Navigation
burger.addEventListener('click', () => {
    console.log('Burger clicked!');
    
    // Toggle Nav
    nav.classList.toggle('nav-active');
    console.log('Nav active class:', nav.classList.contains('nav-active'));
    
    // Animate Links
    navLinks.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });
    
    // Burger Animation
    burger.classList.toggle('toggle');
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Music Player
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause');
const progressBar = document.querySelector('.progress');
const playlistDiv = document.querySelector('.playlist');

let currentTrackIndex = 0;
let isPlaying = false;

const musicTracks = [
    {
        title: 'Sample Track 1',
        artist: 'Artist Name 1',
        src: 'Eli-Njuchi-Composure.mp3'
    },
    {
        title: 'Sample Track 2',
        artist: 'Artist Name 2',
        src: 'sample-music-2.mp3'
    }
];

function loadTrack(index) {
    audioPlayer.src = musicTracks[index].src;
    audioPlayer.load();
}

function playPauseToggle() {
    if (isPlaying) {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    isPlaying = !isPlaying;
}

playPauseBtn.addEventListener('click', playPauseToggle);

audioPlayer.addEventListener('timeupdate', () => {
    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
});

audioPlayer.addEventListener('ended', () => {
    currentTrackIndex++;
    if (currentTrackIndex < musicTracks.length) {
        loadTrack(currentTrackIndex);
        audioPlayer.play();
    } else {
        currentTrackIndex = 0;
        loadTrack(currentTrackIndex);
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
});

function displayPlaylist() {
    playlistDiv.innerHTML = ''; // Clear existing playlist
    musicTracks.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.classList.add('track-item');
        trackElement.innerHTML = `
            <h4>${track.title}</h4>
            <p>${track.artist}</p>
        `;
        trackElement.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            audioPlayer.play();
            isPlaying = true;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        });
        playlistDiv.appendChild(trackElement);
    });
}

// Initial load of the first track and display playlist
loadTrack(currentTrackIndex);
displayPlaylist();

// Scroll Animation
const sections = document.querySelectorAll('section');

const observerOptions = {
    threshold: 0.25
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// Add some sample portfolio items
const portfolioGrid = document.querySelector('.portfolio-grid');
const portfolioItems = [
    {
        title: 'E-commerce Website',
        description: 'A modern e-commerce platform built with React',
        image: 'https://via.placeholder.com/300x200'
    },
    {
        title: 'Portfolio Website',
        description: 'A responsive portfolio website for a photographer',
        image: 'https://via.placeholder.com/300x200'
    },
    {
        title: 'Blog Platform',
        description: 'A full-featured blog platform with CMS',
        image: 'https://via.placeholder.com/300x200'
    }
];

portfolioItems.forEach(item => {
    const portfolioItem = document.createElement('div');
    portfolioItem.className = 'portfolio-item';
    portfolioItem.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
    `;
    portfolioGrid.appendChild(portfolioItem);
});

// Add some sample news items
const newsGrid = document.querySelector('.news-grid');
const newsItems = [
    {
        title: 'New Web Development Trends',
        date: 'March 15, 2024',
        excerpt: 'Exploring the latest trends in web development...'
    },
    {
        title: 'The Future of JavaScript',
        date: 'March 10, 2024',
        excerpt: 'What\'s coming next in the JavaScript ecosystem...'
    },
    {
        title: 'Building Responsive Websites',
        date: 'March 5, 2024',
        excerpt: 'Best practices for creating responsive web designs...'
    }
];

newsItems.forEach(item => {
    const newsItem = document.createElement('div');
    newsItem.className = 'news-item';
    newsItem.innerHTML = `
        <h3>${item.title}</h3>
        <p class="date">${item.date}</p>
        <p>${item.excerpt}</p>
        <a href="#" class="read-more">Read More</a>
    `;
    newsGrid.appendChild(newsItem);
});

// Counter Animation
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 40);
}

// Intersection Observer for counter animation
const observerOptionsCounter = {
    threshold: 0.5
};

const observerCounter = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.counter');
            counters.forEach(counter => {
                const target = parseInt(counter.textContent);
                animateCounter(counter, target);
            });
            observerCounter.unobserve(entry.target);
        }
    });
}, observerOptionsCounter);

// Observe stats section
const statsSection = document.querySelector('.stats');
if (statsSection) {
    observerCounter.observe(statsSection);
}

// Add animation to service cards on scroll
const serviceCards = document.querySelectorAll('.service-card');
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

serviceCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    cardObserver.observe(card);
});

// Enhanced Animation System
document.addEventListener('DOMContentLoaded', () => {
    // Add stagger animation to grid items
    const gridItems = document.querySelectorAll('.services-grid .service-card, .skills-grid .skill-card, .portfolio-grid .portfolio-item, .news-grid .news-card');
    gridItems.forEach((item, index) => {
        item.classList.add('stagger-animation');
        item.style.animationDelay = `${index * 0.1}s`;
    });

    // Add scroll animations
    const scrollElements = document.querySelectorAll('.scroll-animate');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });

    scrollElements.forEach(el => scrollObserver.observe(el));

    // Add hover animations to interactive elements
    const interactiveElements = document.querySelectorAll('.cta-button, .service-card, .skill-card, .news-card, .testimonial');
    interactiveElements.forEach(el => {
        el.classList.add('glow');
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.cta-button, .submit-btn, #play-pause');
    buttons.forEach(button => {
        button.classList.add('ripple');
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');
            
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add typing animation to hero title
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        heroTitle.classList.add('typing-animation');
    }

    // Add floating animation to icons
    const icons = document.querySelectorAll('.skill-card i, .service-card i, .stat-item i');
    icons.forEach(icon => {
        icon.classList.add('floating');
    });

    // Add pulse animation to CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.classList.add('animate-pulse');
    }

    // Add bounce animation to social links
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.classList.add('animate-bounce');
    });

    // Add scale animation to logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.classList.add('animate-scale-in');
    }

    // Add fade-in animation to sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.classList.add('scroll-animate');
        section.style.animationDelay = `${index * 0.2}s`;
    });

    // Add loading animation to form inputs
    const formInputs = document.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.classList.add('animate-scale-in');
        });
    });

    // Add success animation to upload form
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function() {
            this.classList.add('upload-success');
            setTimeout(() => this.classList.remove('upload-success'), 1000);
        });
    }

    // Add hover effects to music tracks
    const trackItems = document.querySelectorAll('.track-item');
    trackItems.forEach(track => {
        track.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px) scale(1.02)';
        });
        track.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
        });
    });

    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Add smooth reveal animation for testimonials
    const testimonials = document.querySelectorAll('.testimonial');
    testimonials.forEach((testimonial, index) => {
        testimonial.style.opacity = '0';
        testimonial.style.transform = 'translateY(30px)';
        testimonial.style.transition = `all 0.6s ease ${index * 0.2}s`;
        
        const testimonialObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.3 });
        
        testimonialObserver.observe(testimonial);
    });

    // Add page load animation
    document.body.classList.add('page-load');
}); 
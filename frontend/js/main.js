// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
        });
    });
}

// Form submission handler
// ========== FORM SUBMISSION WITH BACKEND API ==========

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Add source page information
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        data.sourcePage = currentPage;
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Send to backend API
            const response = await fetch('http://localhost:5001/api/contact/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                alert(`Thank you ${data.firstName}! Your message has been sent successfully. You should receive a confirmation email shortly.`);
                
                // Reset form
                this.reset();
                
                // Optionally redirect to thank you page
                // window.location.href = 'thank-you.html';
            } else {
                alert(`Error: ${result.message || 'Failed to send message. Please try again.'}`);
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Network error. Please check your connection and try again.');
            
            // Fallback: Show what would be sent (for demo/debugging)
            console.log('Form data:', data);
            alert(`Demo Mode: In a live site, this would send:\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nBusiness: ${data.businessName}`);
            
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== SERVICE SPECIFIC FORMS ==========

// Handle forms on service detail pages
document.querySelectorAll('form.service-form').forEach(form => {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const serviceName = this.closest('.page').id.replace('-page', '') || 'service';
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        data.serviceInterest = serviceName;
        data.sourcePage = window.location.pathname.split('/').pop();
        
        // Same submission logic as above
        try {
            const response = await fetch('http://localhost:5001/api/contact/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`Thank you for your interest in our ${serviceName} service! We'll contact you shortly.`);
                this.reset();
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            alert('Failed to submit. Please try again.');
            console.log('Service form data:', data);
        }
    });
});

// Newsletter subscription
const subscribeBtn = document.getElementById('subscribeBtn');
if (subscribeBtn) {
    subscribeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('newsletterEmail').value;
        if (email) {
            alert(`Thank you for subscribing with ${email}! You'll receive our next marketing tip.`);
            document.getElementById('newsletterEmail').value = '';
        } else {
            alert('Please enter your email address.');
        }
    });
}

// Set active navigation link based on current page
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setActiveNavLink();
    
    // Add animation to elements on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.service-card, .portfolio-item, .team-member');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial state for animation
    document.querySelectorAll('.service-card, .portfolio-item, .team-member').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Run on load and scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
});
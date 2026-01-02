// === ANALYTICS TRACKING ===
// Initialize tracking
function initAnalytics() {
    // Custom analytics tracking
    function trackEvent(category, action, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
        console.log(`Analytics Event: ${category} - ${action} - ${label}`);
    }

    // Track page views
    trackEvent('Page', 'View', window.location.pathname);

    // Track navigation clicks
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', () => {
            const section = link.getAttribute('href');
            trackEvent('Navigation', 'Section Click', section);
        });
    });

    // Track CV downloads
    document.getElementById('downloadCV').addEventListener('click', () => {
        trackEvent('Downloads', 'CV Download', 'Hero Section');
    });

    // Track form submissions
    document.getElementById('contactForm').addEventListener('submit', () => {
        trackEvent('Forms', 'Contact Form', 'Submission');
    });

    // Track voice command usage
    document.getElementById('voiceToggle').addEventListener('click', () => {
        trackEvent('Features', 'Voice Commands', 'Toggle');
    });

    // Track chatbot interactions
    document.getElementById('chatbotToggle').addEventListener('click', () => {
        trackEvent('Features', 'Chatbot', 'Toggle');
    });

    // Track time on page
    let pageStartTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
        trackEvent('Engagement', 'Time Spent', `${timeSpent} seconds`);
    });

    return trackEvent;
}

// === GLOBAL ERROR HANDLING ===
function initErrorHandling() {
    window.addEventListener('error', function(e) {
        console.error('Global Error:', e.error);
        
        // Send to analytics if available
        if (typeof trackEvent === 'function') {
            trackEvent('Errors', 'JavaScript Error', e.error.message);
        }
        
        // Display user-friendly error message for critical errors
        if (e.error.message.includes('critical')) {
            showToast('An error occurred. Please refresh the page.', 'error');
        }
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled Promise Rejection:', e.reason);
        
        if (typeof trackEvent === 'function') {
            trackEvent('Errors', 'Promise Rejection', e.reason.message || 'Unknown');
        }
    });
}

// === SERVICE WORKER REGISTRATION ===
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = '/service-worker.js';
            
            navigator.serviceWorker.register(swUrl)
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log('Service Worker update found!');
                        
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showToast('New version available! Refresh to update.', 'info');
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        });
    }
}

// === PWA INSTALLATION PROMPT ===
function initPWAInstall() {
    let deferredPrompt;
    const installButton = document.getElementById('pwaInstallBtn');
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Running in standalone mode');
        installButton.style.display = 'none';
    }
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button
        installButton.style.display = 'flex';
        
        installButton.addEventListener('click', async () => {
            installButton.style.display = 'none';
            deferredPrompt.prompt();
            
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted PWA installation');
                if (typeof trackEvent === 'function') {
                    trackEvent('PWA', 'Installation', 'Accepted');
                }
            } else {
                console.log('User dismissed PWA installation');
                if (typeof trackEvent === 'function') {
                    trackEvent('PWA', 'Installation', 'Dismissed');
                }
            }
            deferredPrompt = null;
        });
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        installButton.style.display = 'none';
        
        if (typeof trackEvent === 'function') {
            trackEvent('PWA', 'Installation', 'Completed');
        }
    });
}

// === LAZY LOADING IMAGES ===
function initLazyLoading() {
    const images = document.querySelectorAll('.lazy-load');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy-load');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    images.forEach(img => imageObserver.observe(img));

    // Handle image loading errors
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"><path fill="%23666" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
            this.alt = 'Image failed to load';
        });
    });
}

// === TOAST NOTIFICATION SYSTEM ===
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f56565' : type === 'success' ? '#48bb78' : '#4299e1'};
        color: white;
        padding: 15px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
    `;
    
    toast.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// === VISITOR COUNTER ===
function initVisitorCounter() {
    const visitorCountElement = document.getElementById('visitorCount');
    
    // Get current count from localStorage
    let count = localStorage.getItem('portfolioVisitors') || 0;
    count = parseInt(count) + 1;
    localStorage.setItem('portfolioVisitors', count);
    
    // Animate the counter
    let current = 0;
    const increment = Math.ceil(count / 50);
    const timer = setInterval(() => {
        current += increment;
        if (current >= count) {
            current = count;
            clearInterval(timer);
        }
        visitorCountElement.textContent = current.toLocaleString();
    }, 30);
    
    // Track unique visitors
    if (!localStorage.getItem('visitorId')) {
        const visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
        
        // Send to analytics
        if (typeof trackEvent === 'function') {
            trackEvent('Visitors', 'Unique Visitor', visitorId);
        }
    }
}

// === CONTACT FORM WITH FORMSPREE ===
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoading = document.getElementById('submitLoading');
    const formSuccess = document.getElementById('formSuccess');
    
    // Form validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    function hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        errorElement.classList.remove('show');
    }
    
    // Real-time validation
    document.querySelectorAll('#contactForm input, #contactForm textarea').forEach(input => {
        input.addEventListener('input', function() {
            const errorId = this.id + 'Error';
            hideError(errorId);
        });
    });
    
    // Form submission
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Reset errors
        hideError('nameError');
        hideError('emailError');
        hideError('subjectError');
        hideError('messageError');
        
        // Validate form
        let isValid = true;
        
        if (!name) {
            showError('nameError', 'Please enter your name');
            isValid = false;
        }
        
        if (!email || !validateEmail(email)) {
            showError('emailError', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!subject) {
            showError('subjectError', 'Please enter a subject');
            isValid = false;
        }
        
        if (!message || message.length < 10) {
            showError('messageError', 'Please enter at least 10 characters');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading state
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline-block';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        try {
            // Using Formspree free tier
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('subject', subject);
            formData.append('message', message);
            formData.append('_replyto', email);
            
            const response = await fetch('https://formspree.io/f/xbjndwze', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success
                contactForm.reset();
                formSuccess.classList.add('show');
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    formSuccess.classList.remove('show');
                }, 5000);
                
                showToast('Message sent successfully!', 'success');
                
                // Track successful submission
                if (typeof trackEvent === 'function') {
                    trackEvent('Forms', 'Contact Form', 'Success');
                }
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showToast('Failed to send message. Please try again or email directly.', 'error');
            
            // Track failed submission
            if (typeof trackEvent === 'function') {
                trackEvent('Forms', 'Contact Form', 'Error');
            }
        } finally {
            // Reset button state
            submitText.style.display = 'inline';
            submitLoading.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
}

// === CV DOWNLOAD FUNCTION ===
function initCVDownload() {
    document.getElementById('downloadCV').addEventListener('click', async function() {
        const btn = this;
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        btn.disabled = true;
        
        try {
            // Create a sample CV content
            const cvContent = `
                HUZAIFA YOUSAF
                Software Engineer
                
                CONTACT INFORMATION
                Email: huzaifayousaf96@gmail.com
                Phone: +92 327 7464813
                Location: Vehari, Pakistan
                Portfolio: https://huzaifayousaf.com
                
                SUMMARY
                Aspiring Software Engineer with expertise in modern web technologies, 
                AI integration, and interactive user experiences. Strong problem-solving 
                skills and passion for creating innovative solutions.
                
                TECHNICAL SKILLS
                • Frontend: HTML5, CSS3, JavaScript (ES6+), React.js, Responsive Design
                • Backend: Python, Node.js, Express.js, REST APIs
                • Databases: MongoDB, PostgreSQL, Firebase
                • Tools: Git, GitHub, Docker, VS Code, Figma
                • Concepts: OOP, Data Structures, Algorithms, Agile/Scrum
                
                EXPERIENCE
                Dispatcher and DEO at PD (2024 – Present)
                • Coordinated live dispatch operations
                • Improved team/client communication workflows
                • Managed administrative tasks and order updates
                
                Intern AI Raza Graphics (2022 – 2023)
                • Provided graphics and IT support services
                • Managed social media strategies
                • Implemented Corel Suite designs
                
                Home Tutor (2023 – Present)
                • Assisted students with academic subjects
                • Developed customized learning plans
                • Enhanced student engagement and performance
                
                EDUCATION
                Bachelor of Information Technology (2023 – 2027)
                Bahauddin Zakariya University (BZU)
                
                Intermediate Education (2020 – 2023)
                Leads Group of Colleges
                
                PROJECTS
                • E-Commerce Platform – Full-featured online store
                • Task Management App – Productivity application
                • Weather Dashboard – Real-time weather application
                • Interactive Portfolio – This website with AI features
                
                CERTIFICATIONS
                • Web Development Bootcamp Certification
                • Python Programming Certification
                • Responsive Web Design Certification
                
                LANGUAGES
                • English (Fluent)
                • Urdu (Native)
                • Punjabi (Native)
            `;
            
            // Create and download file
            const blob = new Blob([cvContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Huzaifa_Yousaf_CV.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('CV downloaded successfully!', 'success');
            
            // Track download
            if (typeof trackEvent === 'function') {
                trackEvent('Downloads', 'CV Download', 'Completed');
            }
        } catch (error) {
            console.error('Download error:', error);
            showToast('Failed to download CV. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// === PERFORMANCE MONITORING ===
function initPerformanceMonitoring() {
    // Measure page load time
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Page loaded in ${loadTime.toFixed(0)}ms`);
        
        // Send to analytics
        if (typeof trackEvent === 'function') {
            trackEvent('Performance', 'Page Load', `${loadTime.toFixed(0)}ms`);
        }
        
        // Check Core Web Vitals (simulated)
        setTimeout(() => {
            const lcp = performance.getEntriesByType('largest-contentful-paint');
            const fid = performance.getEntriesByType('first-input');
            const cls = performance.getEntriesByType('layout-shift');
            
            if (lcp.length > 0) {
                console.log('LCP:', lcp[0].startTime);
                if (typeof trackEvent === 'function') {
                    trackEvent('Performance', 'LCP', `${lcp[0].startTime.toFixed(0)}ms`);
                }
            }
        }, 1000);
    });
    
    // Monitor memory usage
    if ('memory' in performance) {
        setInterval(() => {
            console.log('Memory usage:', performance.memory);
        }, 60000);
    }
}

// === EXISTING FEATURE FUNCTIONS ===
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    function setTheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        const icon = themeToggle.querySelector('i');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
    }

    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
        setTheme(savedTheme === 'dark');
    } else {
        setTheme(prefersDark.matches);
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        setTheme(!isDark);
        if (typeof trackEvent === 'function') {
            trackEvent('Preferences', 'Theme Toggle', !isDark ? 'dark' : 'light');
        }
    });

    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('portfolio-theme')) {
            setTheme(e.matches);
        }
    });
}

function initVoiceCommands() {
    const voiceToggle = document.getElementById('voiceToggle');
    const voiceIndicator = document.getElementById('voiceIndicator');
    const startVoiceDemo = document.getElementById('startVoiceDemo');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceToggle.style.display = 'none';
        startVoiceDemo.style.display = 'none';
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    function showVoiceIndicator() {
        voiceIndicator.style.display = 'block';
        setTimeout(() => {
            voiceIndicator.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                voiceIndicator.style.display = 'none';
                voiceIndicator.style.animation = '';
            }, 300);
        }, 3000);
    }

    function handleVoiceCommand(command) {
        command = command.toLowerCase();
        
        const commands = {
            'home|start': () => scrollToSection('home'),
            'about|skills': () => scrollToSection('skills'),
            'project|work': () => scrollToSection('projects'),
            'contact|hire': () => scrollToSection('contact'),
            'dark|night': () => document.getElementById('themeToggle').click(),
            'light|day': () => document.getElementById('themeToggle').click(),
            'chat|assistant': () => document.getElementById('chatbotToggle').click(),
            'download|cv|resume': () => document.getElementById('downloadCV').click(),
            'help|what can you do': () => speakResponse("I can navigate sections, change themes, open chatbot, download CV, and more.")
        };

        for (const [keywords, action] of Object.entries(commands)) {
            if (keywords.split('|').some(keyword => command.includes(keyword))) {
                action();
                if (typeof trackEvent === 'function') {
                    trackEvent('Voice', 'Command', command);
                }
                return;
            }
        }

        speakResponse("I heard: " + command + ". Try saying 'go to projects'");
    }

    function speakResponse(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.1;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }
    }

    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        handleVoiceCommand(command);
        voiceToggle.classList.remove('listening');
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        voiceToggle.classList.remove('listening');
    };

    recognition.onend = () => {
        voiceToggle.classList.remove('listening');
    };

    voiceToggle.addEventListener('click', () => {
        if (voiceToggle.classList.contains('listening')) {
            recognition.stop();
        } else {
            recognition.start();
            voiceToggle.classList.add('listening');
            showVoiceIndicator();
        }
    });

    startVoiceDemo.addEventListener('click', () => {
        speakResponse("Voice commands activated. Try saying 'go to projects'");
        recognition.start();
        voiceToggle.classList.add('listening');
        showVoiceIndicator();
    });
}

function initTypingEffect() {
    const typedText = document.getElementById('typedText');
    const strings = [
        "Software Engineer",
        "Web Developer",
        "Python Programmer",
        "Problem Solver",
        "Tech Enthusiast"
    ];

    let currentString = 0;
    let currentChar = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const text = strings[currentString];
        
        if (isDeleting) {
            typedText.textContent = text.substring(0, currentChar - 1);
            currentChar--;
            typingSpeed = 50;
        } else {
            typedText.textContent = text.substring(0, currentChar + 1);
            currentChar++;
            typingSpeed = 100;
        }

        if (!isDeleting && currentChar === text.length) {
            isDeleting = true;
            typingSpeed = 1500;
        } else if (isDeleting && currentChar === 0) {
            isDeleting = false;
            currentString = (currentString + 1) % strings.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
}

function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.dataset.width + '%';
                entry.target.style.width = width;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => observer.observe(bar));
}

function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            projectCards.forEach(card => {
                const categories = card.dataset.category.split(' ');
                
                if (filter === 'all' || categories.includes(filter)) {
                    card.classList.remove('hidden');
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.classList.add('hidden');
                    }, 300);
                }
            });
            
            if (typeof trackEvent === 'function') {
                trackEvent('Projects', 'Filter', filter);
            }
        });
    });
}

function initChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChat = document.getElementById('closeChat');
    const sendButton = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    const responses = {
        hello: "Hello! I'm your AI assistant. How can I help you learn about Huzaifa?",
        hi: "Hi there! Ask me about skills, projects, or experience.",
        skills: "Huzaifa's skills include: HTML/CSS (95%), JavaScript (85%), Python (80%), React (75%), and more!",
        projects: "Check out the Projects section! He has built an E-commerce platform, Task Management app, and Weather Dashboard.",
        experience: "Huzaifa has experience as a Dispatcher (2024-2026), Graphics Intern (2022-2023), and Home Tutor (2023-2026).",
        education: "He's pursuing BIT at Bahauddin Zakariya University (2023-2027) and completed Intermediate at Leads College.",
        contact: "You can reach Huzaifa at huzaifayousaf96@gmail.com or +92 327 7464813.",
        cv: "Click the Download CV button in the hero section to get his resume.",
        help: "I can tell you about skills, projects, experience, education, and contact info. Just ask!",
        default: "I'm not sure about that. Try asking about skills, projects, or experience!"
    };

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getResponse(input) {
        input = input.toLowerCase().trim();
        
        for (const [keyword, response] of Object.entries(responses)) {
            if (input.includes(keyword)) {
                return response;
            }
        }
        
        return responses.default;
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatInput.value = '';

        setTimeout(() => {
            const response = getResponse(message);
            addMessage(response, 'bot');
            
            if (typeof trackEvent === 'function') {
                trackEvent('Chatbot', 'Message Sent', message.substring(0, 50));
            }
        }, 1000);
    }

    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.toggle('active');
    });

    closeChat.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });

    sendButton.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    if (!localStorage.getItem('chatbotSeen')) {
        setTimeout(() => {
            chatbotWindow.classList.add('active');
            localStorage.setItem('chatbotSeen', 'true');
        }, 5000);
    }
}

function initBackToTop() {
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.style.display = 'flex';
        } else {
            backToTop.style.display = 'none';
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof trackEvent === 'function') {
            trackEvent('Navigation', 'Back to Top', 'Clicked');
        }
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

function initParticleBackground() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 100;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = `rgba(66, 153, 225, ${Math.random() * 0.5})`;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
        resizeCanvas();
        particles.length = 0;
        initParticles();
    });
}

// === CORS PROXY FOR APIS ===
function fetchWithCors(url) {
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
    return fetch(CORS_PROXY + url)
        .then(response => response.json())
        .catch(error => {
            console.error('CORS fetch error:', error);
            return null;
        });
}

// === OFFLINE DETECTION ===
function initOfflineDetection() {
    window.addEventListener('online', () => {
        showToast('You are back online!', 'success');
    });

    window.addEventListener('offline', () => {
        showToast('You are offline. Some features may not work.', 'warning');
    });
}

// === BROWSER COMPATIBILITY CHECKS ===
function checkBrowserCompatibility() {
    const features = {
        serviceWorker: 'serviceWorker' in navigator,
        speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        speechSynthesis: 'speechSynthesis' in window,
        intersectionObserver: 'IntersectionObserver' in window,
        webGL: (() => {
            try {
                return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('webgl');
            } catch (e) {
                return false;
            }
        })()
    };

    console.log('Browser compatibility:', features);

    // Warn about missing features
    if (!features.serviceWorker) {
        console.warn('Service Workers not supported - PWA features disabled');
    }
    if (!features.speechRecognition) {
        document.getElementById('voiceToggle').style.display = 'none';
        document.getElementById('startVoiceDemo').style.display = 'none';
    }
}

// === INITIALIZE ALL FEATURES ===
document.addEventListener('DOMContentLoaded', function() {
    // Initialize analytics first
    const trackEvent = initAnalytics();
    
    // Initialize other features
    initErrorHandling();
    registerServiceWorker();
    initPWAInstall();
    initLazyLoading();
    initVisitorCounter();
    initContactForm();
    initCVDownload();
    initPerformanceMonitoring();
    
    // Initialize existing features from previous code
    initThemeToggle();
    initVoiceCommands();
    initTypingEffect();
    initSkillBars();
    initProjectFilters();
    initChatbot();
    initBackToTop();
    initScrollAnimations();
    initParticleBackground();
    
    // Initialize offline detection
    initOfflineDetection();
    
    // Check browser compatibility
    checkBrowserCompatibility();
    
    console.log('All features initialized successfully');
});
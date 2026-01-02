const CACHE_NAME = 'huzaifa-portfolio-v2.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/assets/images/profile.jpg',
  '/assets/images/project1.jpg',
  '/assets/images/project2.jpg',
  '/assets/images/project3.jpg',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/typed.js@2.0.12',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.0/build/qrcode.min.js'
];

// Network-first strategy for dynamic content
const networkFirstUrls = [
  'https://formspree.io/f/',
  'https://api.github.com/'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event with multiple strategies
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Check if URL should use network-first strategy
  const shouldUseNetworkFirst = networkFirstUrls.some(url => 
    event.request.url.startsWith(url)
  );
  
  if (shouldUseNetworkFirst) {
    // Network-first strategy for API calls
    event.respondWith(networkFirstStrategy(event.request));
  } else {
    // Cache-first strategy for static assets
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, update cache
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, return offline page
    return caches.match('/');
  }
}

// Cache-first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached response
    return cachedResponse;
  }
  
  try {
    // Try network
    const networkResponse = await fetch(request);
    
    // Cache the new response
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return offline page
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    throw error;
  }
}

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'submit-contact-form') {
    event.waitUntil(submitPendingForms());
  }
});

async function submitPendingForms() {
  const pendingForms = await getPendingForms();
  
  for (const form of pendingForms) {
    try {
      await submitForm(form);
      await removePendingForm(form.id);
      console.log('Background sync: Form submitted successfully');
    } catch (error) {
      console.error('Background sync: Form submission failed:', error);
    }
  }
}

// Helper functions for background sync
async function getPendingForms() {
  // Implement form data storage (using IndexedDB in real implementation)
  return [];
}

async function submitForm(formData) {
  // Implement form submission logic
  return fetch('https://formspree.io/f/xbjndwze', {
    method: 'POST',
    body: JSON.stringify(formData),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

async function removePendingForm(formId) {
  // Implement form removal logic
}
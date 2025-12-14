/* static/main.js (module) - working baseline (NO email / whatsapp) */

/* Optional Firebase imports left as no-op if not used (kept safe) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

window.firebase = { initializeApp, getAuth, signInAnonymously, onAuthStateChanged, getFirestore };
setLogLevel('Debug');

/* ---------- PRODUCTS ---------- */
const PRODUCTS = {
  'student-gown-black': {
    key: 'student-gown-black',
    name: 'Standard Student Gown',
    category: 'Student Gowns',
    price: '1500.00',
    designer: 'True Designs Exclusive',
    currency: 'Rs.',
    images: ['/static/images/products/student-gown-1.jpg','/static/images/products/student-gown-2.jpg','/static/images/products/student-gown-3.jpg'],
    description: 'A classic black graduation gown suitable for all students. Comes with a matching cap and tassel.',
    rentalOptions: { durations: ['3 Days','5 Days'], sizes: ['XS','S','M','L','XL'] },
    keywords: ['student','gown','black','graduation','academic']
  },
  'guest-gown-blue': {
    key: 'guest-gown-blue',
    name: 'Blue Guest Gown',
    category: 'Guest Gowns',
    price: '1800.00',
    designer: 'Elegant Wear',
    currency: 'Rs.',
    images: ['/static/images/products/guest-gown-1.jpg'],
    description: 'A stylish blue gown for guests and attendees.',
    rentalOptions: { durations: ['3 Days','5 Days'], sizes: ['M','L','XL'] },
    keywords: ['guest','gown','blue','ceremony']
  },
  'faculty-gown-red': {
    key: 'faculty-gown-red',
    name: 'Red Faculty Gown',
    category: 'Faculty Gowns',
    price: '2500.00',
    designer: 'Prestigious Attire',
    currency: 'Rs.',
    images: ['/static/images/products/faculty-gown-1.jpg'],
    description: 'A traditional red faculty gown.',
    rentalOptions: { durations: ['3 Days'], sizes: ['M','L'] },
    keywords: ['faculty','gown','red']
  },
  'kids-gown-standard': {
    key: 'kids-gown-standard',
    name: 'Standard Kids Gown',
    category: 'Kids Gowns',
    price: '1000.00',
    designer: 'True Designs Kids',
    currency: 'Rs.',
    images: ['/static/images/products/kids-gown-1.jpg'],
    description: 'Comfortable and cute graduation gown for kids.',
    rentalOptions: { durations: ['3 Days','5 Days'], sizes: ['XS','S','M'] },
    keywords: ['kids','gown','children']
  },
  'customised-shawl-1': {
    key: 'customised-shawl-1',
    name: 'Customised Shawl',
    category: 'Customised Shawls',
    price: '800.00',
    designer: 'True Designs Exclusive',
    currency: 'Rs.',
    images: ['/static/images/products/stoles.jpg'],
    description: 'Personalised shawl for convocation ceremonies.',
    rentalOptions: { durations: ['3 Days'], sizes: ['Free Size'] },
    keywords: ['shawl','customised']
  },
  'framed-certificate-1': {
    key: 'framed-certificate-1',
    name: 'Framed Certificate with Medal Set',
    category: 'Framed Certificate with Medals',
    price: '1200.00',
    designer: 'True Designs',
    currency: 'Rs.',
    images: ['/static/images/products/framed-certificate-1.jpg'],
    description: 'Beautifully framed certificate with medals.',
    rentalOptions: { durations: ['Permanent Purchase'] },
    keywords: ['certificate','medal']
  },
  'convocation-file-1': {
    key: 'convocation-file-1',
    name: 'Convocation File',
    category: 'Convocation Files',
    price: '500.00',
    designer: 'True Designs Stationery',
    currency: 'Rs.',
    images: ['/static/images/products/convocation-file-1.jpg'],
    description: 'Premium convocation file with branding.',
    rentalOptions: { durations: ['Permanent Purchase'] },
    keywords: ['file','convocation']
  }
};

/* ---------- CATEGORY MAP ---------- */
const CATEGORY_MAP = {
  'student-gowns': { title: 'Student Gowns', productKeys: ['student-gown-black'] },
  'guest-gowns': { title: 'Guest Gowns', productKeys: ['guest-gown-blue'] },
  'faculty-gowns': { title: 'Faculty Gowns', productKeys: ['faculty-gown-red'] },
  'kids-gowns': { title: 'Kids Gowns', productKeys: ['kids-gown-standard'] },
  'customised-shawls': { title: 'Customised Shawls', productKeys: ['customised-shawl-1'] },
  'framed-certificate': { title: 'Framed Certificate with Medals', productKeys: ['framed-certificate-1'] },
  'convocation-files': { title: 'Convocation Files', productKeys: ['convocation-file-1'] },
  'gowns': { title: 'All Gowns', productKeys: ['student-gown-black','guest-gown-blue','faculty-gown-red','kids-gown-standard'] },
  'default': { title: 'Product Listing', productKeys: Object.keys(PRODUCTS) }
};

/* ---------- CART STATE ---------- */
let cartItems = [];

/* ---------- UTIL ---------- */
function getProductByKey(key) { return PRODUCTS[key] || null; }

/* ---------- RENDER FUNCTIONS ---------- */
function renderCart() {
  const list = document.getElementById('cart-items-list');
  const countSpan = document.getElementById('cart-count');
  const totalSpan = document.getElementById('cart-total-amount');
  if (!list || !countSpan || !totalSpan) return;

  let total = 0;
  countSpan.textContent = cartItems.length;

  if (cartItems.length === 0) {
    list.innerHTML = '<p class="text-center text-gray-500 mt-10">Your bag is empty. Start renting!</p>';
    totalSpan.textContent = 'Rs. 0.00';
    return;
  }

  const itemsHtml = cartItems.map((item, index) => {
    const product = getProductByKey(item.productKey);
    if (!product) return '';
    const price = parseFloat(product.price || 0);
    total += price;
    return `
      <div class="flex space-x-4 border-b pb-4">
       <img src="${product.images[0]}"
     class="w-full h-full object-cover object-center"
     alt="${product.name}">

        <div class="flex-grow">
          <p class="font-semibold text-sm">${product.name}</p>
          <p class="text-xs text-gray-600">Size: ${item.size} | Duration: ${item.duration}</p>
          <p class="text-sm font-medium mt-1">${product.currency} ${price.toFixed(2)}</p>
          <div class="flex space-x-2 mt-2">
            <button onclick="removeItemFromCart(${index})" class="text-red-500 text-xs hover:underline">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  list.innerHTML = itemsHtml;
  totalSpan.textContent = `${cartItems[0]?.currency || 'Rs.'} ${total.toFixed(2)}`;
}

function addItemToCart(productKey, size, duration, startDate) {
  const product = getProductByKey(productKey);
  if (!product) { console.error("Product not found:", productKey); return; }
  cartItems.push({ productKey, size, duration, startDate, timestamp: Date.now() });
  renderCart();
  document.getElementById('cart-overlay')?.classList.add('is-active');
}

function removeItemFromCart(index) {
  cartItems.splice(index, 1);
  renderCart();
}
window.removeItemFromCart = removeItemFromCart;

function checkoutViaWhatsApp() {
  if (cartItems.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  let message = "Hello True Designs 👋%0A";
  message += "I would like to rent the following items:%0A%0A";

  let total = 0;

  cartItems.forEach((item, index) => {
    const product = PRODUCTS[item.productKey];
    if (!product) return;

    const price = parseFloat(product.price || 0);
    total += price;

    message += `${index + 1}. ${product.name}%0A`;
    message += `   Size: ${item.size}%0A`;
    message += `   Duration: ${item.duration}%0A`;
    message += `   Start Date: ${item.startDate}%0A`;
    message += `   Price: Rs. ${price.toFixed(2)}%0A%0A`;
  });

  message += `Total: Rs. ${total.toFixed(2)}%0A%0A`;
  message += "Please confirm availability. Thank you! 😊";

  const phoneNumber = "919745845989";
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;

  window.open(whatsappURL, "_blank");
}
window.checkoutViaWhatsApp = checkoutViaWhatsApp;

/* ---------- CATEGORY / PRODUCT RENDERS ---------- */
function renderCategoryPage(categoryKey) {
  categoryKey = (categoryKey || 'default').trim();
  const categoryData = CATEGORY_MAP[categoryKey] || CATEGORY_MAP['default'];
  const title = categoryData.title;
  const productCards = categoryData.productKeys.map(key => {
    const product = PRODUCTS[key];
    if (!product) return '';
    const formattedPrice = parseFloat(product.price || 0).toFixed(2);
    return `
      <div class="text-center">
        <a href="#product/${product.key}" class="block group">
          <div class="relative overflow-hidden rounded-lg aspect-[3/4]">
            <img src="${product.images[0]}"
     class="w-full h-full object-contain bg-white object-center"
     alt="${product.name}">

          </div>
          <p class="text-sm font-semibold mt-2">${product.name}</p>
          <p class="text-xs text-gray-700">${product.currency} ${formattedPrice}</p>
          <p class="text-xs text-gray-500">${product.designer}</p>
        </a>
      </div>
    `;
  }).join('');

  const gridClass = categoryData.productKeys.length === 1 ? 'grid grid-cols-1 gap-6 md:gap-8 justify-items-start' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8';

  return `
    <section class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-10">
        <h2 class="section-title text-4xl">${title}</h2>
        <div class="text-sm text-gray-500"><a href="#home" class="hover:underline">Home</a> &gt; <span>${title}</span></div>
      </div>

      <div class="flex justify-end space-x-4 mb-10">
        <button class="text-sm font-medium uppercase tracking-wider border border-gray-300 py-2 px-4 rounded-lg">Filter Products</button>
        <select class="text-sm font-medium uppercase tracking-wider border border-gray-300 py-2 px-4 rounded-lg">
          <option>Sort by: All</option>
        </select>
      </div>

      <div class="${gridClass}">
        ${productCards}
      </div>
    </section>
  `;
}

function renderProductPage(productKey) {
  const product = PRODUCTS[productKey];
  if (!product) {
    return `<section class="py-20 text-center"><h2>Product Not Found</h2><p>The requested product is unavailable.</p></section>`;
  }

  const images = Array.isArray(product.images) && product.images.length ? product.images : ['/static/images/products/placeholder.jpg'];
  const imagesHtml = images.map((img, index) => `
  <img src="${img}"
       data-index="${index}"
       class="w-full h-full object-contain bg-white absolute top-0 left-0 transition-opacity duration-500 ${index === 0 ? '' : 'opacity-0'}"
       alt="${product.name} image ${index + 1}">
`).join('');

 
  const formattedPrice = parseFloat(product.price || 0).toFixed(2);
  const relatedProducts = Object.values(PRODUCTS).filter(p => p.category === product.category && p.key !== product.key).slice(0,3);
  const relatedHtml = relatedProducts.map(p => `
    <div class="text-center">
      <a href="#product/${p.key}" class="block group">
        <div class="relative overflow-hidden rounded-lg aspect-[3/4]">
          <img src="${p.images[0] || '/static/images/products/placeholder.jpg'}" class="w-full h-full object-cover object-center" alt="${p.name}">
        </div>
        <p class="text-sm font-semibold mt-2">${p.name}</p>
        <p class="text-xs text-gray-700">${p.currency} ${parseFloat(p.price||0).toFixed(2)}</p>
      </a>
    </div>
  `).join('');

  return `
    <section class="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-sm text-gray-500 mb-8">
        <a href="#home" class="hover:underline">Home</a> &gt; <a href="#category/${product.category.toLowerCase().replace(/\s+/g,'-')}">${product.category}</a> &gt; <span>${product.name}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div id="product-image-container" class="relative overflow-hidden rounded-lg aspect-[3/4] shadow-lg">
          ${imagesHtml}
          <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            ${images.map((_,i) => `<div class="thumbnail-dot h-1 w-6 rounded-full ${i===0 ? 'bg-white' : 'bg-gray-400 opacity-50'}"></div>`).join('')}
          </div>
          ${images.length>1 ? `<button id="prev-image" class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/50 p-2 rounded-full">‹</button><button id="next-image" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/50 p-2 rounded-full">›</button>` : ''}
        </div>

        <div>
          <p class="text-sm uppercase tracking-widest text-gray-500 mb-1">${product.designer}</p>
          <h1 class="text-4xl font-bold tracking-tight mb-4">${product.name}</h1>

          <div class="mb-6">
            <p class="text-xl font-semibold">Rent: ${product.currency} ${formattedPrice}</p>
          </div>

          <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div>
              <label class="block text-xs uppercase tracking-widest text-gray-500 mb-1">Rental Duration</label>
              <select id="rental-duration" class="border border-gray-300 rounded-lg p-2 w-full md:w-40">${(product.rentalOptions?.durations || ['3 Days']).map(d=>`<option value="${d}">${d}</option>`).join('')}</select>
            </div>
            <div>
              <label class="block text-xs uppercase tracking-widest text-gray-500 mb-1">Size</label>
              <select id="rental-size" class="border border-gray-300 rounded-lg p-2 w-full md:w-40">${(product.rentalOptions?.sizes || ['One Size']).map(s=>`<option value="${s}">${s}</option>`).join('')}</select>
            </div>
          </div>

          <div class="mb-8">
            <label class="block text-xs uppercase tracking-widest text-gray-500 mb-1">Start Date</label>
            <input type="date" id="start-date" class="border border-gray-300 rounded-lg p-2 w-full">
          </div>

          <button id="add-to-bag-btn" class="w-full bg-black text-white font-medium text-sm tracking-widest py-3 px-6 rounded-lg shadow-lg hover:bg-gray-800 transition duration-300 uppercase">Add To Bag</button>

          <div class="mt-8 border-t border-gray-200 pt-6">
            <h3 class="text-lg font-bold mb-2">Description and Material Care</h3>
            <p class="text-gray-600 text-sm">${product.description}</p>
          </div>
        </div>
      </div>

      <div class="mt-20 border-t border-gray-200 pt-10">
        <h3 class="text-2xl font-bold uppercase tracking-wider mb-8">Related Products</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">${relatedHtml}</div>
      </div>
    </section>
  `;
}

/* ---------- ROUTING / RENDER PAGE ---------- */
function renderPage(route = '') {
  const contentDiv = document.getElementById('app-content');
  const homeContainer = document.getElementById('home-content-container');
  window.scrollTo(0,0);
  route = (route || '').trim();
  if (!route) route = 'home';
  const parts = route.split('/');
  const routeType = parts[0] || '';
  const routeKey = parts.slice(1).join('/') || '';

  // show/hide
  if (routeType === 'home' || routeType === '') {
    homeContainer.classList.remove('hidden');
    contentDiv.classList.add('hidden');
  } else {
    homeContainer.classList.add('hidden');
    contentDiv.classList.remove('hidden');
  }

  // loader
  contentDiv.innerHTML = `<div class="py-40 flex justify-center"><div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div></div>`;

  let content = '';
  switch (routeType) {
    case 'blog':
      content = renderBlogPage();
      break;
    case 'cause':
      if (routeKey === 'about') content = renderAboutForCausePage();
      else if (routeKey === 'gowns') content = renderContactUsPage();
      else content = `<section class="py-20 text-center"><h2 class="section-title text-4xl mb-4">Rent for a Cause</h2><p class="text-gray-600">Content coming soon</p></section>`;
      break;
    case 'category': {
      const catKey = routeKey || 'default';
      if (!CATEGORY_MAP[catKey]) content = renderCategoryPage('default');
      else content = renderCategoryPage(catKey);
      break;
    }
    case 'product':
      content = renderProductPage(routeKey);
      break;
    case 'profile':
      content = renderProfilePage();
      break;
    default:
      content = `<section class="py-20 text-center"><h2 class="section-title text-4xl mb-4">${(routeType || 'Page').charAt(0).toUpperCase() + (routeType || 'page').slice(1)}</h2><p class="text-gray-600">Content coming soon</p></section>`;
      break;
  }

  setTimeout(() => {
    contentDiv.innerHTML = content;
    if (routeType === 'product' && routeKey) initProductPageWiring(routeKey);
  }, 100);
}

/* ---------- PRODUCT PAGE WIRING ---------- */
function initProductPageWiring(productKey) {
  const product = PRODUCTS[productKey];
  if (!product) return;
  let currentImageIndex = 0;
  const container = document.getElementById('product-image-container');
  const addToBagBtn = document.getElementById('add-to-bag-btn');

  if (addToBagBtn) {
    addToBagBtn.onclick = () => {
      const durationSelect = document.getElementById('rental-duration');
      const sizeSelect = document.getElementById('rental-size');
      const startDateInput = document.getElementById('start-date');

      if (!durationSelect?.value || !sizeSelect?.value || !startDateInput?.value) {
        alert("Please select duration, size, and start date.");
        return;
      }

      addItemToCart(productKey, sizeSelect.value, durationSelect.value, startDateInput.value);
    };
  }

  if (!container) return;
  const imageElements = container.querySelectorAll('img');
  const thumbnailDots = container.querySelectorAll('.thumbnail-dot');

  const updateThumbnails = (index) => {
    thumbnailDots.forEach((dot,i) => {
      if (i===index) { dot.classList.remove('bg-gray-400','opacity-50'); dot.classList.add('bg-white'); }
      else { dot.classList.add('bg-gray-400','opacity-50'); dot.classList.remove('bg-white'); }
    });
  };

  const cycleImages = (direction) => {
    if (imageElements.length === 0) return;
    imageElements[currentImageIndex].classList.add('opacity-0');
    if (direction === 'next') currentImageIndex = (currentImageIndex + 1) % imageElements.length;
    else currentImageIndex = (currentImageIndex - 1 + imageElements.length) % imageElements.length;
    imageElements[currentImageIndex].classList.remove('opacity-0');
    updateThumbnails(currentImageIndex);
  };

  container.querySelector('#prev-image')?.addEventListener('click', () => cycleImages('prev'));
  container.querySelector('#next-image')?.addEventListener('click', () => cycleImages('next'));
}

/* ---------- SEARCH ---------- */
function performSearch(query) {
  const resultsDiv = document.getElementById('search-results');
  if (!query || query.length < 2) {
    resultsDiv.innerHTML = '<p class="text-gray-500 text-center col-span-full mt-10">Start typing to see product suggestions.</p>';
    return;
  }
  const lowerQuery = query.toLowerCase();
  const matchingProducts = Object.values(PRODUCTS).filter(product => {
    if (product.name.toLowerCase().includes(lowerQuery)) return true;
    if (product.category.toLowerCase().includes(lowerQuery)) return true;
    if (product.keywords && product.keywords.some(k => k.includes(lowerQuery))) return true;
    return false;
  }).slice(0,12);

  if (matchingProducts.length === 0) {
    resultsDiv.innerHTML = `<p class="text-gray-500 text-center col-span-full mt-10">No results found for "${query}".</p>`;
    return;
  }

  const resultHtml = matchingProducts.map(product => `
    <a href="#product/${product.key}" class="block group p-2 rounded-lg hover:bg-gray-50 transition duration-300" onclick="document.getElementById('search-overlay')?.classList.remove('is-active')">
      <div class="relative overflow-hidden rounded-lg aspect-[3/4]">
        <img src="${product.images[0]}" class="w-full h-full object-cover object-center" alt="${product.name}">
      </div>
      <p class="text-sm font-semibold mt-2">${product.name}</p>
      <p class="text-xs text-gray-700">${product.currency} ${parseFloat(product.price||0).toFixed(2)}</p>
    </a>
  `).join('');

  resultsDiv.innerHTML = resultHtml;
}

/* ---------- FRAGMENT PAGES ---------- */
function renderAboutForCausePage() {
  return `
    <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div class="relative h-96 w-full rounded-lg overflow-hidden">
        <img src="https://placehold.co/960x600/b13b4e/ffffff?text=RENT+FOR+A+CAUSE" class="w-full h-full object-cover" alt="Rent For A Cause">
        <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h2 class="section-title text-white">RENT FOR A CAUSE</h2>
        </div>
      </div>
      <div class="bg-purple-200 text-center p-6 rounded-lg">
        <h2 class="text-3xl font-bold">About Our Cause</h2>
        <p class="text-gray-600">We believe fashion can make a difference.</p>
      </div>
    </section>
  `;
}

function renderContactUsPage() {
  return `
    <section class="py-20 max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="section-title text-center mb-10">Contact Us</h2>
      <div class="bg-gray-50 p-6 rounded-lg shadow-md space-y-4">
        <h3 class="text-xl font-bold tracking-tight">True Designs</h3>
        <p><strong>Address:</strong> Pallipuram, Thiruvananthapuram, Kerala 695584, India</p>
        <p><strong>Store Timings:</strong> 10 AM – 7 PM (Monday to Saturday)</p>
        <p><strong>Mobile No:</strong> +91 9745845989</p>
        <p><strong>Email:</strong> <a href="mailto:truedesignstvm@gmail.com" class="text-blue-600 hover:underline">truedesignstvm@gmail.com</a></p>
        <div class="mt-8 pt-4 border-t border-gray-200">
          <h3 class="text-sm font-bold uppercase mb-2">Locate Us</h3>
          <div class="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-inner">
            <iframe src="https://www.google.com/maps?q=True+Designs,+Pallipuram,+Kerala+695584,+India&output=embed"
                    class="absolute top-0 left-0 w-full h-full" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderBlogPage() {
  return `
    <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row gap-10">
        <div class="lg:w-1/2 bg-gray-100 p-10 rounded-lg">
          <h2 class="section-title text-center mb-6">The True Designs Blog</h2>
          <p class="text-gray-600">The latest in graduation wear from True Designs.</p>
        </div>
        <div class="lg:w-1/2 relative">
          <img src="https://placehold.co/700x700/60a5fa/ffffff?text=Quality+Is+A+Habit" class="w-full h-full object-cover rounded-lg" alt="Quality and Designers">
        </div>
      </div>
    </section>
  `;
}

function renderProfilePage() {
  const currentUserId = window.firebaseAuthUserId || 'Not Authenticated (fallback)';
  return `
    <section class="py-20 max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="section-title text-center mb-10">My Profile</h2>
      <div class="bg-gray-50 p-6 rounded-lg shadow-md space-y-4">
        <p class="text-sm"><strong>Status:</strong> Logged in as Canvas User</p>
        <p class="text-sm break-all"><strong>User ID:</strong> ${currentUserId}</p>
      </div>
    </section>
  `;
}

/* ---------- INITIALIZATION ---------- */
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('hashchange', () => {
    const route = window.location.hash.substring(1) || 'home';
    renderPage(route);
  });

  // closeAuthModal stub (safe)
  function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('is-active');
  }
  window.closeAuthModal = closeAuthModal;

  // modal/controls wiring
  const openSearchBtn = document.getElementById('open-search-btn');
  const closeSearchBtn = document.getElementById('close-search-btn');
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');

  openSearchBtn?.addEventListener('click', () => {
    searchOverlay?.classList.add('is-active');
    searchInput?.focus();
    document.getElementById('search-results').innerHTML = '<p class="text-gray-500 text-center col-span-full mt-10">Start typing to see product suggestions.</p>';
  });
  closeSearchBtn?.addEventListener('click', () => {
    searchOverlay?.classList.remove('is-active');
    if (searchInput) searchInput.value = '';
  });
  searchInput?.addEventListener('input', (e) => performSearch(e.target.value));

  const openAuthBtn = document.getElementById('open-auth-modal');
  const closeAuthModalBtn = document.getElementById('close-auth-modal');
  const authModal = document.getElementById('auth-modal');

  openAuthBtn?.addEventListener('click', () => {
    authModal?.classList.add('is-active');
  });
  closeAuthModalBtn?.addEventListener('click', closeAuthModal);

  const openCartBtn = document.getElementById('open-cart-modal');
  const closeCartModalBtn = document.getElementById('close-cart-modal');
  const cartModal = document.getElementById('cart-overlay');
  const addMoreBtn = document.getElementById('add-more-items-btn');

  openCartBtn?.addEventListener('click', () => { renderCart(); cartModal?.classList.add('is-active'); });
  closeCartModalBtn?.addEventListener('click', () => cartModal?.classList.remove('is-active'));
  addMoreBtn?.addEventListener('click', () => { cartModal?.classList.remove('is-active'); window.location.hash='category/student-gowns'; });

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  mobileMenuBtn?.addEventListener('click', () => { mobileMenu?.classList.toggle('hidden'); mobileMenu?.classList.toggle('translate-x-full'); });

  initFirebase();

  renderCart();
  renderPage(window.location.hash.substring(1) || 'home');
});

/* ---------- FIREBASE INIT (safe/no-op if not used) ---------- */
let auth, db;
async function initFirebase() {
  try {
    const firebaseConfig = {};
    const app = window.firebase.initializeApp(firebaseConfig);
    db = window.firebase.getFirestore ? window.firebase.getFirestore(app) : null;
    auth = window.firebase.getAuth ? window.firebase.getAuth(app) : null;
    if (auth) {
      try { await window.firebase.signInAnonymously(auth); } catch(e){ /* ignore */ }
      window.firebaseAuthUserId = auth.currentUser?.uid || null;
    }
  } catch (err) {
    console.warn('Firebase init skipped or failed:', err);
  }
}

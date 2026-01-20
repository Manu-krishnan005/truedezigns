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
    designer: 'True Designs Exclusive',
    images: ['/static/images/products/student-gown-1.jpg','/static/images/products/student-gown-2.jpg','/static/images/products/student-gown-3.jpg','/static/images/products/student-gown-4.jpg','/static/images/products/student-gown-5.jpg'],
    description: 'A classic black graduation gown suitable for all students. Comes with a matching cap and tassel.',
    rentalOptions: { durations: ['3 Days','5 Days'], sizes: ['XS','S','M','L','XL'] },
    keywords: ['student','gown','black','graduation','academic']
  },
  'guest-gown': {
    key: 'guest-gown',
    name: 'Guest Gown',
    category: 'Guest Gowns',
    designer: 'Elegant Wear',
    images: ['/static/images/products/guest-gown-1.jpg',
             '/static/images/products/guest-gown-2.jpg',
              '/static/images/products/guest-gown-3.jpg'
    ],
    description: 'A stylish blue gown for guests and attendees.',
    rentalOptions: { durations: ['3 Days','5 Days'], sizes: ['M','L','XL'] },
    keywords: ['guest','gown','ceremony']
  },
  'faculty-gown': {
    key: 'faculty-gown',
    name: 'Faculty Gown',
    category: 'Faculty Gowns',
    designer: 'Prestigious Attire',
    images: ['/static/images/products/faculty-gown-1.jpg',
             '/static/images/products/faculty-gown-2.jpg',
             '/static/images/products/faculty-gown-3.jpg',
             '/static/images/products/faculty-gown-4.jpg'
    ],
    description: 'A traditional red faculty gown.',
    rentalOptions: { durations: ['3 Days'], sizes: ['M','L'] },
    keywords: ['faculty','gown']
  },
  'kids-gown-standard': {
    key: 'kids-gown-standard',
    name: 'Standard Kids Gown',
    category: 'Kids Gowns',
    designer: 'True Designs Kids',
    images: ['/static/images/products/kids-gown-1.jpg'],
    description: 'Comfortable and cute graduation gown for kids.',
    rentalOptions: { durations: ['3 Days','5 Days'], sizes: ['XS','S','M'] },
    keywords: ['kids','gown','children']
  },

  'phd-gown-black': {
  key: 'phd-gown-black',
  name: 'Standard PhD Gown',
  category: 'PhD Gowns',
  designer: 'True Designs Prestige',
  images: ['/static/images/products/phd-gown-1.jpg','/static/images/products/phd-gown-2.jpg'],
  description: 'Premium PhD graduation gown designed for doctoral ceremonies with elegant detailing.',
  rentalOptions: {
    durations: ['3 Days', '5 Days'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  keywords: ['phd', 'doctoral', 'gown', 'graduation']
  },

  'customised-Hoodies-1': {
    key: 'customised-Hoodies-1',
    name: 'Customised Hoodies',
    category: 'Customised Hoodies',
    designer: 'True Dezigns Exclusive',
    images: [
  '/static/images/products/stoles.jpg',
  '/static/images/products/stoles-2.jpg',
  '/static/images/products/stoles-3.jpg',
  '/static/images/products/stoles-4.jpg',
  '/static/images/products/stoles-5.jpg'
],

    description: 'Personalised Hoodies for convocation ceremonies.',
    rentalOptions: { durations: ['3 Days'], sizes: ['Free Size'] },
    keywords: ['Hoodies','customised']
  },
  'framed-certificate-1': {
    key: 'framed-certificate-1',
    name: 'Framed Certificate with Medal Set',
    category: 'Framed Certificates',
    designer: 'True Designs',
    images: ['/static/images/products/framed-certificate-1.jpg',
        '/static/images/products/framed-certificate-2.jpg',
        '/static/images/products/framed-certificate-3.jpg'
    ],
    description: 'Beautifully framed certificate with medals.',
    rentalOptions: { durations: ['Permanent Purchase'] },
    keywords: ['certificate','medal']
  },
  'convocation-file-1': {
    key: 'convocation-file-1',
    name: 'Convocation File',
    category: 'Convocation Files',
    designer: 'True Designs Stationery',
    images: ['/static/images/products/convocation-file-1.jpg'],
    description: 'Premium convocation file with branding.',
    rentalOptions: { durations: ['Permanent Purchase'] },
    keywords: ['file','convocation']
  }
};

/* ---------- CATEGORY MAP ---------- */
const CATEGORY_MAP = {
  'student-gowns': { title: 'Student Gowns', productKeys: ['student-gown-black'] },
  'guest-gowns': { title: 'Guest Gowns', productKeys: ['guest-gown'] },
  'faculty-gowns': { title: 'Faculty Gowns', productKeys: ['faculty-gown'] },
  'kids-gowns': { title: 'Kids Gowns', productKeys: ['kids-gown-standard'] },
  'phd-gowns': {title: 'PhD Gowns',productKeys: ['phd-gown-black']},
  'customised-Hoodies': { title: 'Customised Hoodies', productKeys: ['customised-Hoodies-1'] },
  'framed-certificates': { title: 'Framed Certificates', productKeys: ['framed-certificate-1'] },
  'convocation-files': { title: 'Convocation Files', productKeys: ['convocation-file-1'] },
  'gowns': { title: 'All Gowns', productKeys: ['student-gown-black','guest-gown','faculty-gown','kids-gown-standard','phd-gown-black'] },
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
  if (!list || !countSpan) return;

  countSpan.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);


  if (cartItems.length === 0) {
    list.innerHTML =
      '<p class="text-center text-gray-500 mt-10">Your bag is empty. Start renting!</p>';
    return;
  }

  list.innerHTML = cartItems.map((item, index) => {
    const product = getProductByKey(item.productKey);
    if (!product) return '';

   return `
  <div class="flex space-x-4 border-b pb-4">
    <img src="${product.images[0]}"
         class="w-20 h-24 object-contain bg-white rounded"
         alt="${product.name}">

    <div class="flex-grow">
      <p class="font-semibold text-sm">${product.name}</p>
      <p class="text-xs text-gray-600">
        Size: ${item.size} | Duration: ${item.duration}
      </p>

      <div class="flex items-center space-x-3 mt-2">
        <button onclick="decreaseQuantity(${index})"
                class="border px-2 rounded text-sm">−</button>

        <span class="text-sm font-medium">${item.quantity}</span>

        <button onclick="increaseQuantity(${index})"
                class="border px-2 rounded text-sm">+</button>

        <button onclick="removeItemFromCart(${index})"
                class="text-red-500 text-xs ml-3 hover:underline">
          Remove
        </button>
      </div>
    </div>
  </div>
`;

  }).join('');
}


function addItemToCart(productKey, size, duration, startDate) {
  const product = getProductByKey(productKey);
  if (!product) { console.error("Product not found:", productKey); return; }
  cartItems.push({
  productKey,
  size,
  duration,
  startDate,
  quantity: 1,
  timestamp: Date.now()
});

  renderCart();
  document.getElementById('cart-overlay')?.classList.add('is-active');
}
window.addItemToCart = addItemToCart;

function removeItemFromCart(index) {
  cartItems.splice(index, 1);
  renderCart();
}
window.removeItemFromCart = removeItemFromCart;

function increaseQuantity(index) {
  cartItems[index].quantity += 1;
  renderCart();
}

function decreaseQuantity(index) {
  if (cartItems[index].quantity > 1) {
    cartItems[index].quantity -= 1;
    renderCart();
  }
}

/* expose for onclick */
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;

function checkoutViaWhatsApp() {
  if (cartItems.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  let message = "Hello True Dezigns 👋%0A";
  message += "I would like to rent the following items:%0A%0A";

  cartItems.forEach((item, index) => {
    const product = PRODUCTS[item.productKey];
    if (!product) return;

    message += `${index + 1}. ${product.name}%0A`;
    message += `   Size: ${item.size}%0A`;
    message += `   Duration: ${item.duration}%0A`;
    message += `   Start Date: ${item.startDate}%0A`;
    message += `   Quantity: ${item.quantity}%0A%0A`;
  });

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
  <div class="text-center gown-card">
  <a href="#product/${product.key}" class="block group">
    <div class="relative overflow-hidden rounded-lg h-[260px] md:h-[320px] bg-white flex items-center justify-center">
      <img src="${product.images[0]}"
           class="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
           alt="${product.name}">
    </div>

          <p class="text-sm font-semibold mt-2">${product.name}</p>
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
        <div id="product-image-container"
     class="relative overflow-hidden rounded-lg shadow-lg h-[480px]">

  <div class="product-image-carousel">
    <div class="product-slide-track">
      ${images.map(img => `
        <img src="${img}" class="product-slide-img" alt="${product.name}">
      `).join('')}
    </div>
  </div>

</div>



        <div>
          <p class="text-sm uppercase tracking-widest text-gray-500 mb-1">${product.designer}</p>
          <h1 class="text-4xl font-bold tracking-tight mb-4">${product.name}</h1>

          <div class="mb-6">
            
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

    case 'legal':
  if (routeKey === 'terms') {
    content = renderTermsAndConditionsPage();
  } else if (routeKey === 'privacy') {
    content = renderPrivacyPolicyPage();
  } else {
    content = `<section class="py-20 text-center">
      <h2 class="section-title text-4xl mb-4">Legal</h2>
      <p class="text-gray-600">Content coming soon</p>
    </section>`;
  }
  break;


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

  if (routeType === 'product' && routeKey) {
  initProductPageWiring(routeKey);
  initProductImageCarousel();
}

  if (routeType === 'blog') {
  initCollegeImageCarousels();
}

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
  <a
  href="#"
  onclick="navigateFromSearch(event, '${product.key}')"
  class="block group p-2 rounded-lg hover:bg-gray-50 transition duration-300"
>


    <div class="relative overflow-hidden rounded-lg aspect-[3/4]">
      <img src="${product.images[0]}" class="w-full h-full object-cover object-center" alt="${product.name}">
    </div>
    <p class="text-sm font-semibold mt-2">${product.name}</p>
    <p class="text-xs text-gray-500">${product.designer}</p>
  </a>
`).join('');

  resultsDiv.innerHTML = resultHtml;
}


/* ---------- FRAGMENT PAGES ---------- */
function renderAboutForCausePage() {
  return `
    <section class="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

      <h1 class="text-4xl font-bold tracking-tight text-center">
        Rent for a Cause
      </h1>

      <article class="prose prose-lg max-w-none mx-auto text-gray-800">
        <p>
          Graduation is a milestone — a moment of pride, achievement, and new beginnings.
          Yet behind the celebration lies a silent issue: wasteful fashion consumption.
        </p>

        <p>
          At <strong>True Dezigns</strong>, we believe that celebrating success doesn’t have
          to come at the cost of our planet. This belief gave rise to
          <strong>Rent for a Cause</strong>.
        </p>

        <h2>The Problem with One-Time Fashion</h2>
        <p>
          Graduation gowns are often worn once and forgotten. This contributes to
          unnecessary textile waste and environmental harm.
        </p>

        <h2>A Smarter Way to Celebrate</h2>
        <p>
          Renting gowns reduces waste, extends garment life, and promotes
          sustainable fashion without sacrificing elegance.
        </p>

        <blockquote>
          Celebrate your achievement. Honor the planet.
        </blockquote>

        <p>
          Every rental is a step toward a more responsible future.
        </p>
      </article>

      <div class="text-center">
        <a href="https://medium.com/@manukrishnankess/rent-for-a-cause-how-fashion-can-make-a-difference-158b8439ac4a"
           target="_blank"
           class="inline-block bg-black text-white px-6 py-3 rounded-lg uppercase tracking-wider text-sm hover:bg-gray-800 transition">
          Read Full Article on Medium
        </a>
      </div>

    </section>
  `;
}

function renderTermsAndConditionsPage() {
  return `
    <section class="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

      <h1 class="text-4xl font-bold tracking-tight text-center">
        Terms & Conditions
      </h1>

      <p class="text-sm text-gray-500 text-center">
        Last updated: ${new Date().getFullYear()}
      </p>

      <article class="prose prose-lg max-w-none text-gray-800">

        <h2>1. Introduction</h2>
        <p>
          Welcome to <strong>True Dezigns</strong>. By accessing or using our website,
          products, or services, you agree to comply with and be bound by these
          Terms & Conditions.
        </p>

        <h2>2. Services</h2>
        <p>
          True Dezigns provides rental and purchase services for graduation gowns,
          ceremonial attire, and related accessories. All services are subject
          to availability and confirmation.
        </p>

        <h2>3. Rental Policy</h2>
        <p>
          Rental items must be returned in the condition in which they were provided.
          Any damage, loss, or delay in return may result in additional charges.
        </p>

        <h2>4. Orders & Payments</h2>
        <p>
          Orders are confirmed only after successful communication and agreement
          via our official channels. Prices and rental durations are subject to change
          without prior notice.
        </p>

        <h2>5. Cancellations & Refunds</h2>
        <p>
          Cancellation requests must be made in advance. Refund eligibility depends
          on the stage of order processing and is decided at the discretion of
          True Dezigns.
        </p>

        <h2>6. Usage Restrictions</h2>
        <p>
          Users must not misuse our website or services. Any unlawful activity,
          including but not limited to fraud or misuse of content, is strictly prohibited.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          All content, designs, logos, and images on this website are the intellectual
          property of True Dezigns and may not be reused without written permission.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          True Dezigns shall not be liable for any indirect, incidental, or consequential
          damages arising from the use of our services.
        </p>

        <h2>9. Modifications</h2>
        <p>
          We reserve the right to modify these Terms & Conditions at any time.
          Continued use of our services constitutes acceptance of the updated terms.
        </p>

        <h2>10. Contact Information</h2>
        <p>
          For any questions regarding these Terms & Conditions, please contact us at
          <strong>truedesignstvm@gmail.com</strong>.
        </p>

      </article>
    </section>
  `;
}

function renderPrivacyPolicyPage() {
  return `
    <section class="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

      <h1 class="text-4xl font-bold tracking-tight text-center">
        Privacy Policy
      </h1>

      <p class="text-sm text-gray-500 text-center">
        Last updated: ${new Date().getFullYear()}
      </p>

      <article class="prose prose-lg max-w-none text-gray-800">

        <h2>1. Introduction</h2>
        <p>
          At <strong>True Dezigns</strong>, we respect your privacy and are committed
          to protecting the personal information you share with us.
        </p>

        <h2>2. Information We Collect</h2>
        <p>
          We may collect personal information such as your name, email address,
          phone number, and order details when you interact with our website
          or services.
        </p>

        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To process rental or purchase inquiries</li>
          <li>To communicate order-related information</li>
          <li>To improve our products and services</li>
          <li>To provide customer support</li>
        </ul>

        <h2>4. Data Protection</h2>
        <p>
          We implement appropriate security measures to protect your personal
          data from unauthorized access, disclosure, or misuse.
        </p>

        <h2>5. Third-Party Services</h2>
        <p>
          We may use trusted third-party services (such as payment processors
          or communication platforms) solely to support our operations.
          These parties are obligated to protect your information.
        </p>

        <h2>6. Cookies</h2>
        <p>
          Our website may use cookies to enhance user experience and analyze
          website performance. You may disable cookies in your browser settings
          if you prefer.
        </p>

        <h2>7. User Rights</h2>
        <p>
          You have the right to request access, correction, or deletion of your
          personal data by contacting us.
        </p>

        <h2>8. Policy Updates</h2>
        <p>
          This Privacy Policy may be updated periodically. Any changes will be
          reflected on this page.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions regarding this Privacy Policy, please contact us at
          <strong>truedesignstvm@gmail.com</strong>.
        </p>

      </article>
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

function collegeCard(name, logo, images, description) {
  const slides = images.map(img => `
    <img src="${img}" class="college-slide-img" alt="${name} event">
  `).join('');

  return `
    <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">

      <!-- Sliding Image Carousel -->
      <div class="college-image-carousel">
        <div class="college-slide-track">
          ${slides}
        </div>
      </div>

      <div class="p-6 text-center">
        <img src="${logo}"
             class="college-logo h-14 mx-auto mb-4 object-contain"
             alt="${name} logo">

        <h3 class="text-lg font-bold mb-2">${name}</h3>
        <p class="text-sm text-gray-600">${description}</p>
      </div>
    </div>
  `;
}




function renderBlogPage() {
  return `
    <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <div class="text-center mb-16">
        <h2 class="section-title text-4xl mb-4">Our College Collaborations</h2>
        <p class="text-gray-600">
          Trusted by leading institutions for graduation & convocation ceremonies
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

        <!-- College Card -->
        ${collegeCard(
  'Co Operative School of Law Thodupuzha',
  'static/images/colleges/Co Operative School of Law Thodupuzha-logo.jpg',
  [
    'static/images/colleges/Co Operative School of Law Thodupuzha-event-1.jpg',
    'static/images/colleges/Co Operative School of Law Thodupuzha-event-2.jpg',
    'static/images/colleges/Co Operative School of Law Thodupuzha-event-3.jpg',
    'static/images/colleges/Co Operative School of Law Thodupuzha-event-4.jpg',
    'static/images/colleges/Co Operative School of Law Thodupuzha-event-5.jpg'
  ],
  'PhD & Faculty Convocation Ceremony'
)}

${collegeCard(
  'Mohandas College of Engineering and Technology',
  'static/images/colleges/mohandas college of engineering and technology-logo.jpg',
  [
    'static/images/colleges/mohandas college of engineering and technology-event-1.jpg',
    'static/images/colleges/mohandas college of engineering and technology-event-2.jpg',
    'static/images/colleges/mohandas college of engineering and technology-event-3.jpg',
    'static/images/colleges/mohandas college of engineering and technology-event-4.jpg',
    'static/images/colleges/mohandas college of engineering and technology-event-5.jpg'
  ],
  'Graduation Day – Student Gowns'
)}

${collegeCard(
  'College of Pharmacy Kannur Medical College',
  'static/images/colleges/college of pharmacy kannur medical college-logo.jpg',
  [
    'static/images/colleges/college of pharmacy kannur medical college-event-1.jpg',
    'static/images/colleges/college of pharmacy kannur medical college-event-2.jpg',
    'static/images/colleges/college of pharmacy kannur medical college-event-3.jpg',
    'static/images/colleges/college of pharmacy kannur medical college-event-4.jpg',
    'static/images/colleges/college of pharmacy kannur medical college-event-5.jpg'
  ],
  'Annual Convocation Ceremony'
)}


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

function initProductImageCarousel() {
  const track = document.querySelector('.product-slide-track');
  if (!track) return;

  const slides = track.children;
  if (slides.length <= 1) return;

  let index = 0;

  setInterval(() => {
    index = (index + 1) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
  }, 2500); // matches your video feel
}


function navigateFromSearch(event, productKey) {
  event.preventDefault();

  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');

  // Close search overlay
  if (searchOverlay) {
    searchOverlay.classList.remove('is-active');
    searchOverlay.classList.add('hidden');
  }

  // Clear input
  if (searchInput) {
    searchInput.value = '';
  }

  window.location.hash = `product/${productKey}`;
}
window.navigateFromSearch = navigateFromSearch;


/* ---------- INITIALIZATION ---------- */
document.addEventListener('DOMContentLoaded', () => {

  const route = window.location.hash.substring(1) || 'home';
  renderPage(route); // ✅ RUN ON INITIAL LOAD

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

function initCollegeImageCarousels() {
  const carousels = document.querySelectorAll('.college-image-carousel');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.college-slide-track');
    const slides = track.children;
    let index = 0;

    if (slides.length <= 1) return;

    // 🎯 Random interval per card (2.5s to 6s)
    const randomInterval =
      Math.floor(Math.random() * (6000 - 2500 + 1)) + 2500;

    setInterval(() => {
      index = (index + 1) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
    }, randomInterval);
  });
}



"use strict"
const apiUrl = {
    login: '/login',
    addUser: '/addUser',
    getInventory: '/getInventory',
};
document.addEventListener('DOMContentLoaded', () => {
    // Load Navigation Component
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        axios.get('/admin/nav')
            .then(response => {
                navPlaceholder.innerHTML = response.data;

                const logoutBtn = document.getElementById("logoutBtn");

                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                console.log(currentUser, "currentUser");
                if (currentUser && logoutBtn) {
                    logoutBtn.style.display = "block";
                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('currentUser');
                    });
                } else {
                    if (logoutBtn) logoutBtn.style.display = "none";
                }
            })
            .catch(err => console.error('Error loading nav:', err));
    }

    // Load Website Navigation Component
    const navBuykartPlaceholder = document.getElementById('nav_buykart-placeholder');
    if (navBuykartPlaceholder) {
        axios.get('/buykart/nav')
            .then(response => {
                navBuykartPlaceholder.innerHTML = response.data;

                const logoutBtn = document.getElementById("logoutBtn");
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));

                if (currentUser && logoutBtn) {
                    logoutBtn.style.display = "block";
                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('currentUser');
                        window.location.reload();
                    });
                } else if (logoutBtn) {
                    logoutBtn.style.display = "none";
                }
            })
            .catch(err => console.error('Error loading buykart nav:', err));
    }

    // Inject Loader and Alert Modal if not present
    if (!document.getElementById('loader')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="loader" class="fixed inset-0 z-[10000] hidden flex justify-center items-center" style="background-color: rgba(0,0,0,0.5);">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            </div>
        `);
    }

    if (!document.getElementById('alertModal')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="alertModal" class="fixed inset-0 z-[10001] hidden flex justify-center items-center px-4" style="background-color: rgba(0,0,0,0.5);">
                <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
                    <div id="alertIcon" class="mb-4 flex justify-center"></div>
                    <h3 id="alertTitle" class="text-xl font-bold mb-2 text-gray-800"></h3>
                    <p id="alertMessage" class="text-gray-600 mb-6"></p>
                    <button onclick="closeAlert()" class="btn btn-primary w-full py-2 rounded-lg">OK</button>
                </div>
            </div>
        `);
    }

    // Load Inventory if Product Grid exists (Buykart Page)
    if (document.getElementById('product-grid')) {
        getProductData();
    }

    // Load Cart Page Logic
    if (document.getElementById('cart-container')) {
        renderCartPage();
    }
});

// Login Function
async function loginPage(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        openAlert('Error', 'Please enter both username and password')
        return;
    }

    try {
        const response = await axios.post(apiUrl.login, { username, password });
        const currentUser = response.data.user;
        console.log(currentUser, "currentUser");
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = '/home';
    } catch (error) {
        console.error("Login error:", error);
        openAlert('error', error.response?.data?.message || "Something went wrong. Please try again.")
    }
}

function newUserPage() {
    window.location.href = "/user";
}

let globalProductMap = {}; // Store products for easy access

function getProductData() {
    axios.get(apiUrl.getInventory)
        .then(response => {
            const products = response.data.inventory || response.data;
            const productGrid = document.getElementById('product-grid');
            
            // Populate global map
            products.forEach(p => globalProductMap[p.id] = p);
            
            if (!productGrid) return;

            if (!products || products.length === 0) {
                productGrid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10">No products available at the moment.</div>';
                return;
            }

            const cart = getCart();

            let cardsHtml = '';
            products.forEach(product => {
                const cartItem = cart[product.id];
                const qty = cartItem ? cartItem.quantity : 0;

                cardsHtml += `
                    <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden border border-gray-100 group flex flex-col h-full">
                        <div class="relative h-48 overflow-hidden bg-gray-50">
                            <img src="/public/img/${product.image}" alt="${product.itemName}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                            <div class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-primary shadow-sm">
                                ${product.category}
                            </div>
                        </div>
                        <div class="p-4 flex flex-col flex-grow">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-bold text-gray-800 truncate flex-1 pr-2" title="${product.itemName}">${product.itemName}</h3>
                                <span class="text-primary font-bold">₹${product.price}</span>
                            </div>
                            <p class="text-gray-500 text-sm mb-4 line-clamp-2 h-10">${product.description || ''}</p>
                            <div class="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                                <div id="btn-container-${product.id}" class="w-full">${generateButtonHtml(product.id, qty)}</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            productGrid.innerHTML = cardsHtml;
        })
        .catch(error => {
            console.error('Error fetching inventory:', error);
            const productGrid = document.getElementById('product-grid');
            if(productGrid) productGrid.innerHTML = '<div class="col-span-full text-center text-red-500 py-10">Failed to load products. Please try again later.</div>';
        });
}

function generateButtonHtml(id, qty) {
    if (qty > 0) {
        return `
            <div class="flex items-center justify-between bg-primary-lightest rounded-lg p-1 w-full">
                <button onclick="updateQuantity('${id}', -1)" class="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-primary hover:bg-gray-50 transition">-</button>
                <span class="font-bold text-primary">${qty}</span>
                <button onclick="updateQuantity('${id}', 1)" class="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-primary hover:bg-gray-50 transition">+</button>
            </div>
        `;
    } else {
        return `
            <button onclick="addToCart('${id}')" class="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-light transition shadow-sm flex items-center justify-center gap-2">
                <span class="material-icons text-sm">add_shopping_cart</span> Add to Cart
            </button>
        `;
    }
}

function getCart() {
    return JSON.parse(localStorage.getItem('buykart_cart')) || {};
}

function saveCart(cart) {
    localStorage.setItem('buykart_cart', JSON.stringify(cart));
}

function addToCart(id) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        openAlert('error', 'Please login to add items to the cart.');
        return;
    }

    const cart = getCart();
    const product = globalProductMap[id];

    if (product) {
        cart[id] = { ...product, quantity: 1 };
        saveCart(cart);
        
        // Update UI
        const btnContainer = document.getElementById(`btn-container-${id}`);
        if (btnContainer) {
            btnContainer.innerHTML = generateButtonHtml(id, 1);
        }
    }
}

function updateQuantity(id, change) {
    const cart = getCart();
    if (cart[id]) {
        cart[id].quantity += change;
        
        if (cart[id].quantity <= 0) {
            delete cart[id];
        }
        
        saveCart(cart);

        // Update UI on Product Grid
        const btnContainer = document.getElementById(`btn-container-${id}`);
        if (btnContainer) {
            btnContainer.innerHTML = generateButtonHtml(id, cart[id] ? cart[id].quantity : 0);
        }

        // Update UI on Cart Page if active
        if (document.getElementById('cart-container')) {
            renderCartPage();
        }
    }
}

function renderCartPage() {
    const cart = getCart();
    const container = document.getElementById('cart-container');
    const totalEl = document.getElementById('cart-total');
    
    if (!container) return;

    const items = Object.values(cart);
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <span class="material-icons text-gray-300 text-6xl mb-4">shopping_cart_off</span>
                <p class="text-gray-500 text-lg">Your cart is empty.</p>
                <a href="/buykart" class="text-primary font-bold hover:underline mt-2 inline-block">Start Shopping</a>
            </div>`;
        if(totalEl) totalEl.innerText = '₹0';
        return;
    }

    let html = '';
    let total = 0;

    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm mb-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden">
                        <img src="/public/img/${item.image}" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800">${item.itemName}</h3>
                        <p class="text-sm text-gray-500">₹${item.price} / ${item.unit}</p>
                    </div>
                </div>
                <div class="flex items-center gap-6">
                    <div class="flex items-center bg-gray-50 rounded-lg p-1">
                        <button onclick="updateQuantity('${item.id}', -1)" class="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-primary transition">-</button>
                        <span class="w-8 text-center font-bold text-gray-800">${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', 1)" class="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-primary transition">+</button>
                    </div>
                    <div class="text-right min-w-[80px]">
                        <p class="font-bold text-primary">₹${itemTotal}</p>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    if(totalEl) totalEl.innerText = `₹${total}`;
}

function openAlert(type, message) {
    const modal = document.getElementById('alertModal');
    const title = document.getElementById('alertTitle');
    const msg = document.getElementById('alertMessage');
    const icon = document.getElementById('alertIcon');

    if (type === 'success') {
        title.textContent = 'Success';
        icon.innerHTML = '<span class="material-icons text-green-500 text-5xl">check_circle</span>';
    } else {
        title.textContent = 'Error';
        icon.innerHTML = '<span class="material-icons text-red-500 text-5xl">error</span>';
    }

    msg.textContent = message;
    modal.classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('alertModal').classList.add('hidden');
}

// Axios Interceptors to handle Loader
if (typeof axios !== 'undefined') {
    axios.interceptors.request.use(function (config) {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.remove('hidden');
        return config;
    }, function (error) {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
        return Promise.reject(error);
    });

    axios.interceptors.response.use(function (response) {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
        return response;
    }, function (error) {
        const loader = document.getElementById('loader');
        if (loader) loader.classList.add('hidden');
        return Promise.reject(error);
    });
}
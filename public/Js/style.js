"use strict"
const apiUrl = {
    login: '/login',
    addUser: '/addUser',
    getInventory: '/getInventory', // GET
    addInventory: '/addInventory', // POST (FormData)
    updateInventory: '/updateInventory', // PUT (FormData) /:id
    deleteInventory: '/deleteInventory', // DELETE /:id
    checkout: '/checkout', // POST
    getOrders: '/getOrders', // GET
    getUsers: '/getUsers', // GET
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
                        window.location.href = '/';
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
    
                // Get all account-related buttons for desktop and mobile
                const logoutBtn = document.getElementById("logoutBtn");
                const loginBtn = document.getElementById("loginBtn");
                const logoutBtnMobile = document.getElementById("logoutBtnMobile");
                const loginBtnMobile = document.getElementById("loginBtnMobile");
    
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
                const handleLogout = (e) => {
                    e.preventDefault();
                    localStorage.removeItem('currentUser');
                    window.location.href = '/';
                };
    
                if (currentUser) {
                    // --- Logged IN State ---
                    if (loginBtn) loginBtn.style.display = 'none';
                    if (loginBtnMobile) loginBtnMobile.style.display = 'none';
                    
                    if (logoutBtn) {
                        logoutBtn.style.display = 'flex';
                        logoutBtn.addEventListener('click', handleLogout);
                    }
                    if (logoutBtnMobile) {
                        logoutBtnMobile.style.display = 'flex';
                        logoutBtnMobile.addEventListener('click', handleLogout);
                    }
                } else {
                    // --- Logged OUT State ---
                    if (logoutBtn) logoutBtn.style.display = 'none';
                    if (logoutBtnMobile) logoutBtnMobile.style.display = 'none';

                    if (loginBtn) loginBtn.style.display = 'flex';
                    if (loginBtnMobile) loginBtnMobile.style.display = 'flex';
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

    // Load Admin Dashboard Logic
    if (document.getElementById('main-dashboard')) {
        loadAdminDashboard();
    }

    // Load Admin Inventory Page Logic
    if (document.getElementById('inventory-table-body')) {
        loadInventoryAdmin();
    }

    // Load Admin Orders Page Logic
    if (document.getElementById('orders-table-body')) {
        loadOrdersAdmin();
    }

    // Load Admin Users Page Logic
    if (document.getElementById('users-table-body')) {
        loadUsersAdmin();
    }

    // Add event listener for Add Inventory Form
    const addInventoryForm = document.getElementById('addInventoryForm');
    if (addInventoryForm) {
        addInventoryForm.addEventListener('submit', addInventory);
    }

    // Add event listener for Edit Inventory Form
    const editInventoryForm = document.getElementById('editInventoryForm');
    if (editInventoryForm) {
        editInventoryForm.addEventListener('submit', updateInventory);
        // Handle closing the modal
        const closeButton = document.getElementById('closeEditModal');
        if(closeButton) closeButton.addEventListener('click', closeEditModal);
    }

    // Add event listener for Add User Form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', addUser);
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
        window.location.href = '/dashboard';
    } catch (error) {
        console.error("Login error details:", error.response || error);
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
            const products = response.data;
            const productGrid = document.getElementById('product-grid');
            
            // Populate global map for easy access in cart functions
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
                            <img src="${getProductImageUrl(product)}" alt="${product.itemName}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
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

/**
 * Generates the correct, full image URL for a product.
 * Handles local vs. remote images and normalizes local paths.
 * @param {object} product - The product object which contains an 'image' property.
 * @returns {string} The full, usable image URL.
 */
function getProductImageUrl(product) {
    if (!product || !product.image) return '/public/img/placeholder.png'; // Return a placeholder if no image
    if (product.image.startsWith('http')) return product.image; // It's already a full URL
    return `/public/img/inventory/${product.image.replace(/^inventory[\\/]/, '')}`; // Construct local path
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
        window.location.href = '/';
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
                        <img src="${getProductImageUrl(item)}" alt="${item.itemName}" class="w-full h-full object-cover">
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

// Checkout Function
async function checkout() {
    const cart = getCart();
    if (Object.keys(cart).length === 0) {
        openAlert('error', 'Your cart is empty.');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        openAlert('error', 'Please log in to proceed with checkout.');
        return;
    }

    try {
        // Send an API request to the backend /checkout route
        await axios.post(apiUrl.checkout, { 
            cart, 
            userId: currentUser.id,
            userName: currentUser.name
        });

        localStorage.removeItem('buykart_cart');
        openAlert('success', 'Order placed successfully! Thank you for shopping with Buykart.');
        // Re-render UI to reflect empty cart
        if (document.getElementById('cart-container')) {
            renderCartPage();
        }
    } catch (error) {
        console.error("Checkout error:", error.response || error);
        openAlert('error', error.response?.data?.message || "Checkout failed. Please try again.");
    }
}

// --- ADMIN & USER MANAGEMENT FUNCTIONS ---

function loadAdminDashboard() {
    // Use Promise.all to fetch multiple data points concurrently
    Promise.all([
        axios.get(apiUrl.getInventory),
        axios.get(apiUrl.getOrders),
        axios.get(apiUrl.getUsers)
    ]).then(([inventoryRes, ordersRes, usersRes]) => {
        // Handle Inventory Data
        const inventory = inventoryRes.data;
        const productCount = inventory.length;
        const productCountEl = document.getElementById('product-count');
        if (productCountEl) {
            productCountEl.textContent = productCount;
        }
        
        const totalValue = inventory.reduce((sum, item) => sum + (Number(item.price) * Number(item.op_stock)), 0);
        const totalValueEl = document.getElementById('total-value');
        if (totalValueEl) {
            totalValueEl.textContent = `₹${totalValue.toLocaleString('en-IN')}`;
        }

        // Handle Orders Data
        const orders = ordersRes.data;
        const orderCount = orders.length;
        const orderCountEl = document.getElementById('order-count');
        if (orderCountEl) {
            orderCountEl.textContent = orderCount;
        }

        // Handle Users Data
        const users = usersRes.data;
        const userCount = users.length;
        const userCountEl = document.getElementById('user-count');
        if (userCountEl) {
            userCountEl.textContent = userCount;
        }
        
        // Compile Combined Recent Activity
        const recentActivityEl = document.getElementById('recent-activity-list');
        if (recentActivityEl) {
            let activities = [];
            
            // Add orders to activity timeline
            orders.forEach(order => {
                activities.push({
                    type: 'order',
                    timestamp: new Date(order.createdAt).getTime(),
                    dateObj: new Date(order.createdAt),
                    data: order
                });
            });

            // Add users to activity timeline
            users.forEach(user => {
                if (user.createdAt) {
                    activities.push({
                        type: 'user',
                        timestamp: new Date(user.createdAt).getTime(),
                        dateObj: new Date(user.createdAt),
                        data: user
                    });
                }
            });

            // Sort descending (newest first) and get top 5
            activities.sort((a, b) => b.timestamp - a.timestamp);
            const recentActivities = activities.slice(0, 5);

            if (recentActivities.length === 0) {
                recentActivityEl.innerHTML = '<p class="text-gray-500 italic">No recent activity to show.</p>';
            } else {
                let activityHtml = '';
                recentActivities.forEach(activity => {
                    const activityDate = activity.dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    
                    if (activity.type === 'order') {
                        const order = activity.data;
                        const items = Object.values(order.items);
                        const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
                        
                        activityHtml += `
                            <div class="flex items-start gap-4">
                                <div class="bg-green-100 text-green-600 rounded-full p-2 mt-1">
                                    <span class="material-icons mi-sm">shopping_bag</span>
                                </div>
                                <div>
                                    <p class="text-gray-800 font-medium">New order placed by <span class="font-bold">${order.userName || 'Unknown'}</span></p>
                                    <p class="text-sm text-gray-500">Order No: <span class="font-mono uppercase">${order.id.substring(0, 8)}</span> • Total: <span class="font-bold text-gray-800">₹${totalAmount.toLocaleString('en-IN')}</span></p>
                                    <p class="text-xs text-gray-400 mt-1">${activityDate}</p>
                                </div>
                            </div>
                        `;
                    } else if (activity.type === 'user') {
                        const user = activity.data;
                        activityHtml += `
                            <div class="flex items-start gap-4">
                                <div class="bg-blue-100 text-blue-600 rounded-full p-2 mt-1">
                                    <span class="material-icons mi-sm">person_add</span>
                                </div>
                                <div>
                                    <p class="text-gray-800 font-medium">New user registered: <span class="font-bold">${user.name}</span></p>
                                    <p class="text-sm text-gray-500">User ID: <span class="font-mono uppercase">${user.id.substring(0, 8)}</span></p>
                                    <p class="text-xs text-gray-400 mt-1">${activityDate}</p>
                                </div>
                            </div>
                        `;
                    }
                });
                recentActivityEl.innerHTML = activityHtml;
            }
        }

        // Render Sales Chart
        renderSalesChart(orders);

    }).catch(err => {
        console.error("Could not load dashboard stats", err);
        // Set all stats to N/A on failure
        ['product-count', 'total-value', 'order-count', 'user-count'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'N/A';
        });
    });
}

let salesChartInstance = null; // Keep track of chart instance to prevent duplicates

function renderSalesChart(orders) {
    const ctx = document.getElementById('salesChart');
    // Ensure Chart.js is loaded and the canvas element exists
    if (!ctx || typeof Chart === 'undefined') {
        console.log("Chart.js not ready or canvas not found.");
        return;
    };

    // Destroy existing chart if it exists to prevent "Canvas already in use" error
    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    // 1. Process data for the last 7 days
    const salesByDay = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Helper to safely format date to local YYYY-MM-DD
    const getLocalYYYYMMDD = (dateObj) => {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Initialize the last 7 days with 0 sales
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = getLocalYYYYMMDD(date);
        salesByDay[dateString] = 0;
    }

    // Populate sales data from orders
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        // Check if the order is within the last 7 days
        if (orderDate >= new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)) {
            const dateString = getLocalYYYYMMDD(orderDate);
            const totalAmount = Object.values(order.items).reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
            if (salesByDay.hasOwnProperty(dateString)) {
                salesByDay[dateString] += totalAmount;
            }
        }
    });

    const labels = Object.keys(salesByDay).map(dateStr => {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    });
    const data = Object.values(salesByDay);

    // 2. Render the chart
    salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales',
                data: data,
                borderColor: 'hsl(128, 63%, 21%)', // --color-primary
                backgroundColor: 'hsla(99, 53%, 86%, 0.5)', // --color-primary-lightest with opacity
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'hsl(128, 63%, 21%)',
                pointRadius: 4,
                pointHoverRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString('en-IN');
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `Sales: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y)}`
                    }
                }
            }
        }
    });
}

function loadOrdersAdmin() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">Loading orders...</td></tr>`;

    axios.get(apiUrl.getOrders)
        .then(response => {
            const orders = response.data;

            if (orders.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">No orders have been placed yet.</td></tr>`;
                return;
            }

            let rowsHtml = '';
            orders.forEach(order => {
                const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                const items = Object.values(order.items);
                const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

                rowsHtml += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-3 font-mono text-xs text-gray-500 uppercase" title="${order.id}">${order.id.substring(0, 8)}</td>
                        <td class="p-3 font-medium text-gray-800">${order.userName || 'Unknown'}</td>
                        <td class="p-3 text-gray-600">${orderDate}</td>
                        <td class="p-3 font-bold text-gray-800">₹${totalAmount.toLocaleString('en-IN')}</td>
                        <td class="p-3"><span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">${order.status}</span></td>
                        <td class="p-3 text-gray-600">${totalItems} item(s)</td>
                    </tr>
                `;
            });
            tableBody.innerHTML = rowsHtml;
        })
        .catch(error => {
            console.error('Error fetching orders for admin:', error);
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-500">Failed to load orders.</td></tr>`;
        });
}

function loadUsersAdmin() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">Loading users...</td></tr>`;

    axios.get(apiUrl.getUsers)
        .then(response => {
            const users = response.data;

            if (users.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-gray-500">No users found.</td></tr>`;
                return;
            }

            let rowsHtml = '';
            users.forEach(user => {
                const registerDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
                rowsHtml += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-3 font-medium text-gray-800">${user.name}</td>
                        <td class="p-3 text-gray-600">${user.phone || 'N/A'}</td>
                        <td class="p-3 text-gray-600">${registerDate}</td>
                        <td class="p-3 font-mono text-xs text-gray-400 uppercase" title="${user.id}">${user.id.substring(0, 8)}</td>
                    </tr>
                `;
            });
            tableBody.innerHTML = rowsHtml;
        })
        .catch(error => {
            console.error('Error fetching users for admin:', error);
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-red-500">Failed to load users.</td></tr>`;
        });
}

let adminInventoryCache = []; // Cache for editing

function loadInventoryAdmin() {
    axios.get(apiUrl.getInventory)
        .then(response => {
            adminInventoryCache = response.data;
            const tableBody = document.getElementById('inventory-table-body');
            if (!tableBody) return;

            if (adminInventoryCache.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-500">No inventory items found.</td></tr>`;
                return;
            }

            let rowsHtml = '';
            adminInventoryCache.forEach(item => {
                rowsHtml += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-3"><img src="${getProductImageUrl(item)}" alt="${item.itemName}" class="w-12 h-12 object-cover rounded-md"></td>
                        <td class="p-3 font-medium text-gray-800">${item.itemName}</td>
                        <td class="p-3 text-gray-600">${item.category}</td>
                        <td class="p-3 text-gray-600">₹${item.price}</td>
                        <td class="p-3 text-gray-600">${item.op_stock} ${item.unit}</td>
                        <td class="p-3">
                            <div class="flex gap-2">
                                <button onclick='openEditModal(${JSON.stringify(item)})' class="text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                                <button onclick="deleteInventory('${item.id}')" class="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = rowsHtml;
        })
        .catch(error => {
            console.error('Error fetching inventory for admin:', error);
            const tableBody = document.getElementById('inventory-table-body');
            if(tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-red-500">Failed to load inventory.</td></tr>`;
        });
}

async function addInventory(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
        await axios.post(apiUrl.addInventory, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        openAlert('success', 'Inventory item added successfully!');
        form.reset();
        const preview = form.querySelector('img');
        if (preview) {
            preview.src = '';
            preview.classList.add('hidden');
        }
        loadInventoryAdmin(); // Refresh the table
    } catch (error) {
        console.error("Add inventory error:", error.response || error);
        openAlert('error', error.response?.data?.message || "Failed to add item. Please try again.");
    }
}

async function deleteInventory(id) {
    if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) {
        return;
    }
    try {
        await axios.delete(`${apiUrl.deleteInventory}/${id}`);
        openAlert('success', 'Item deleted successfully.');
        loadInventoryAdmin(); // Easiest way to refresh the list
    } catch (error) {
        console.error("Delete inventory error:", error.response || error);
        openAlert('error', error.response?.data?.message || "Failed to delete item.");
    }
}

function openEditModal(item) {
    const modal = document.getElementById('editInventoryModal');
    const form = document.getElementById('editInventoryForm');
    if (!modal || !form) return;

    form.dataset.id = item.id; // Store ID for submission
    form.elements['itemName'].value = item.itemName;
    form.elements['category'].value = item.category;
    form.elements['price'].value = item.price;
    form.elements['op_stock'].value = item.op_stock;
    form.elements['unit'].value = item.unit;
    form.elements['description'].value = item.description || '';
    
    const preview = document.getElementById('edit-image-preview');
    if (preview) {
        preview.src = getProductImageUrl(item);
        preview.classList.remove('hidden');
    }

    modal.classList.remove('hidden');
}

function closeEditModal() {
    const modal = document.getElementById('editInventoryModal');
    if (modal) modal.classList.add('hidden');
}

async function updateInventory(e) {
    e.preventDefault();
    const form = e.target;
    const id = form.dataset.id;
    const formData = new FormData(form);

    // If the file input is empty, the backend will not receive a file,
    // and the controller logic correctly skips updating the image.

    try {
        await axios.put(`${apiUrl.updateInventory}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        openAlert('success', 'Inventory updated successfully!');
        closeEditModal();
        loadInventoryAdmin(); // Refresh table
    } catch (error) {
        console.error("Update inventory error:", error.response || error);
        openAlert('error', error.response?.data?.message || "Failed to update item.");
    }
}

async function addUser(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.elements['name'].value;
    const phone = form.elements['phone'].value;
    const password = form.elements['password'].value;
    const confirmPassword = form.elements['confirmPassword'].value;

    if (password !== confirmPassword) {
        return openAlert('error', 'Passwords do not match.');
    }

    try {
        await axios.post(apiUrl.addUser, { name, phone, password });
        openAlert('success', 'User created successfully! You will be redirected to the login page.');
        form.reset();
        setTimeout(() => window.location.href = '/', 2000); // Redirect to login after 2s
    } catch (error) {
        console.error("Add user error:", error.response || error);
        openAlert('error', error.response?.data?.message || "Failed to create user.");
    }
}

// --- UTILITY FUNCTIONS ---

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

// Loader Helper Functions
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('hidden');
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
}

// Axios Interceptors to handle Loader
if (typeof axios !== 'undefined') {
    axios.interceptors.request.use(function (config) {
        showLoader();
        return config;
    }, function (error) {
        hideLoader();
        return Promise.reject(error);
    });

    axios.interceptors.response.use(function (response) {
        hideLoader();
        return response;
    }, function (error) {
        hideLoader();
        return Promise.reject(error);
    });
}
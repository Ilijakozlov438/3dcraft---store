// ===== STATE AND CONFIGURATION =====
// Используем localStorage для хранения корзины
let cart = [];

// Load cart from memory on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing shop...');
    
    // Проверяем загрузились ли глобальные переменные из config.js
    console.log('SHOP_PRODUCTS loaded:', window.SHOP_PRODUCTS ? 'Yes' : 'No');
    console.log('SHOP_CONFIG loaded:', window.SHOP_CONFIG ? 'Yes' : 'No');
    
    // Если товары не загрузились, пробуем их создать локально
    if (!window.SHOP_PRODUCTS || window.SHOP_PRODUCTS.length === 0) {
        console.error('SHOP_PRODUCTS not loaded from config.js!');
        
        // Создаем минимальный набор товаров для теста
        window.SHOP_PRODUCTS = [
            {
                id: 'test_abs_black',
                name: 'ABS Filament',
                color: 'Crna',
                material: 'ABS',
                price: 15,
                sku: 'ABS-BL-1KG',
                description: 'Testni ABS filament',
                characteristics: ['Otporan na toplotu', 'Čvrst']
            },
            {
                id: 'test_pla_white',
                name: 'PLA Filament',
                color: 'Bela',
                material: 'PLA',
                price: 14,
                sku: 'PLA-WH-1KG',
                description: 'Testni PLA filament',
                characteristics: ['Biodegradabilan', 'Lako štampa']
            }
        ];
        
        console.log('Using test products:', window.SHOP_PRODUCTS.length);
    }
    
    // Если конфиг не загрузился, создаем минимальный
    if (!window.SHOP_CONFIG) {
        window.SHOP_CONFIG = {
            imageBasePath: 'slike/',
            defaultImage: 'slike/filament_default.jpg',
            shopName: '3DCraft Shop',
            pickupAddress: "Makedonska 1A, Zemun, Beograd",
            currency: '€',
            maxQuantityPerProduct: 10,
            bulkOrderThreshold: 5
        };
    }
    
    // Try to load cart from localStorage
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            console.log('Cart loaded from localStorage:', cart);
        }
    } catch (e) {
        console.log('Error loading cart from localStorage:', e);
    }
    
    // Инициализируем магазин
    initializeShop();
});

function initializeShop() {
    const products = window.SHOP_PRODUCTS || [];
    const CONFIG = window.SHOP_CONFIG || {};
    
    const productsGrid = document.getElementById('productsGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cartCountHeader = document.getElementById('cartCountHeader');
    const floatingCartCount = document.getElementById('floatingCartCount');
    
    if (!productsGrid) {
        console.error('Products grid element not found!');
        return;
    }
    
    console.log('Initializing shop with', products.length, 'products');
    console.log('Config:', CONFIG);
    
    // Рендерим товары
    renderProducts(products, productsGrid, CONFIG);
    updateCartCount(cartCountHeader, floatingCartCount);
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Filter button clicked:', this.dataset.filter);
            
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.filter;
            
            let filteredProducts = products;
            if (currentFilter !== 'all') {
                filteredProducts = products.filter(p => p.material === currentFilter);
            }
            
            console.log('Filtered products:', filteredProducts.length);
            renderProducts(filteredProducts, productsGrid, CONFIG);
        });
    });
    
    // Floating cart button
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'cart.html';
        });
    }
    
    updateCartCount(cartCountHeader, floatingCartCount);
}

// ===== RENDERING FUNCTIONS =====

function renderProducts(productsArray, productsGrid, CONFIG) {
    if (!productsGrid) {
        console.error('Products grid element not found!');
        return;
    }
    
    console.log('Rendering products:', productsArray.length);
    
    if (productsArray.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <p style="color: #666; font-size: 1.1rem;">Nema proizvoda za prikaz.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    productsArray.forEach((product, index) => {
        const imagePath = getProductImagePath(product, CONFIG);
        
        html += `
            <div class="product-card" style="animation-delay: ${index * 0.05}s;">
                <div class="product-badge ${getBadgeClass(product.material)}">
                    ${product.material}
                </div>
                
                <div class="product-image">
                    <img src="${imagePath}" 
                         alt="${product.name} ${product.color}"
                         onerror="this.onerror=null; this.src='${CONFIG.defaultImage || 'slike/filament_default.jpg'}'">
                    <div class="product-color-indicator ${getColorClass(product.color)}"></div>
                </div>
                
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    
                    <div class="product-color">
                        <span class="color-dot ${getColorClass(product.color)}"></span>
                        Boja: ${product.color}
                    </div>
                    
                    <div class="product-sku">Šifra: ${product.sku}</div>
                    
                    <p class="product-description">${product.description}</p>
                    
                    ${product.characteristics ? `
                    <div class="product-characteristics">
                        ${product.characteristics.map(char => `<span class="characteristic-tag">${char}</span>`).join('')}
                    </div>
                    ` : ''}
                    
                    ${product.printTemp ? `
                    <div class="product-tech-info">
                        <small><i class="fas fa-thermometer-half"></i> Temperatura štampe: ${product.printTemp}</small>
                    </div>
                    ` : ''}
                    
                    <div class="product-price">
                        ${product.price}${CONFIG.currency || '€'} <small>/kg</small>
                    </div>
                    
                    <div class="quantity-selector">
                        <button class="qty-btn minus" data-id="${product.id}">-</button>
                        <input type="number" class="qty-input" id="qty_${product.id}" 
                               value="1" min="1" max="${CONFIG.maxQuantityPerProduct || 10}" data-id="${product.id}">
                        <button class="qty-btn plus" data-id="${product.id}">+</button>
                        <span class="qty-label">kg</span>
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Dodaj u korpu
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsGrid.innerHTML = html;
    addProductEventListeners(CONFIG);
    
    console.log('Products rendered successfully');
}

function addProductEventListeners(CONFIG) {
    const products = window.SHOP_PRODUCTS || [];
    
    // Minus buttons
    document.querySelectorAll('.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const input = document.getElementById(`qty_${productId}`);
            let value = parseInt(input.value) - 1;
            if (value < 1) value = 1;
            input.value = value;
        });
    });
    
    // Plus buttons
    document.querySelectorAll('.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const input = document.getElementById(`qty_${productId}`);
            let value = parseInt(input.value) + 1;
            if (value > (CONFIG.maxQuantityPerProduct || 10)) value = CONFIG.maxQuantityPerProduct || 10;
            input.value = value;
        });
    });
    
    // Quantity inputs
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) value = 1;
            if (value > (CONFIG.maxQuantityPerProduct || 10)) value = CONFIG.maxQuantityPerProduct || 10;
            this.value = value;
        });
    });
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const input = document.getElementById(`qty_${productId}`);
            const quantity = parseInt(input.value) || 1;
            
            addToCart(productId, quantity);
            
            const product = products.find(p => p.id === productId);
            if (product) {
                showNotification(`Dodato u korpu: ${product.name} ${product.color} (${quantity}kg)`);
            }
        });
    });
}

// ===== CART FUNCTIONS =====

function addToCart(productId, quantity = 1) {
    const products = window.SHOP_PRODUCTS || [];
    const CONFIG = window.SHOP_CONFIG || {};
    
    console.log('Adding to cart:', productId, 'quantity:', quantity);
    
    // Загружаем текущую корзину
    let cart = [];
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (e) {
        console.log('Error loading cart:', e);
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const maxQuantity = CONFIG.maxQuantityPerProduct || 10;
        
        if (newQuantity <= maxQuantity) {
            existingItem.quantity = newQuantity;
            existingItem.addedAt = new Date().toISOString();
        } else {
            showNotification(`Maksimalna količina je ${maxQuantity}kg po proizvodu!`);
            return;
        }
    } else {
        const product = products.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }
        
        cart.push({
            id: productId,
            quantity: quantity,
            addedAt: new Date().toISOString()
        });
    }
    
    saveCart(cart);
    updateCartCount();
}

function updateCartCount(cartCountHeader, floatingCartCount) {
    if (!cartCountHeader) cartCountHeader = document.getElementById('cartCountHeader');
    if (!floatingCartCount) floatingCartCount = document.getElementById('floatingCartCount');
    
    let cart = [];
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (e) {
        console.log('Error loading cart:', e);
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    console.log('Updating cart count:', totalItems);
    
    if (cartCountHeader) {
        cartCountHeader.textContent = totalItems;
        cartCountHeader.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    
    if (floatingCartCount) {
        floatingCartCount.textContent = totalItems;
        floatingCartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
    
    return totalItems;
}

function saveCart(cartData) {
    console.log('Saving cart to localStorage:', cartData);
    try {
        localStorage.setItem('cart', JSON.stringify(cartData));
    } catch (error) {
        console.log('localStorage not available, cart stored in memory only');
    }
}

// ===== UTILITY FUNCTIONS =====

function getProductImagePath(product, CONFIG) {
    if (!product) return CONFIG.defaultImage || 'slike/filament_default.jpg';
    const imagePath = `${CONFIG.imageBasePath || 'slike/'}${product.sku}.jpg`;
    return imagePath;
}

function getBadgeClass(material) {
    const badgeClasses = {
        'ABS': 'badge-abs',
        'PLA': 'badge-pla',
        'PETG': 'badge-petg',
        'TPU': 'badge-tpu',
        'ASA': 'badge-asa'
    };
    return badgeClasses[material] || 'badge-pla';
}

function getColorClass(color) {
    return color === 'Crna' ? 'color-black' : 'color-white';
}

function showNotification(message) {
    // Удаляем старые уведомления
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #25D366;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 2000;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s;
        max-width: 400px;
        border-left: 4px solid #128C7E;
    `;
    
    // Добавляем стили анимации если их нет
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// ===== GLOBAL FUNCTIONS =====

window.getCart = function() {
    try {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
        return [];
    }
};

window.clearCart = function() {
    try {
        const savedCart = localStorage.getItem('cart');
        if (!savedCart || JSON.parse(savedCart).length === 0) return;
        
        if (confirm('Da li ste sigurni da želite da ispraznite celu korpu?')) {
            localStorage.removeItem('cart');
            updateCartCount();
            
            if (window.location.pathname.includes('cart.html')) {
                window.location.reload();
            }
            
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
};
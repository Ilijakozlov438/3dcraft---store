// ===== CART PAGE FUNCTIONALITY =====

// Глобальные переменные будут внутри функции, чтобы избежать конфликтов
(function() {
    // Локальные переменные для этой страницы
    let cart = [];
    let CONFIG = {};
    let PRODUCTS = [];
    
    // Load cart from localStorage on page load
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Cart page loaded, initializing...');
        
        // Get configuration and products from global scope
        CONFIG = window.SHOP_CONFIG || {};
        PRODUCTS = window.SHOP_PRODUCTS || [];
        
        // If config/products not loaded, create minimal defaults
        if (!CONFIG || Object.keys(CONFIG).length === 0) {
            CONFIG = {
                shopName: '3DCraft Shop',
                pickupAddress: 'Makedonska 1A, Zemun, Beograd',
                workingHours: 'Ponedeljak - Petak: 09:00-21:00',
                phoneNumber: '063 779 78 57',
                whatsappNumber: '381637797857',
                viberNumber: '381637797857',
                currency: '€',
                bulkOrderThreshold: 5,
                maxQuantityPerProduct: 10,
                defaultImage: 'slike/filament_default.jpg',
                imageBasePath: 'slike/'
            };
        }
        
        if (!PRODUCTS || PRODUCTS.length === 0) {
            PRODUCTS = [
                {
                    id: 'abs_black',
                    name: 'ABS Filament',
                    color: 'Crna',
                    material: 'ABS',
                    price: 15,
                    sku: 'ABS-BL-1KG'
                }
            ];
        }
        
        // Load cart from localStorage
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                cart = JSON.parse(savedCart);
                console.log('Cart loaded from localStorage:', cart);
            }
        } catch (e) {
            console.log('Error loading cart:', e);
        }
        
        // Initialize cart page
        initCartPage();
    });
    
    function initCartPage() {
        // Update contact info from config
        updateContactInfo();
        
        // Render cart items
        renderCartItems();
        
        // Add event listeners
        setupEventListeners();
    }
    
    function updateContactInfo() {
        // Main contact information
        if (CONFIG.pickupAddress) {
            document.getElementById('config-address').textContent = CONFIG.pickupAddress;
            const footerAddress = document.getElementById('config-footer-address');
            if (footerAddress) footerAddress.textContent = CONFIG.pickupAddress;
        }
        
        if (CONFIG.workingHours) {
            document.getElementById('config-hours').textContent = CONFIG.workingHours;
        }
        
        if (CONFIG.phoneNumber) {
            document.getElementById('config-phone').textContent = CONFIG.phoneNumber + ' (WhatsApp/Viber)';
            const footerPhone = document.getElementById('config-footer-phone');
            if (footerPhone) footerPhone.textContent = CONFIG.phoneNumber;
        }
        
        if (CONFIG.shopName) {
            const shopNameEl = document.getElementById('config-shopname');
            const copyrightEl = document.getElementById('config-copyright');
            if (shopNameEl) shopNameEl.textContent = CONFIG.shopName;
            if (copyrightEl) copyrightEl.textContent = CONFIG.shopName;
        }
        
        // Bulk order threshold
        if (CONFIG.bulkOrderThreshold) {
            document.getElementById('bulkThreshold').textContent = CONFIG.bulkOrderThreshold;
        }
        
        // WhatsApp button for bulk orders
        const bulkWhatsAppBtn = document.getElementById('bulkWhatsAppBtn');
        if (bulkWhatsAppBtn && CONFIG.whatsappNumber) {
            bulkWhatsAppBtn.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(`Interesuje me cena za veću količinu filamenta (${CONFIG.bulkOrderThreshold || 5}kg+). Molim vas za ponudu.`)}`;
        }
    }
    
    function renderCartItems() {
        const cartItemsList = document.getElementById('cartItemsList');
        const emptyCartState = document.getElementById('emptyCartState');
        const headerCartCount = document.getElementById('headerCartCount');
        const bulkReminder = document.getElementById('bulkReminder');
        
        if (!cartItemsList) return;
        
        // Update header counter
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (headerCartCount) {
            headerCartCount.textContent = totalItems;
        }
        
        // If cart is empty
        if (cart.length === 0) {
            if (emptyCartState) emptyCartState.style.display = 'block';
            if (bulkReminder) bulkReminder.style.display = 'none';
            updateOrderSummary();
            return;
        }
        
        if (emptyCartState) emptyCartState.style.display = 'none';
        
        let html = '';
        let totalQuantity = 0;
        let subtotal = 0;
        
        cart.forEach(cartItem => {
            const product = PRODUCTS.find(p => p.id === cartItem.id);
            if (!product) return;
            
            const itemTotal = product.price * cartItem.quantity;
            totalQuantity += cartItem.quantity;
            subtotal += itemTotal;
            
            html += `
                <div class="cart-item" data-id="${product.id}">
                    <div class="cart-item-image">
                        <img src="${getProductImagePath(product)}" 
                             alt="${product.name} ${product.color}"
                             onerror="this.onerror=null; this.src='${CONFIG.defaultImage || 'slike/filament_default.jpg'}'">
                        <div class="cart-item-color ${getColorClass(product.color)}"></div>
                    </div>
                    
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${product.name} ${product.color}</h4>
                        <div class="cart-item-sku">Šifra: ${product.sku}</div>
                        <div class="cart-item-price">${product.price}${CONFIG.currency || '€'} / kg</div>
                        <div class="cart-item-actions">
                            <button class="cart-item-remove" data-id="${product.id}">
                                <i class="fas fa-trash"></i> Ukloni
                            </button>
                        </div>
                    </div>
                    
                    <div class="cart-item-quantity">
                        <div class="quantity-selector">
                            <button class="qty-btn minus" data-id="${product.id}">-</button>
                            <input type="number" class="qty-input" value="${cartItem.quantity}" 
                                   min="1" max="${CONFIG.maxQuantityPerProduct || 10}" data-id="${product.id}">
                            <button class="qty-btn plus" data-id="${product.id}">+</button>
                            <span class="qty-label">kg</span>
                        </div>
                        <div class="cart-item-total">
                            ${itemTotal.toFixed(2)}${CONFIG.currency || '€'}
                        </div>
                    </div>
                </div>
            `;
        });
        
        cartItemsList.innerHTML = html;
        
        // Show/hide bulk order reminder
        if (bulkReminder && CONFIG.bulkOrderThreshold) {
            bulkReminder.style.display = totalQuantity >= CONFIG.bulkOrderThreshold ? 'flex' : 'none';
        }
        
        updateOrderSummary(totalQuantity, subtotal);
        addCartEventListeners();
    }
    
    function updateOrderSummary(totalQuantity = 0, subtotal = 0) {
        const summaryTotalQuantity = document.getElementById('summaryTotalQuantity');
        const summarySubtotal = document.getElementById('summarySubtotal');
        const summaryTotal = document.getElementById('summaryTotal');
        const orderWhatsAppBtn = document.getElementById('orderWhatsAppBtn');
        const orderViberBtn = document.getElementById('orderViberBtn');
        
        if (summaryTotalQuantity) {
            summaryTotalQuantity.textContent = `${totalQuantity} kg`;
        }
        
        if (summarySubtotal) {
            summarySubtotal.textContent = `${subtotal.toFixed(2)}${CONFIG.currency || '€'}`;
        }
        
        if (summaryTotal) {
            summaryTotal.textContent = `${subtotal.toFixed(2)}${CONFIG.currency || '€'}`;
        }
        
        // Enable/disable order buttons
        if (orderWhatsAppBtn && orderViberBtn) {
            const isCartEmpty = cart.length === 0;
            orderWhatsAppBtn.disabled = isCartEmpty;
            orderViberBtn.disabled = isCartEmpty;
        }
    }
    
    function addCartEventListeners() {
        // Minus buttons
        document.querySelectorAll('.cart-item .minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                updateCartQuantity(productId, -1);
            });
        });
        
        // Plus buttons
        document.querySelectorAll('.cart-item .plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                updateCartQuantity(productId, 1);
            });
        });
        
        // Quantity inputs
        document.querySelectorAll('.cart-item .qty-input').forEach(input => {
            input.addEventListener('change', function() {
                const productId = this.dataset.id;
                let quantity = parseInt(this.value);
                
                if (isNaN(quantity) || quantity < 1) quantity = 1;
                if (quantity > (CONFIG.maxQuantityPerProduct || 10)) quantity = CONFIG.maxQuantityPerProduct || 10;
                
                setCartQuantity(productId, quantity);
            });
        });
        
        // Remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.dataset.id;
                removeFromCart(productId);
            });
        });
    }
    
    function setupEventListeners() {
        // Clear cart button
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', clearCart);
        }
        
        // WhatsApp order button
        const orderWhatsAppBtn = document.getElementById('orderWhatsAppBtn');
        if (orderWhatsAppBtn) {
            orderWhatsAppBtn.addEventListener('click', sendOrderViaWhatsApp);
        }
        
        // Viber order button
        const orderViberBtn = document.getElementById('orderViberBtn');
        if (orderViberBtn) {
            orderViberBtn.addEventListener('click', sendOrderViaViber);
        }
    }
    
    function updateCartQuantity(productId, change) {
        const cartItem = cart.find(item => item.id === productId);
        if (!cartItem) return;
        
        let newQuantity = cartItem.quantity + change;
        if (newQuantity < 1) newQuantity = 1;
        if (newQuantity > (CONFIG.maxQuantityPerProduct || 10)) newQuantity = CONFIG.maxQuantityPerProduct || 10;
        
        cartItem.quantity = newQuantity;
        saveCart();
        renderCartItems();
    }
    
    function setCartQuantity(productId, quantity) {
        const cartItem = cart.find(item => item.id === productId);
        if (!cartItem) return;
        
        cartItem.quantity = quantity;
        saveCart();
        renderCartItems();
    }
    
    function removeFromCart(productId) {
        const index = cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            cart.splice(index, 1);
            saveCart();
            renderCartItems();
            
            showNotification('Proizvod je uklonjen iz korpe');
        }
    }
    
    function clearCart() {
        if (cart.length === 0) return;
        
        if (confirm('Da li ste sigurni da želite da ispraznite celu korpu?')) {
            cart = [];
            saveCart();
            renderCartItems();
            showNotification('Korpa je ispražnjena');
        }
    }
    
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    function getProductImagePath(product) {
        if (!product) return CONFIG.defaultImage || 'slike/filament_default.jpg';
        const imagePath = `${CONFIG.imageBasePath || 'slike/'}${product.sku}.jpg`;
        return imagePath;
    }
    
    function getColorClass(color) {
        return color === 'Crna' ? 'color-black' : 'color-white';
    }
    
    function sendOrderViaWhatsApp() {
        if (cart.length === 0) return;
        
        let message = `Zdravo! Želim da poručim filament:\n\n`;
        let total = 0;
        let totalQuantity = 0;
        
        cart.forEach(cartItem => {
            const product = PRODUCTS.find(p => p.id === cartItem.id);
            if (product) {
                const itemTotal = product.price * cartItem.quantity;
                total += itemTotal;
                totalQuantity += cartItem.quantity;
                message += `• ${product.name} ${product.color} (${product.sku}) - ${cartItem.quantity}kg x ${product.price}${CONFIG.currency || '€'} = ${itemTotal.toFixed(2)}${CONFIG.currency || '€'}\n`;
            }
        });
        
        message += `\nUkupno: ${totalQuantity}kg, ${total.toFixed(2)}${CONFIG.currency || '€'}\n`;
        message += `\nDodatne informacije:\n`;
        message += `Planirano preuzimanje: _________________\n`;
        message += `Ime i prezime: _________________\n`;
        message += `Kontakt telefon: _________________\n`;
        message += `\nHvala!`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber || '381637797857'}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }
    
    function sendOrderViaViber() {
        if (cart.length === 0) return;
        
        let message = `Zdravo! Želim da poručim filament:\n\n`;
        let total = 0;
        let totalQuantity = 0;
        
        cart.forEach(cartItem => {
            const product = PRODUCTS.find(p => p.id === cartItem.id);
            if (product) {
                const itemTotal = product.price * cartItem.quantity;
                total += itemTotal;
                totalQuantity += cartItem.quantity;
                message += `• ${product.name} ${product.color} (${product.sku}) - ${cartItem.quantity}kg x ${product.price}${CONFIG.currency || '€'} = ${itemTotal.toFixed(2)}${CONFIG.currency || '€'}\n`;
            }
        });
        
        message += `\nUkupno: ${totalQuantity}kg, ${total.toFixed(2)}${CONFIG.currency || '€'}\n`;
        message += `\nDodatne informacije:\n`;
        message += `Planirano preuzimanje: _________________\n`;
        message += `Ime i prezime: _________________\n`;
        message += `Kontakt telefon: _________________\n`;
        
        // Viber doesn't support prefilled messages like WhatsApp, so we use phone contact
        const viberUrl = `viber://contact?number=${CONFIG.viberNumber || '381637797857'}`;
        
        // Try to open Viber, fallback to alert
        window.location.href = viberUrl;
        
        // Show message to copy
        setTimeout(() => {
            if (confirm('Kopirajte poruku ispod i pošaljite na Viber:\n\n' + message + '\n\nŽelite li da kopirate poruku?')) {
                copyToClipboard(message);
                showNotification('Poruka je kopirana! Nalepite je u Viber.');
            }
        }, 1000);
    }
    
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    function showNotification(message) {
        // Remove existing notifications
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
    
    // Global functions for other pages to access
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
            if (!savedCart || JSON.parse(savedCart).length === 0) return false;
            
            if (confirm('Da li ste sigurni da želite da ispraznite celu korpu?')) {
                localStorage.removeItem('cart');
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
    
})(); // End of IIFE
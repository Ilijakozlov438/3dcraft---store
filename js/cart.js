// ===== СТРАНИЦА КОРЗИНЫ =====

// Проверка сенсорного устройства
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ===== TOUCH OPTIMIZED FUNCTIONS =====

// Prevent double-tap zoom
function setupTouchOptimization() {
    // Add touch-action: manipulation to all interactive elements
    document.querySelectorAll('.cart-qty-btn, .remove-item-btn, #clearCartBtn, .btn-order-whatsapp, .btn-order-viber').forEach(el => {
        el.style.touchAction = 'manipulation';
    });
    
    // Prevent context menu on buttons
    document.querySelectorAll('.cart-qty-btn, .remove-item-btn').forEach(el => {
        el.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    });
}

// Optimized for touch events
function addTouchEventListeners() {
    if (isTouchDevice) {
        // Add touch feedback
        document.querySelectorAll('.cart-qty-btn, .remove-item-btn, #clearCartBtn, .btn-order-whatsapp, .btn-order-viber').forEach(btn => {
            btn.addEventListener('touchstart', function() {
                this.style.opacity = '0.7';
            });
            
            btn.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
        });
    }
}

// Update cart item rendering for mobile
function renderCartItemForMobile(item, product, config) {
    return `
        <div class="cart-item" data-id="${product.id}">
            <div class="cart-item-image">
                <img src="${getProductImagePath(product, config)}" 
                     alt="${product.name} ${product.color}">
            </div>
            
            <div class="cart-item-info">
                <h4 class="cart-item-title">${product.name} ${product.color}</h4>
                <div class="cart-item-sku">${product.sku}</div>
                <div class="cart-item-price">${product.price}${config.currency}/kg</div>
            </div>
            
            <div class="cart-item-quantity">
                <div class="quantity-selector">
                    <button class="cart-qty-btn minus" data-id="${product.id}">-</button>
                    <input type="number" class="cart-qty-input" 
                           value="${item.quantity}" min="1" max="10" 
                           data-id="${product.id}">
                    <button class="cart-qty-btn plus" data-id="${product.id}">+</button>
                    <span class="qty-unit">kg</span>
                </div>
                <div class="cart-item-total">
                    ${item.itemTotal.toFixed(2)}${config.currency}
                </div>
            </div>
            
            <div class="cart-item-actions">
                <button class="remove-item-btn" data-id="${product.id}" 
                        title="Ukloni iz korpe">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Инициализация с оптимизацией для сенсорных устройств
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart page initialized');
    
    const products = window.SHOP_PRODUCTS || [];
    const config = window.SHOP_CONFIG || {};
    
    // Настройка touch-оптимизации
    setupTouchOptimization();
    
    // Инициализация страницы корзины
    initCartPage(products, config);
    
    // Добавление обработчиков touch-событий
    setTimeout(addTouchEventListeners, 500);
});

function initCartPage(products, config) {
    // Обновляем контактную информацию
    updateContactInfo(config);
    
    // Рендерим корзину
    renderCart(products, config);
    
    // Добавляем обработчики событий
    setupCartEventListeners(products, config);
    
    // Обновляем счетчик
    cartManager.updateCartCounters();
}

function updateContactInfo(config) {
    const elements = {
        'config-address': config.pickupAddress,
        'config-hours': config.workingHours,
        'config-phone': config.phoneNumber + ' (WhatsApp/Viber)',
        'config-shopname': config.shopName,
        'config-copyright': config.shopName
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element && elements[id]) {
            element.textContent = elements[id];
        }
    });
    
    // Кнопка оптового заказа
    const bulkBtn = document.getElementById('bulkWhatsAppBtn');
    if (bulkBtn && config.whatsappNumber) {
        bulkBtn.href = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
            `Interesuje me cena za veću količinu filamenta (${config.bulkOrderThreshold}kg+). Molim vas za ponudu.`
        )}`;
    }
}

function renderCart(products, config) {
    const cartItems = cartManager.getCartDetails(products);
    const cartList = document.getElementById('cartItemsList');
    const emptyState = document.getElementById('emptyCartState');
    const bulkReminder = document.getElementById('bulkReminder');
    
    if (!cartList) return;
    
    // Если корзина пуста
    if (cartItems.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (bulkReminder) bulkReminder.style.display = 'none';
        updateOrderSummary(0, 0, config);
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    let html = '';
    let totalQuantity = 0;
    let subtotal = 0;
    
    cartItems.forEach(item => {
        const product = item.product;
        if (!product) return;
        
        totalQuantity += item.quantity;
        subtotal += item.itemTotal;
        
        // Используем мобильный шаблон для сенсорных устройств
        if (isTouchDevice) {
            html += renderCartItemForMobile(item, product, config);
        } else {
            html += `
                <div class="cart-item" data-id="${product.id}">
                    <div class="cart-item-image">
                        <img src="${getProductImagePath(product, config)}" 
                             alt="${product.name} ${product.color}">
                    </div>
                    
                    <div class="cart-item-info">
                        <h4>${product.name} ${product.color}</h4>
                        <div class="cart-item-sku">${product.sku}</div>
                        <div class="cart-item-price">${product.price}${config.currency}/kg</div>
                    </div>
                    
                    <div class="cart-item-controls">
                        <div class="cart-quantity">
                            <button class="cart-qty-btn minus" data-id="${product.id}">-</button>
                            <input type="number" class="cart-qty-input" 
                                   value="${item.quantity}" min="1" max="10" 
                                   data-id="${product.id}">
                            <button class="cart-qty-btn plus" data-id="${product.id}">+</button>
                            <span class="qty-unit">kg</span>
                        </div>
                        <button class="remove-item-btn" data-id="${product.id}" title="Ukloni iz korpe">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div class="cart-item-total">
                        ${item.itemTotal.toFixed(2)}${config.currency}
                    </div>
                </div>
            `;
        }
    });
    
    cartList.innerHTML = html;
    
    // Показываем/скрываем напоминание об опте
    if (bulkReminder && config.bulkOrderThreshold) {
        bulkReminder.style.display = totalQuantity >= config.bulkOrderThreshold ? 'flex' : 'none';
    }
    
    updateOrderSummary(totalQuantity, subtotal, config);
    
    // Добавляем обработчики для элементов корзины
    addCartItemEventListeners(products, config);
}

function addCartItemEventListeners(products, config) {
    // Изменение количества через кнопки
    document.querySelectorAll('.cart-qty-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            updateCartItemQuantity(productId, 1, products, config);
            animateButtonClick(this);
        });
    });
    
    document.querySelectorAll('.cart-qty-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            updateCartItemQuantity(productId, -1, products, config);
            animateButtonClick(this);
        });
    });
    
    // Прямое изменение через input
    document.querySelectorAll('.cart-qty-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.dataset.id;
            const quantity = parseInt(this.value) || 1;
            cartManager.updateQuantity(productId, quantity);
            renderCart(products, config);
            notificationManager.show('Količina je ažurirana', 'success');
        });
        
        // Анимация при фокусе
        input.addEventListener('focus', function() {
            this.parentElement.style.borderColor = '#25D366';
            this.parentElement.style.boxShadow = '0 0 0 3px rgba(37, 211, 102, 0.2)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.borderColor = '#e0e0e0';
            this.parentElement.style.boxShadow = 'none';
        });
    });
    
    // Удаление товара с анимацией
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const product = products.find(p => p.id === productId);
            const cartItem = this.closest('.cart-item');
            
            if (cartItem) {
                // Анимация удаления
                animateCartItemRemoval(cartItem);
                
                // Удаляем из корзины через 150мс (чтобы анимация успела проиграться)
                setTimeout(() => {
                    cartManager.removeItem(productId);
                    renderCart(products, config);
                    if (product) {
                        notificationManager.show(`Uklonjeno: ${product.name} ${product.color}`, 'success');
                    }
                }, 300);
            }
        });
    });
}

function updateCartItemQuantity(productId, change, products, config) {
    const cartItem = cartManager.cart.find(item => item.id === productId);
    if (!cartItem) return;
    
    const newQuantity = cartItem.quantity + change;
    if (newQuantity < 1 || newQuantity > 10) return;
    
    cartManager.updateQuantity(productId, newQuantity);
    renderCart(products, config);
}

function updateOrderSummary(totalQuantity, subtotal, config) {
    const elements = {
        'summaryTotalQuantity': `${totalQuantity} kg`,
        'summarySubtotal': `${subtotal.toFixed(2)}${config.currency}`,
        'summaryTotal': `${subtotal.toFixed(2)}${config.currency}`
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
    
    // Активируем/деактивируем кнопки заказа
    const orderButtons = document.querySelectorAll('.btn-order-whatsapp, .btn-order-viber');
    const isCartEmpty = totalQuantity === 0;
    
    orderButtons.forEach(btn => {
        btn.disabled = isCartEmpty;
    });
}

function setupCartEventListeners(products, config) {
    // Кнопка очистки корзины
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (cartManager.cart.length === 0) return;
            
            if (confirm('Da li ste sigurni da želite da ispraznite celu korpu?')) {
                cartManager.clearCart();
                // Полностью перерисовываем корзину
                renderCart(products, config);
                // Обновляем счетчики в хедере
                cartManager.updateCartCounters();
                notificationManager.show('Korpa je ispražnjena', 'success');
            }
        });
    }
    
    // Кнопка заказа через WhatsApp
    const whatsappBtn = document.getElementById('orderWhatsAppBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            sendOrderViaWhatsApp(products, config);
        });
    }
    
    // Кнопка заказа через Viber
    const viberBtn = document.getElementById('orderViberBtn');
    if (viberBtn) {
        viberBtn.addEventListener('click', function() {
            sendOrderViaViber(products, config);
        });
    }
}

function sendOrderViaWhatsApp(products, config) {
    const cartItems = cartManager.getCartDetails(products);
    if (cartItems.length === 0) return;
    
    let message = `Zdravo! Želim da poručim filament:\n\n`;
    let total = 0;
    let totalQuantity = 0;
    
    cartItems.forEach(item => {
        const product = item.product;
        if (product) {
            total += item.itemTotal;
            totalQuantity += item.quantity;
            message += `• ${product.name} ${product.color} (${product.sku}) - ${item.quantity}kg x ${product.price}${config.currency} = ${item.itemTotal.toFixed(2)}${config.currency}\n`;
        }
    });
    
    message += `\nUkupno: ${totalQuantity}kg, ${total.toFixed(2)}${config.currency}\n`;
    message += `\nDodatne informacije:\n`;
    message += `Planirano preuzimanje: _________________\n`;
    message += `Ime i prezime: _________________\n`;
    message += `Kontakt telefon: _________________\n`;
    message += `\nHvala!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`, '_blank');
}

function sendOrderViaViber(products, config) {
    const cartItems = cartManager.getCartDetails(products);
    if (cartItems.length === 0) return;
    
    // Создаем сообщение
    let message = `Zdravo! Želim da poručim filament:\n\n`;
    let total = 0;
    let totalQuantity = 0;
    
    cartItems.forEach(item => {
        const product = item.product;
        if (product) {
            total += item.itemTotal;
            totalQuantity += item.quantity;
            message += `• ${product.name} ${product.color} (${product.sku}) - ${item.quantity}kg x ${product.price}${config.currency} = ${item.itemTotal.toFixed(2)}${config.currency}\n`;
        }
    });
    
    message += `\nUkupno: ${totalQuantity}kg, ${total.toFixed(2)}${config.currency}\n`;
    
    // Пытаемся открыть Viber
    const viberUrl = `viber://contact?number=${config.viberNumber}`;
    window.location.href = viberUrl;
    
    // Через секунду предлагаем скопировать сообщение
    setTimeout(() => {
        if (confirm('Želite li da kopirate poruku za Viber?')) {
            copyToClipboard(message);
            notificationManager.show('Poruka kopirana! Nalepite u Viber.', 'success');
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

function getProductImagePath(product, config) {
    if (!product || !config) return config.defaultImage;
    return `${config.imageBasePath}${product.sku}.jpg`;
}

// Анимация при удалении товара
function animateCartItemRemoval(element) {
    element.style.transition = 'all 0.3s ease';
    element.style.opacity = '0';
    element.style.transform = 'translateX(-50px)';
    element.style.height = '0';
    element.style.padding = '0';
    element.style.margin = '0';
    element.style.border = 'none';
    
    setTimeout(() => {
        if (element.parentNode) {
            element.remove();
        }
    }, 300);
}

// Анимация клика по кнопке
function animateButtonClick(button) {
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
}
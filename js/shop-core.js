// ===== ОБЩИЕ ФУНКЦИИ ДЛЯ МАГАЗИНА =====

// Класс для управления корзиной
class CartManager {
    constructor() {
        this.cart = this.loadCart();
    }
    
    loadCart() {
        try {
            const savedCart = localStorage.getItem('3dcraft_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }
    
    saveCart() {
        try {
            localStorage.setItem('3dcraft_cart', JSON.stringify(this.cart));
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }
    
    addItem(productId, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: productId,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        this.updateCartCounters();
        return true;
    }
    
    removeItem(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            this.cart.splice(index, 1);
            this.saveCart();
            this.updateCartCounters();
            return true;
        }
        return false;
    }
    
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
            this.updateCartCounters();
            return true;
        }
        return false;
    }
    
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCounters();
        return true;
    }
    
    getCartCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    getCartTotal() {
        const products = window.SHOP_PRODUCTS || [];
        return this.cart.reduce((total, cartItem) => {
            const product = products.find(p => p.id === cartItem.id);
            return total + (product ? product.price * cartItem.quantity : 0);
        }, 0);
    }
    
    getCartDetails() {
        const products = window.SHOP_PRODUCTS || [];
        return this.cart.map(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            return {
                ...cartItem,
                product: product,
                itemTotal: product ? product.price * cartItem.quantity : 0
            };
        });
    }
    
    updateCartCounters() {
        const count = this.getCartCount();
        
        // Обновляем все счетчики на странице
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'inline-block' : 'none';
        });
        
        document.querySelectorAll('.cart-badge').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'block' : 'none';
        });
        
        // Обновляем header counter в cart.html
        const headerCounter = document.getElementById('headerCartCount');
        if (headerCounter) {
            headerCounter.textContent = count;
        }
        
        return count;
    }
}

// Класс для управления уведомлениями
class NotificationManager {
    constructor() {
        this.notificationId = 0;
    }
    
    show(message, type = 'success', duration = 3000) {
        const id = ++this.notificationId;
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('data-id', id);
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'warning' ? 'fa-exclamation-triangle' : 
                    type === 'error' ? 'fa-times-circle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            this.hide(id);
        }, duration);
        
        return id;
    }
    
    hide(id) {
        const notification = document.querySelector(`.notification[data-id="${id}"]`);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }
}

// Глобальные экземпляры
if (typeof window !== 'undefined') {
    window.cartManager = new CartManager();
    window.notificationManager = new NotificationManager();
}

// Общие утилиты
window.ShopCommon = {
    formatPrice: function(price, currency = '€') {
        return `${price.toFixed(2)}${currency}`;
    },
    
    getColorClass: function(color) {
        return color === 'Crna' ? 'color-black' : 'color-white';
    },
    
    getMaterialBadgeClass: function(material) {
        const badgeClasses = {
            'ABS': 'abs',
            'PLA': 'pla',
            'PETG': 'petg',
            'TPU': 'tpu',
            'ASA': 'asa'
        };
        return badgeClasses[material] || 'pla';
    },
    
    copyToClipboard: function(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
};
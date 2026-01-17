// Работа с корзиной через localStorage
class CartManager {
    constructor() {
        this.cartKey = '3dcraft_cart';
        this.loadCart();
    }

    loadCart() {
        const cartData = localStorage.getItem(this.cartKey);
        this.cart = cartData ? JSON.parse(cartData) : [];
    }

    saveCart() {
        localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
    }

    getCart() {
        return this.cart;
    }

    addToCart(sku, quantity = 1) {
        const existingItem = this.cart.find(item => item.sku === sku);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({ sku, quantity });
        }
        
        this.saveCart();
        this.updateCartIcon();
    }

    removeFromCart(sku) {
        this.cart = this.cart.filter(item => item.sku !== sku);
        this.saveCart();
        this.updateCartIcon();
    }

    updateCartItem(sku, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(sku);
            return;
        }

        const item = this.cart.find(item => item.sku === sku);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartIcon();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartIcon();
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    updateCartIcon() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = this.getCartCount();
        }
    }
}

// Глобальный экземпляр менеджера корзины
const cartManager = new CartManager();

// Обновление иконки корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    cartManager.updateCartIcon();
});

// Экспорт для использования в других модулях
window.cartManager = cartManager;
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Получаем товары из глобальной переменной
        const products = window.productsData || [];
        
        if (!Array.isArray(products) || products.length === 0) {
            throw new Error('Данные о товарах недоступны');
        }

        // Загрузка корзины из localStorage
        const cartItems = window.cartManager.getCart();
        
        // Отображение содержимого корзины
        renderCart(cartItems, products);
        
        // Установка обработчика для формы заказа
        setupOrderForm(products);
        
    } catch (error) {
        console.error('Ошибка при загрузке корзины:', error);
        const container = document.getElementById('cart-items-container');
        if (container) {
            container.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-exclamation-triangle fa-3x" style="color: #e74c3c; margin-bottom: 20px;"></i>
                    <p>Не удалось загрузить корзину. Пожалуйста, попробуйте позже.</p>
                    <a href="index.html" class="btn btn-primary">Вернуться в магазин</a>
                </div>
            `;
        }
    }
});

function renderCart(cartItems, products) {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart fa-3x" style="color: #10B981; margin-bottom: 20px;"></i>
                <p>Ваша корзина пуста</p>
                <a href="index.html" class="btn btn-primary">Вернуться в магазин</a>
            </div>
        `;
        return;
    }
    
    // Сопоставление товаров из корзины с полными данными
    const cartProducts = cartItems.map(cartItem => {
        const product = products.find(p => p.sku === cartItem.sku);
        if (!product) return null;
        return {
            ...product,
            quantity: cartItem.quantity,
            total: product.price * cartItem.quantity
        };
    }).filter(item => item !== null);
    
    const totalPrice = cartProducts.reduce((sum, item) => sum + item.total, 0);
    
    // Создание HTML для таблицы корзины
    let cartHTML = `
        <div class="cart-table-container">
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Товар</th>
                        <th>Цена</th>
                        <th>Количество</th>
                        <th>Сумма</th>
                        <th>Действие</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    cartProducts.forEach(item => {
        // Генерация имени файла по логике: материал-цвет.webp
        const imageName = `${item.material}-${item.color}.webp`;
        
        cartHTML += `
            <tr data-sku="${item.sku}" class="cart-item">
                <td class="product-cell">
                    <img src="images/${imageName}" alt="${item.name}" 
                         onerror="this.onerror=null; this.src='images/default.webp'"
                         loading="lazy">
                    <div class="product-details">
                        <div class="product-name">${item.name}</div>
                        <div class="product-meta">
                            <span>${item.material}, ${item.color}</span>
                            <span>${item.brand}</span>
                        </div>
                    </div>
                </td>
                <td>${item.price.toLocaleString()} ₽</td>
                <td>
                    <div class="quantity-control">
                        <button class="quantity-btn decrease" data-sku="${item.sku}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-sku="${item.sku}">
                        <button class="quantity-btn increase" data-sku="${item.sku}">+</button>
                    </div>
                </td>
                <td>${item.total.toLocaleString()} ₽</td>
                <td>
                    <button class="btn-remove" data-sku="${item.sku}">
                        <i class="fas fa-trash-alt"></i> Удалить
                    </button>
                </td>
            </tr>
        `;
    });
    
    cartHTML += `
                </tbody>
            </table>
        </div>
        
        <div class="cart-summary-container">
            <div class="cart-summary">
                <div class="cart-total-label">Итого к оплате:</div>
                <div class="cart-total">${totalPrice.toLocaleString()}</div>
            </div>
            <div class="cart-actions">
                <button class="btn btn-danger btn-clear-cart">
                    <i class="fas fa-trash"></i> Очистить корзину
                </button>
            </div>
        </div>
        
        <div class="order-section">
            <form id="order-form" class="order-form">
                <h2>Оформление заказа</h2>
                
                <div class="form-group">
                    <label for="name" class="required">Имя</label>
                    <input type="text" id="name" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="email" class="required">Email</label>
                    <input type="email" id="email" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="phone" class="required">Телефон</label>
                    <input type="tel" id="phone" class="form-control" required placeholder="+7 (___) ___-__-__">
                </div>
                
                <div class="form-group">
                    <label for="address" class="required">Адрес доставки</label>
                    <input type="text" id="address" class="form-control" required placeholder="Город, улица, дом, квартира">
                </div>
                
                <div class="form-group">
                    <label for="comment">Комментарий</label>
                    <textarea id="comment" class="form-control" placeholder="Дополнительная информация к заказу"></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary btn-submit-order">
                    <i class="fas fa-paper-plane"></i> Подтвердить заказ
                </button>
            </form>
        </div>
    `;
    
    container.innerHTML = cartHTML;
    
    // Установка обработчиков событий - ВЫЗЫВАЕМ КАЖДЫЙ РАЗ ПОСЛЕ РЕНДЕРИНГА
    setupCartEventListeners();
}

// ДЕЛЕГИРОВАНИЕ СОБЫТИЙ - КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ
function setupCartEventListeners() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    // Используем делегирование событий для всех кнопок
    container.addEventListener('click', function(e) {
        // Обработка кнопок удаления
        if (e.target.classList.contains('btn-remove') || e.target.closest('.btn-remove')) {
            const button = e.target.closest('.btn-remove');
            const sku = button.getAttribute('data-sku');
            window.cartManager.removeFromCart(sku);
            location.reload();
            return;
        }

        // Обработка кнопок уменьшения количества
        if (e.target.classList.contains('decrease') || e.target.closest('.decrease')) {
            const button = e.target.closest('.decrease');
            const sku = button.getAttribute('data-sku');
            const cartItem = window.cartManager.getCart().find(item => item.sku === sku);
            
            if (cartItem && cartItem.quantity > 1) {
                window.cartManager.updateCartItem(sku, cartItem.quantity - 1);
                location.reload();
            }
            return;
        }

        // Обработка кнопок увеличения количества
        if (e.target.classList.contains('increase') || e.target.closest('.increase')) {
            const button = e.target.closest('.increase');
            const sku = button.getAttribute('data-sku');
            const cartItem = window.cartManager.getCart().find(item => item.sku === sku);
            
            if (cartItem) {
                window.cartManager.updateCartItem(sku, cartItem.quantity + 1);
                location.reload();
            }
            return;
        }
    });

    // Обработка изменения инпутов количества через делегирование
    container.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            const input = e.target;
            const sku = input.getAttribute('data-sku');
            let newQuantity = parseInt(input.value);
            
            if (isNaN(newQuantity) || newQuantity < 1) {
                newQuantity = 1;
                input.value = 1;
            }
            
            window.cartManager.updateCartItem(sku, newQuantity);
            location.reload();
        }
    });

    // Обработка кнопки очистки корзины
    const clearCartBtn = container.querySelector('.btn-clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите очистить корзину?')) {
                window.cartManager.clearCart();
                location.reload();
            }
        });
    }
}

function setupOrderForm(products) {
    const orderForm = document.getElementById('order-form');
    if (!orderForm) return;
    
    orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Визуальная индикация загрузки
            const submitBtn = this.querySelector('.btn-submit-order');
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
            submitBtn.innerHTML = '<i class="fas fa-spinner"></i> Отправка...';
            
            // Получение данных формы
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                comment: document.getElementById('comment').value
            };
            
            // Получение товаров из корзины
            const cartItems = window.cartManager.getCart();
            const cartProducts = cartItems.map(cartItem => {
                const product = products.find(p => p.sku === cartItem.sku);
                if (!product) return null;
                return {
                    ...product,
                    quantity: cartItem.quantity,
                    total: product.price * cartItem.quantity
                };
            }).filter(item => item !== null);
            
            const totalPrice = cartProducts.reduce((sum, item) => sum + item.total, 0);
            
            // Проверка, что корзина не пуста
            if (cartProducts.length === 0) {
                throw new Error('Корзина пуста. Добавьте товары перед оформлением заказа.');
            }
            
            // Генерация ID заказа
            const orderId = `ORD-${Date.now()}`;
            
            // Текущая дата в формате DD.MM.YYYY
            const today = new Date();
            const date = today.toLocaleDateString('ru-RU');
            
            // Создание HTML-таблицы товаров для письма
            let productsTable = `
                <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Товар</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Цена</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Количество</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Сумма</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            cartProducts.forEach(item => {
                productsTable += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${item.name} (${item.material}, ${item.color})</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${item.price.toLocaleString()} ₽</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;">${item.total.toLocaleString()} ₽</td>
                    </tr>
                `;
            });
            
            productsTable += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>Итого:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>${totalPrice.toLocaleString()} ₽</strong></td>
                        </tr>
                    </tfoot>
                </table>
            `;
            
            // Данные для EmailJS
            const emailParams = {
                order_id: orderId,
                date: date,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                comment: formData.comment || 'Нет комментария',
                total: `${totalPrice.toLocaleString()} ₽`,
                products_table: productsTable
            };
            
            // Отправка письма
            await window.sendOrderEmail(emailParams);
            
            // Показ сообщения об успешном заказе
            document.getElementById('cart-items-container').innerHTML = `
                <div class="order-success">
                    <i class="fas fa-check-circle"></i>
                    <h2>Заказ успешно оформлен!</h2>
                    <p>Спасибо за покупку! Номер вашего заказа: <strong>${orderId}</strong></p>
                    <p>На ваш email <strong>${formData.email}</strong> отправлена подробная информация о заказе.</p>
                    <a href="index.html" class="btn btn-primary">Продолжить покупки</a>
                </div>
            `;
            
            // Очистка корзины
            window.cartManager.clearCart();
            
            // Обновление иконки корзины
            window.cartManager.updateCartIcon();
            
        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            alert(`Ошибка при оформлении заказа: ${error.message || 'Неизвестная ошибка'}`);
        } finally {
            // Восстановление кнопки
            const submitBtn = orderForm.querySelector('.btn-submit-order');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Подтвердить заказ';
            }
        }
    });
}
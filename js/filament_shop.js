// ===== ГЛАВНАЯ СТРАНИЦА МАГАЗИНА =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('Shop page initialized');
    
    const products = window.SHOP_PRODUCTS || [];
    const config = window.SHOP_CONFIG || {};
    
    // Инициализация
    initShop(products, config);
});

function initShop(products, config) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    // Рендеринг товаров
    renderProducts(products, config);
    
    // Инициализация фильтров
    initFilters(products);
    
    // Инициализация счетчика корзины
    cartManager.updateCartCounters();
}

function renderProducts(products, config) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    let html = '';
    
    products.forEach(product => {
        const imagePath = getProductImagePath(product, config);
        
        html += `
            <div class="product-card" data-material="${product.material}">
                <div class="product-badge ${product.material.toLowerCase()}">
                    ${product.material}
                </div>
                
                <div class="product-image">
                    <img src="${imagePath}" 
                         alt="${product.name} ${product.color}"
                         onerror="this.onerror=null; this.src='${config.defaultImage}'">
                    ${!product.inStock ? '<div class="out-of-stock">Nema na stanju</div>' : ''}
                </div>
                
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-color">${product.color}</div>
                    <div class="product-sku">${product.sku}</div>
                    
                    <div class="product-description">
                        ${product.description}
                    </div>
                    
                    <div class="product-price">
                        ${product.price}${config.currency} <span class="price-unit">/kg</span>
                    </div>
                    
                    ${product.inStock ? `
                    <div class="product-actions">
                        <div class="quantity-control">
                            <button class="qty-btn minus" data-id="${product.id}">-</button>
                            <input type="number" class="qty-input" value="1" min="1" max="10" data-id="${product.id}">
                            <button class="qty-btn plus" data-id="${product.id}">+</button>
                            <span class="qty-unit">kg</span>
                        </div>
                        <button class="add-to-cart-btn" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> U korpu
                        </button>
                    </div>
                    ` : `
                    <div class="product-out-of-stock">
                        <button class="notify-btn" data-id="${product.id}">
                            <i class="fas fa-bell"></i> Obavesti kada bude
                        </button>
                    </div>
                    `}
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
    
    // Добавляем обработчики событий
    addProductEventListeners();
}

function addProductEventListeners() {
    // Кнопки добавления в корзину
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const input = document.querySelector(`.qty-input[data-id="${productId}"]`);
            const quantity = parseInt(input.value) || 1;
            
            cartManager.addItem(productId, quantity);
            notificationManager.show('Proizvod dodat u korpu', 'success');
        });
    });
    
    // Кнопки изменения количества
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const input = document.querySelector(`.qty-input[data-id="${productId}"]`);
            let value = parseInt(input.value) + 1;
            if (value > 10) value = 10;
            input.value = value;
        });
    });
    
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const input = document.querySelector(`.qty-input[data-id="${productId}"]`);
            let value = parseInt(input.value) - 1;
            if (value < 1) value = 1;
            input.value = value;
        });
    });
    
    // Кнопка уведомления о поступлении
    document.querySelectorAll('.notify-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            const product = SHOP_PRODUCTS.find(p => p.id === productId);
            if (product) {
                notificationManager.show(`Obavestićemo vas kada ${product.name} ${product.color} bude na stanju`, 'info');
            }
        });
    });
}

function initFilters(products) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productsGrid = document.getElementById('productsGrid');
    
    if (!filterButtons.length || !productsGrid) return;
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            filterButtons.forEach(b => b.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            filterProducts(filter);
        });
    });
    
    function filterProducts(filter) {
        const allProducts = document.querySelectorAll('.product-card');
        
        if (filter === 'all') {
            allProducts.forEach(product => {
                product.style.display = 'block';
            });
        } else {
            allProducts.forEach(product => {
                if (product.dataset.material === filter) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        }
    }
}

function getProductImagePath(product, config) {
    if (!product || !config) return config.defaultImage;
    return `${config.imageBasePath}${product.sku}.jpg`;
}
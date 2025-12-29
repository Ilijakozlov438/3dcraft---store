// ===== КОНФИГУРАЦИЯ МАГАЗИНА =====
const CONFIG = {
    // Настройки путей к изображениям
    imageBasePath: 'slike/',
    defaultImage: 'slike/filament_default.jpg',
    
    // Контактная информация
    shopName: '3DCraft Shop',
    pickupAddress: "Makedonska 1A, Zemun, Beograd",
    workingHours: "Ponedeljak - Petak: 09:00-21:00",
    whatsappNumber: "381637797857",
    viberNumber: "381637797857",
    phoneNumber: "063 779 78 57",
    
    // Настройки магазина
    currency: '€',
    maxQuantityPerProduct: 10,
    freeShippingThreshold: 5, // кг для бесплатной доставки
    bulkOrderThreshold: 5 // кг для оптовой скидки
    
    // Можно добавить другие настройки:
    // taxRate: 0.20, // НДС
    // shippingCost: 0, // Стоимость доставки
    // minOrderAmount: 0, // Минимальная сумма заказа
}; // Конец CONFIG

// ===== АССОРТИМЕНТ ПРОДУКТОВ =====
const PRODUCTS = [
    // ABS Filaments
    {
        id: 'abs_black',
        name: 'ABS Filament',
        color: 'Crna',
        material: 'ABS',
        price: 15,
        sku: 'ABS-BL-1KG',
        weight: 1, // кг
        diameter: 1.75, // мм
        tolerance: '±0.05mm',
        description: 'Čvrst, otporan na toplotu. Idealno za funkcionalne delove, prototipove i delove koji će biti izloženi višim temperaturama.',
        characteristics: ['Otporan na toplotu', 'Čvrst', 'Lako se doraduje'],
        printTemp: '220-250°C',
        bedTemp: '90-110°C'
    },
    {
        id: 'abs_white',
        name: 'ABS Filament',
        color: 'Bela',
        material: 'ABS',
        price: 15,
        sku: 'ABS-WH-1KG',
        weight: 1,
        diameter: 1.75,
        tolerance: '±0.05mm',
        description: 'Beli ABS sa odličnim mehaničkim svojstvima. Lako se doraduje i boji. Savršen za završne proizvode.',
        characteristics: ['Glatka površina', 'Lako se boji', 'Odličan finish'],
        printTemp: '220-250°C',
        bedTemp: '90-110°C'
    },
    
    // PLA Filaments
    {
        id: 'pla_black',
        name: 'PLA Filament',
        color: 'Crna',
        material: 'PLA',
        price: 14,
        sku: 'PLA-BL-1KG',
        weight: 1,
        diameter: 1.75,
        tolerance: '±0.03mm',
        description: 'Lako štampanje, odličan finish. Biodegradabilan materijal, pogodan za početnike i opštu upotrebu.',
        characteristics: ['Biodegradabilan', 'Lako štampa', 'Mali skupljanje'],
        printTemp: '190-220°C',
        bedTemp: '50-60°C'
    },
    {
        id: 'pla_white',
        name: 'PLA Filament',
        color: 'Bela',
        material: 'PLA',
        price: 14,
        sku: 'PLA-WH-1KG',
        weight: 1,
        diameter: 1.75,
        tolerance: '±0.03mm',
        description: 'Beli PLA sa glatkom površinom. Idealno za prototipove, modele i dekorativne predmete.',
        characteristics: ['Glatka površina', 'Vivide boje', 'Nema mirisa'],
        printTemp: '190-220°C',
        bedTemp: '50-60°C'
    },
    
    // PETG Filaments
    {
        id: 'petg_black',
        name: 'PETG Filament',
        color: 'Crna',
        material: 'PETG',
        price: 16,
        sku: 'PETG-BL-1KG',
        weight: 1,
        diameter: 1.75,
        tolerance: '±0.05mm',
        description: 'Otpornost na udare i hemikalije. Fleksibilan, dobar za funkcionalne delove pod opterećenjem.',
        characteristics: ['Otporn na udare', 'Hemijski otporan', 'Fleksibilan'],
        printTemp: '230-250°C',
        bedTemp: '70-80°C'
    },
    {
        id: 'petg_white',
        name: 'PETG Filament',
        color: 'Bela',
        material: 'PETG',
        price: 16,
        sku: 'PETG-WH-1KG',
        weight: 1,
        diameter: 1.75,
        tolerance: '±0.05mm',
        description: 'Beli PETG - čvrst i otporan. Odličan za delove koji zahtevaju čistoću i dugotrajnost.',
        characteristics: ['Čisto bela boja', 'Otporn na habanje', 'Hranljiv'],
        printTemp: '230-250°C',
        bedTemp: '70-80°C'
    },
    
    // TPU Filaments
    {
        id: 'tpu_black',
        name: 'TPU Filament',
        color: 'Crna',
        material: 'TPU',
        price: 20,
        sku: 'TPU-BL-1KG',
        weight: 1,
        diameter: 1.75,
        tolerance: '±0.05mm',
        description: 'Fleksibilan, gumeni filament. Za usisnike, amortizere, brtve i druge fleksibilne delove.',
        characteristics: ['Fleksibilan', 'Otporn na habanje', 'Gumen'],
        printTemp: '210-230°C',
        bedTemp: '40-60°C'
    },
    
    // ASA Filaments
    {
        id: 'asa_black',
        name: 'ASA Filament',
        color: 'Crna',
        material: 'ASA',
        price: 18,
        sku: 'ASA-BL-1KG',
        weight: 1,
        diameter: 1.75,
        tolerance: '±0.05mm',
        description: 'Otpornost na UV zračenje i vremenske uslove. Za spoljnu upotrebu, automobile, baštu.',
        characteristics: ['UV otporan', 'Vremenski otporan', 'Za spoljnu upotrebu'],
        printTemp: '240-260°C',
        bedTemp: '90-110°C'
    },
    {
        id: 'asa_white',
        name: 'ASA Filament',
        color: 'Bela',
        material: 'ASA',
        price: 18,
        sku: 'ASA-WH-1KG',
        weight: 1,
        diameter: 1.75,
        tolerance: '±0.05mm',
        description: 'Beli ASA - otporan na sunce i kišu. Za spoljne aplikacije gde je potrebna dugotrajnost.',
        characteristics: ['Bela boja', 'Ne žuti na suncu', 'Za spoljnu upotrebu'],
        printTemp: '240-260°C',
        bedTemp: '90-110°C'
    }
];

// ===== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ КОНФИГУРАЦИИ =====

// Функция для получения продукта по ID
function getProductById(productId) {
    return PRODUCTS.find(product => product.id === productId);
}

// Функция для получения продуктов по материалу
function getProductsByMaterial(material) {
    return PRODUCTS.filter(product => product.material === material);
}

// Функция для получения всех доступных материалов
function getAllMaterials() {
    const materials = PRODUCTS.map(product => product.material);
    return [...new Set(materials)]; // Убираем дубликаты
}

// Функция для получения всех доступных цветов
function getAllColors() {
    const colors = PRODUCTS.map(product => product.color);
    return [...new Set(colors)];
}

// Экспортируем конфигурацию (если используем модули)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, PRODUCTS, getProductById, getProductsByMaterial, getAllMaterials, getAllColors };
}

// Делаем глобально доступным (для использования в HTML файлах)
if (typeof window !== 'undefined') {
    window.SHOP_CONFIG = CONFIG;
    window.SHOP_PRODUCTS = PRODUCTS;
    window.getProductById = getProductById;
    window.getProductsByMaterial = getProductsByMaterial;
    window.getAllMaterials = getAllMaterials;
    window.getAllColors = getAllColors;
}
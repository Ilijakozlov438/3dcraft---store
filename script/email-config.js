// Инициализация EmailJS
(function() {
    emailjs.init("nXNmmO8VA3sBS_E5F");
})();

// Функция отправки письма с заказом
async function sendOrderEmail(emailParams) {
    return new Promise((resolve, reject) => {
        // Отправка письма через EmailJS
        emailjs.send("service_1so94o3", "template_joohe9h", emailParams)
            .then(function(response) {
                console.log('Письмо успешно отправлено!', response.status, response.text);
                resolve(response);
            }, function(error) {
                console.error('Ошибка при отправке письма:', error);
                reject(new Error(`Не удалось отправить письмо: ${error.text}`));
            });
    });
}

// Экспорт функции для использования в cart.js
window.sendOrderEmail = sendOrderEmail;
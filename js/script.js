document.addEventListener('DOMContentLoaded', function () {

    // ========== НАСТРОЙКИ TELEGRAM-БОТА ==========
    // Токен и chat_id больше не используются напрямую в JS,
    // но оставлены для справки (вся логика теперь на сервере).
   // const TELEGRAM_BOT_TOKEN = '8320968608:AAGoXqKoeGLe6uPsdYPSisICjGOOdgO-6-0';
  //  const TELEGRAM_CHAT_ID = '403593894';

    // Функция отправки сообщения через ваш PHP-прокси
    async function sendToTelegram(text) {
        try {
            const response = await fetch('php/send-to-telegram.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });
            if (!response.ok) throw new Error('Server error');
            return true;
        } catch (error) {
            console.error('Ошибка отправки:', error);
            return false;
        }
    }

    // ========== MESSENGER FLOAT TOGGLE ==========
    const messengerToggle = document.getElementById('messengerToggle');
    const messengerList = document.getElementById('messengerList');
    const pulseRing = document.getElementById('pulseRing');
    let isOpen = false;

    messengerToggle.addEventListener('click', function () {
        isOpen = !isOpen;
        if (isOpen) {
            messengerList.classList.add('messenger-float__list--visible');
            messengerToggle.classList.add('messenger-float__toggle--open');
            messengerToggle.textContent = '✕';
            pulseRing.style.display = 'none';
        } else {
            messengerList.classList.remove('messenger-float__list--visible');
            messengerToggle.classList.remove('messenger-float__toggle--open');
            messengerToggle.textContent = '💬';
            pulseRing.style.display = 'block';
        }
    });

    document.addEventListener('click', function (e) {
        if (isOpen && !e.target.closest('.messenger-float')) {
            messengerList.classList.remove('messenger-float__list--visible');
            messengerToggle.classList.remove('messenger-float__toggle--open');
            messengerToggle.textContent = '💬';
            pulseRing.style.display = 'block';
            isOpen = false;
        }
    });

    // ========== MAIN REPAIR FORM ==========
    const repairForm = document.getElementById('repairForm');
    const formContent = document.getElementById('formContent');
    const formSuccess = document.getElementById('formSuccess');

    repairForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value.trim();

        if (!name || !phone) {
            alert('Пожалуйста, заполните обязательные поля: Имя и Телефон.');
            return;
        }
        if (phone.replace(/[\s\(\)\-\+]/g, '').length < 10) {
            alert('Пожалуйста, введите корректный номер телефона.');
            return;
        }

        const submitBtn = repairForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '⏳ Отправка...';
        submitBtn.disabled = true;

        const serviceMap = {
            'diagnostics': 'Диагностика',
            'laptop_repair': 'Ремонт ноутбука',
            'pc_repair': 'Ремонт ПК',
            'cleaning': 'Чистка / замена термопасты',
            'data_recovery': 'Восстановление данных',
            'software': 'Установка ПО',
            'urgent': 'Срочный ремонт',
            'other': 'Другое'
        };
        const serviceText = service ? (serviceMap[service] || service) : 'не указана';
        const telegramMessage = `🛠️ <b>Новая заявка с сайта!</b>\n\n👤 <b>Имя:</b> ${name}\n📞 <b>Телефон:</b> ${phone}\n🔧 <b>Услуга:</b> ${serviceText}\n📝 <b>Описание:</b> ${message || '—'}\n\n🕒 ${new Date().toLocaleString('ru-RU')}`;

        const sent = await sendToTelegram(telegramMessage);

        if (sent) {
            formContent.style.display = 'none';
            formSuccess.classList.add('show');
            repairForm.reset();
        } else {
            alert('Ошибка отправки. Попробуйте позже или позвоните нам.');
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        setTimeout(function () {
            formContent.style.display = 'block';
            formSuccess.classList.remove('show');
        }, 8000);
    });

    // ========== QUICK CALLBACK MODAL ==========
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const quickCallbackForm = document.getElementById('quickCallbackForm');
    const modalSuccess = document.getElementById('modalSuccess');

    modalClose.addEventListener('click', function () {
        modalOverlay.classList.remove('modal-overlay--open');
        setTimeout(() => {
            modalSuccess.style.display = 'none';
            quickCallbackForm.style.display = 'block';
            quickCallbackForm.reset();
        }, 300);
    });

    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('modal-overlay--open');
            setTimeout(() => {
                modalSuccess.style.display = 'none';
                quickCallbackForm.style.display = 'block';
                quickCallbackForm.reset();
            }, 300);
        }
    });

    quickCallbackForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const modalName = document.getElementById('modalName').value.trim();
        const modalPhone = document.getElementById('modalPhone').value.trim();

        if (!modalPhone || modalPhone.replace(/[\s\(\)\-\+]/g, '').length < 10) {
            alert('Пожалуйста, введите корректный номер телефона.');
            return;
        }

        const submitBtn = quickCallbackForm.querySelector('button[type="submit"]');
        submitBtn.textContent = '⏳ Отправка...';
        submitBtn.disabled = true;

        const telegramMessage = `📞 <b>Заказ звонка с сайта!</b>\n\n👤 <b>Имя:</b> ${modalName || 'не указано'}\n📞 <b>Телефон:</b> ${modalPhone}\n🕒 ${new Date().toLocaleString('ru-RU')}`;

        const sent = await sendToTelegram(telegramMessage);

        if (sent) {
            quickCallbackForm.style.display = 'none';
            modalSuccess.style.display = 'block';
            quickCallbackForm.reset();
            setTimeout(() => {
                modalOverlay.classList.remove('modal-overlay--open');
                setTimeout(() => {
                    modalSuccess.style.display = 'none';
                    quickCallbackForm.style.display = 'block';
                }, 300);
            }, 3000);
        } else {
            alert('Ошибка отправки. Попробуйте позже.');
        }

        submitBtn.textContent = '🔔 Жду звонка';
        submitBtn.disabled = false;
    });

    // ========== SMOOTH SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ========== PHONE MASK ==========
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function () {
            let val = this.value.replace(/[^\d]/g, '');
            if (val.length > 11) val = val.slice(0, 11);
            if (val.length === 0) { this.value = ''; return; }
            if (val.startsWith('7') || val.startsWith('8')) {
                let formatted = '+7 (';
                if (val.length > 1) formatted += val.slice(1, 4);
                if (val.length >= 5) formatted += ') ' + val.slice(4, 7);
                if (val.length >= 8) formatted += '-' + val.slice(7, 9);
                if (val.length >= 10) formatted += '-' + val.slice(9, 11);
                this.value = formatted;
            } else {
                this.value = '+7 (' + val.slice(0, 3) + ') ' + val.slice(3, 6) + '-' + val.slice(6, 8) + '-' + val.slice(8, 10);
            }
        });
    });

    console.log('🚀 КомпСервис39 — сайт готов к работе. Отправка через серверный прокси.');
});
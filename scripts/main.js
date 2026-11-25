(function () {
    'use strict';

    /* ==================== МОБИЛЬНОЕ МЕНЮ ==================== */
    const burger = document.getElementById('burger');
    const mobileNav = document.getElementById('mobile-nav');

    burger.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
        });
    });

    /* ==================== ПОЯВЛЕНИЕ ПРИ ПРОКРУТКЕ ==================== */
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealEls = document.querySelectorAll('.reveal');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => io.observe(el));
    }

        /* ==================== SLIDE STACKING ==================== */
        /* ==================== SLIDE STACKING ==================== */
    /* transform-origin: top center в CSS + отсутствие lift в JS:
       вторая карточка сжимается от верхнего края, верх остаётся
       на top: 0, низ поднимается — третья накрывает её снизу.
       Ничего не торчит сверху. */
    const chapters = Array.from(document.querySelectorAll('.chapter'));
    const isMobile = () => window.innerWidth <= 720;

    if (chapters.length > 1 && !reduceMotion) {
        let rafId = null;

        const updateChapters = () => {
            rafId = null;
            if (isMobile()) return;

            const vh = window.innerHeight;

            chapters.forEach((chapter, i) => {
                // Последняя глава не уходит вглубь
                if (i === chapters.length - 1) {
                    chapter.style.transform = '';
                    chapter.style.borderRadius = '';
                    return;
                }

                const next = chapters[i + 1];
                const nextTop = next.getBoundingClientRect().top;
                const progress = Math.min(Math.max((vh - nextTop) / vh, 0), 1);

                const scale = 1 - progress * 0.06;   // 1 → 0.94
                const radius = progress * 12;        // 0 → 12px

                // lift убран: верх карточки должен остаться на top: 0
                chapter.style.transform = `scale(${scale})`;
                chapter.style.borderRadius = `${radius}px`;
            });
        };

        const onScroll = () => {
            if (rafId === null) {
                rafId = requestAnimationFrame(updateChapters);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        updateChapters();
    }

    /* ==================== ФОРМА ==================== */
    const form = document.getElementById('lead-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const consent = document.getElementById('consent');
    const submitBtn = document.getElementById('submit-btn');
    const formBody = document.getElementById('form-body');
    const formSuccess = document.getElementById('form-success');
    const successEmail = document.getElementById('success-email');
    const resetBtn = document.getElementById('reset-form');

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Zа-яА-Я]{2,}$/;
    const PHONE_RE = /^[+]?[0-9\s\-()]{10,18}$/;

    function setError(input, errorEl, message) {
        if (message) {
            input.classList.add('is-invalid');
            input.setAttribute('aria-invalid', 'true');
            errorEl.textContent = message;
            errorEl.classList.add('is-visible');
        } else {
            input.classList.remove('is-invalid');
            input.removeAttribute('aria-invalid');
            errorEl.textContent = '';
            errorEl.classList.remove('is-visible');
        }
    }

    function syncSubmitState() {
        submitBtn.disabled = !consent.checked;
    }
    consent.addEventListener('change', syncSubmitState);
    syncSubmitState();

    nameInput.addEventListener('blur', () => {
        if (nameInput.value.trim() === '') return;
        setError(nameInput, document.getElementById('name-error'),
            nameInput.value.trim().length < 2 ? 'Минимум 2 символа' : '');
    });

    emailInput.addEventListener('blur', () => {
        if (emailInput.value.trim() === '') return;
        setError(emailInput, document.getElementById('email-error'),
            EMAIL_RE.test(emailInput.value.trim()) ? '' : 'Проверьте формат email');
    });

    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value.trim() === '') return;
        setError(phoneInput, document.getElementById('phone-error'),
            PHONE_RE.test(phoneInput.value.trim()) ? '' : 'Проверьте номер телефона');
    });

    function validate() {
        let ok = true;
        let firstInvalid = null;

        const nameVal = nameInput.value.trim();
        if (nameVal.length < 2) {
            setError(nameInput, document.getElementById('name-error'),
                nameVal === '' ? 'Укажите имя' : 'Имя не короче 2 символов');
            ok = false;
            firstInvalid = firstInvalid || nameInput;
        } else {
            setError(nameInput, document.getElementById('name-error'), '');
        }

        const emailVal = emailInput.value.trim();
        if (emailVal === '') {
            setError(emailInput, document.getElementById('email-error'), 'Укажите email');
            ok = false;
            firstInvalid = firstInvalid || emailInput;
        } else if (!EMAIL_RE.test(emailVal)) {
            setError(emailInput, document.getElementById('email-error'), 'Проверьте формат email');
            ok = false;
            firstInvalid = firstInvalid || emailInput;
        } else {
            setError(emailInput, document.getElementById('email-error'), '');
        }

        const phoneVal = phoneInput.value.trim();
        if (phoneVal === '') {
            setError(phoneInput, document.getElementById('phone-error'), 'Укажите телефон');
            ok = false;
            firstInvalid = firstInvalid || phoneInput;
        } else if (!PHONE_RE.test(phoneVal)) {
            setError(phoneInput, document.getElementById('phone-error'), 'Проверьте номер');
            ok = false;
            firstInvalid = firstInvalid || phoneInput;
        } else {
            setError(phoneInput, document.getElementById('phone-error'), '');
        }

        if (!consent.checked) {
            setError(consent, document.getElementById('consent-error'),
                'Без согласия на обработку данных заявку отправить нельзя');
            ok = false;
            firstInvalid = firstInvalid || consent;
        } else {
            setError(consent, document.getElementById('consent-error'), '');
        }

        if (firstInvalid) {
            firstInvalid.focus({ preventScroll: true });
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return ok;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (document.getElementById('company').value !== '') return;
        if (!validate()) return;

        const payload = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            role: (form.querySelector('input[name="role"]:checked') || {}).value || 'author',
            consent: true,
            source: 'landing_flight_pz3',
            ts: new Date().toISOString()
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляем…';

        try {
            // ЗАГЛУШКА: замените на реальный fetch('/api/lead', ...)
            console.log('[lead] payload:', payload);
            await new Promise(r => setTimeout(r, 650));

            successEmail.textContent = payload.email;
            formBody.style.display = 'none';
            formSuccess.classList.add('is-visible');
        } catch (err) {
            console.error('[lead] error:', err);
            setError(emailInput, document.getElementById('email-error'),
                'Не удалось отправить. Попробуйте ещё раз.');
            submitBtn.textContent = 'Получить гайд и прайс';
            syncSubmitState();
        }
    });

    resetBtn.addEventListener('click', () => {
        form.reset();
        setError(nameInput, document.getElementById('name-error'), '');
        setError(emailInput, document.getElementById('email-error'), '');
        setError(phoneInput, document.getElementById('phone-error'), '');
        setError(consent, document.getElementById('consent-error'), '');
        formSuccess.classList.remove('is-visible');
        formBody.style.display = '';
        submitBtn.textContent = 'Получить гайд и прайс';
        syncSubmitState();
        nameInput.focus();
    });

})();
// Lumina Hotel Interactive Script with Backend Integration
class LuminaHotel {
    constructor() {
        this.apiBaseUrl = window.LUMINA_API_BASE_URL || 'http://localhost:4000';
        this.roomsCache = null;
        this.init();
    }

    init() {
        this.addLoadingAnimation();
        this.setupNavigation();
        this.setupScrollEffects();
        this.addInteractiveLights();
        this.setupFormEnhancements();
        this.loadDynamicContent();
    }

    addLoadingAnimation() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 1s ease-in';
        window.addEventListener('load', () => {
            requestAnimationFrame(() => {
                document.body.style.opacity = '1';
            });
        });
    }

    async loadDynamicContent() {
        const tasks = [];
        if (document.querySelector('.rooms-grid')) {
            tasks.push(this.populateRoomsGrid());
        }
        if (document.querySelector('[data-room-select]')) {
            tasks.push(this.populateRoomSelect());
        }

        try {
            await Promise.all(tasks);
            this.setupRoomCards();
        } catch (error) {
            console.error('Error loading dynamic content', error);
        }
    }

    setupNavigation() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (event) => {
                const targetSelector = anchor.getAttribute('href');
                if (!targetSelector || targetSelector === '#') return;

                const target = document.querySelector(targetSelector);
                if (target) {
                    event.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        const navbar = document.querySelector('.navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    navbar.style.background = 'rgba(10, 10, 10, 0.95)';
                } else {
                    navbar.style.background = 'rgba(10, 10, 10, 0.9)';
                }
            });
        }
    }

    setupScrollEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            const lightBeam = document.querySelector('.light-beam-bg');

            if (hero && lightBeam) {
                hero.style.transform = `translateY(${scrolled * 0.3}px)`;
                lightBeam.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('section').forEach((section) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(50px)';
            section.style.transition = 'all 0.8s ease-out';
            observer.observe(section);
        });
    }

    setupRoomCards() {
        const roomCards = document.querySelectorAll('.room-card');
        roomCards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                this.createHoverEffect(card);
            });

            card.addEventListener('click', () => {
                this.selectRoom(card);
            });
        });
    }

    setupFormEnhancements() {
        const bookingForm = document.querySelector('.booking-form form');
        if (!bookingForm) return;

        bookingForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleBookingSubmission(bookingForm);
        });

        bookingForm.querySelectorAll('input, select').forEach((input) => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    async populateRoomsGrid() {
        const grid = document.querySelector('.rooms-grid');
        if (!grid) return;

        try {
            const rooms = await this.fetchJson('/api/v1/rooms');
            this.roomsCache = rooms;

            if (!Array.isArray(rooms) || rooms.length === 0) {
                grid.innerHTML = '<p class="no-data">Suites are being curated. Please check back soon.</p>';
                return;
            }

            grid.innerHTML = rooms.map((room) => `
                <div class="room-card" data-room-id="${room.id}" data-room-name="${room.name}">
                    <div class="room-image">
                        <img src="${(room.images && room.images[0]) || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop&crop=center'}" alt="${room.name}" />
                        <div class="room-glow"></div>
                    </div>
                    <div class="room-info">
                        <h3>${room.name}</h3>
                        <p>${room.description}</p>
                        <div class="room-features">
                            ${(room.highlights || []).slice(0, 3).map((highlight) => `<span>${highlight}</span>`).join('')}
                        </div>
                        <div class="room-price">${this.formatCurrency(room.price)}/night</div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading rooms', error);
            grid.innerHTML = '<p class="error">Unable to load suites right now. Please refresh the page.</p>';
        }
    }

    async populateRoomSelect() {
        const select = document.querySelector('[data-room-select]');
        if (!select) return;

        try {
            const rooms = this.roomsCache || await this.fetchJson('/api/v1/rooms');
            this.roomsCache = rooms;

            const optionsHtml = ['<option value="" disabled selected>Select Room Type</option>']
                .concat((rooms || []).map((room) => `<option value="${room.id}">${room.name} — ${this.formatCurrency(room.price)} / night</option>`));
            select.innerHTML = optionsHtml.join('');
        } catch (error) {
            console.error('Error loading room options', error);
            select.innerHTML = '<option value="" disabled selected>Rooms unavailable</option>';
        }
    }

    async handleBookingSubmission(form) {
        const formData = new FormData(form);
        const bookingData = {};
        formData.forEach((value, key) => {
            bookingData[key] = typeof value === 'string' ? value.trim() : value;
        });

        const messageEl = form.querySelector('.form-message');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        const checkIn = new Date(bookingData.checkIn);
        const checkOut = new Date(bookingData.checkOut);

        if (Number.isNaN(checkIn.valueOf()) || Number.isNaN(checkOut.valueOf())) {
            this.updateFormMessage(messageEl, 'Please provide valid check-in and check-out dates.', 'error');
            return;
        }

        if (!bookingData.roomId) {
            this.updateFormMessage(messageEl, 'Please select a suite before submitting.', 'error');
            return;
        }

        const payload = {
            roomId: Number.parseInt(bookingData.roomId, 10),
            customerName: bookingData.customerName,
            customerEmail: bookingData.customerEmail,
            customerPhone: bookingData.customerPhone || undefined,
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            guests: Number(bookingData.guests || 1),
            notes: bookingData.notes || undefined,
        };

        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        this.updateFormMessage(messageEl, 'Submitting your reservation...', 'info');

        try {
            await this.fetchJson('/api/v1/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            form.reset();
            this.updateFormMessage(messageEl, 'Reservation request received. Our concierge will contact you shortly.', 'success');
            this.showBookingConfirmation();
        } catch (error) {
            console.error('Booking error', error);
            this.updateFormMessage(messageEl, error.message || 'Unable to submit booking. Please try again later.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    validateField(field) {
        const isValid = field.checkValidity();
        if (isValid) {
            field.style.borderColor = 'rgba(184, 225, 255, 0.5)';
            field.style.boxShadow = '0 0 5px rgba(184, 225, 255, 0.3)';
        } else {
            field.style.borderColor = 'rgba(255, 100, 100, 0.5)';
            field.style.boxShadow = '0 0 5px rgba(255, 100, 100, 0.3)';
        }

        setTimeout(() => {
            field.style.borderColor = 'rgba(184, 225, 255, 0.2)';
            field.style.boxShadow = 'none';
        }, 2000);
    }

    updateFormMessage(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = `form-message ${type}`;
    }

    showBookingConfirmation() {
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.innerHTML = `
            <div class="booking-modal__content">
                <h2>Booking Confirmed!</h2>
                <p>Thank you for choosing Lumina Hotel. Your reservation request has been received.</p>
                <button type="button" class="booking-modal__close">Close</button>
            </div>
        `;

        modal.querySelector('.booking-modal__close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
        setTimeout(() => modal.remove(), 5000);
    }

    createHoverEffect(card) {
        const sparkle = document.createElement('div');
        sparkle.className = 'room-sparkle';
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(184, 225, 255, 0.8);
            border-radius: 50%;
            pointer-events: none;
            animation: sparkleFloat 2s ease-out forwards;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            box-shadow: 0 0 10px rgba(184, 225, 255, 0.6);
        `;

        card.style.position = 'relative';
        card.appendChild(sparkle);

        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.remove();
            }
        }, 2000);

        if (!document.querySelector('#sparkle-style')) {
            const style = document.createElement('style');
            style.id = 'sparkle-style';
            style.textContent = `
                @keyframes sparkleFloat {
                    0% {
                        opacity: 0;
                        transform: scale(0) translateY(0);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1) translateY(-20px);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0) translateY(-40px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    selectRoom(card) {
        const roomName = card.getAttribute('data-room-name');
        const bookingFormContainer = document.querySelector('.booking-form');
        if (!bookingFormContainer) return;

        bookingFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const roomSelect = bookingFormContainer.querySelector('select[name="roomId"]');
        if (roomSelect && roomName) {
            [...roomSelect.options].forEach((option) => {
                option.selected = option.text.includes(roomName);
            });

            roomSelect.style.borderColor = '#B8E1FF';
            roomSelect.style.boxShadow = '0 0 15px rgba(184, 225, 255, 0.4)';
            setTimeout(() => {
                roomSelect.style.borderColor = 'rgba(184, 225, 255, 0.2)';
                roomSelect.style.boxShadow = 'none';
            }, 2000);
        }
    }

    addInteractiveLights() {
        document.addEventListener('mousemove', (event) => {
            const x = event.clientX / window.innerWidth;
            const y = event.clientY / window.innerHeight;

            const lightBeam = document.querySelector('.light-beam');
            if (lightBeam) {
                const tilt = (x - 0.5) * 1;
                lightBeam.style.transform = `translateX(-50%) rotate(${tilt}deg)`;
            }

            const grid = document.querySelector('.grid-background');
            if (grid) {
                const intensity = 0.3 + (1 - y) * 0.2;
                grid.style.opacity = intensity;
            }
        });
    }

    async fetchJson(path, options = {}) {
        const url = path.startsWith('http') ? path : `${this.apiBaseUrl}${path}`;
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(errorText || `Request failed with status ${response.status}`);
        }
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return response.json();
        }
        return response.text();
    }

    formatCurrency(amount) {
        if (typeof amount === 'object' && amount !== null && 'toString' in amount) {
            amount = Number(amount);
        }
        if (Number.isNaN(Number(amount))) return '$—';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(Number(amount));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LuminaHotel();
});

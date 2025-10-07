(function () {
  const api = window.LuminaAPI;
  if (!api) return;

  const filtersContainer = document.querySelector('[data-gallery-filters]');
  const gridContainer = document.querySelector('[data-gallery-grid]');
  const testimonialsContainer = document.querySelector('[data-gallery-testimonials]');

  if (!filtersContainer && !gridContainer && !testimonialsContainer) return;

  let galleryItems = [];
  let currentFilter = 'ALL';

  function buildFilters(items) {
    if (!filtersContainer) return;

    const categories = Array.from(
      new Set(items.map((item) => item.category || 'OTHER'))
    ).sort();

    const fragment = document.createDocumentFragment();

    const addButton = (label, value) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-btn' + (value === currentFilter ? ' active' : '');
      button.dataset.filter = value;
      button.textContent = label;
      button.addEventListener('click', () => {
        currentFilter = value;
        renderGallery();
        filtersContainer.querySelectorAll('button').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
      });
      fragment.appendChild(button);
    };

    addButton('All', 'ALL');
    categories.forEach((category) => {
      addButton(category.replace(/_/g, ' '), category);
    });

    filtersContainer.innerHTML = '';
    filtersContainer.appendChild(fragment);
  }

  function renderGallery() {
    if (!gridContainer) return;

    const visible = galleryItems.filter((item) => {
      if (currentFilter === 'ALL') return true;
      return (item.category || 'OTHER') === currentFilter;
    });

    if (visible.length === 0) {
      gridContainer.innerHTML = '<p class="no-data">No imagery available in this category.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    visible.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'gallery-item' + (item.category === 'EXTERIOR' ? ' large' : '');
      card.dataset.category = item.category || 'OTHER';
      card.innerHTML = `
        <div class="photo-placeholder">
          <img src="${item.imageUrl}" alt="${item.title}" />
        </div>
        <div class="gallery-overlay">
          <h3>${item.title}</h3>
          <p>${item.caption || 'Captured at Lumina Hotel'}</p>
        </div>
      `;
      fragment.appendChild(card);
    });

    gridContainer.innerHTML = '';
    gridContainer.appendChild(fragment);
  }

  function renderTestimonials(testimonials) {
    if (!testimonialsContainer) return;

    if (!Array.isArray(testimonials) || testimonials.length === 0) {
      testimonialsContainer.innerHTML = '<p class="no-data">Guest stories will appear soon.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    testimonials.slice(0, 4).forEach((testimonial) => {
      const card = document.createElement('blockquote');
      card.className = 'testimonial-card';
      card.innerHTML = `
        <p class="quote">“${testimonial.content}”</p>
        <footer class="author">${testimonial.guestName || 'Lumina Guest'}</footer>
      `;
      fragment.appendChild(card);
    });

    testimonialsContainer.innerHTML = '';
    testimonialsContainer.appendChild(fragment);
  }

  async function init() {
    try {
      const [gallery, testimonials] = await Promise.all([
        api.fetchJson('/api/v1/gallery'),
        api.fetchJson('/api/v1/testimonials?limit=4').catch(() => []),
      ]);

      galleryItems = Array.isArray(gallery) ? gallery : [];
      buildFilters(galleryItems);
      renderGallery();
      renderTestimonials(Array.isArray(testimonials) ? testimonials : []);
    } catch (error) {
      console.error('Unable to load gallery data', error);
      if (filtersContainer) filtersContainer.innerHTML = '<p class="error">Unable to load filters.</p>';
      if (gridContainer) gridContainer.innerHTML = '<p class="error">Unable to load gallery images.</p>';
      if (testimonialsContainer) testimonialsContainer.innerHTML = '<p class="error">Unable to load guest stories.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();

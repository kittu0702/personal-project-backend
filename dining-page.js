(function () {
  const api = window.LuminaAPI;
  if (!api) return;

  const featuredContainer = document.querySelector('[data-dining-featured]');
  const gridContainer = document.querySelector('[data-dining-grid]');

  if (!featuredContainer && !gridContainer) return;

  function renderFeatured(venues) {
    if (!featuredContainer) return;

    if (!Array.isArray(venues) || venues.length === 0) {
      featuredContainer.innerHTML = '<p class="no-data">Dining experiences are being curated. Please check back soon.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    venues.forEach((venue, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'restaurant-detail';

      const content = document.createElement('div');
      content.className = 'restaurant-content' + (index % 2 === 1 ? ' reverse' : '');

      const info = document.createElement('div');
      info.className = 'restaurant-info';
      info.innerHTML = `
        <h2>${venue.name}</h2>
        <div class="restaurant-type">${venue.type || 'Dining'} • Floor ${venue.floor || '—'}</div>
        <div class="restaurant-hours">${venue.hours || 'Open daily'}</div>
        <p class="restaurant-description">${venue.description || 'A curated dining experience awaits.'}</p>
      `;

      const featuresWrapper = document.createElement('div');
      featuresWrapper.className = 'restaurant-features';
      (venue.features || []).forEach((feature) => {
        const featureEl = document.createElement('div');
        featureEl.className = 'feature';
        featureEl.innerHTML = `
          <span class="feature-icon">✨</span>
          <span>${feature}</span>
        `;
        featuresWrapper.appendChild(featureEl);
      });

      if (!featuresWrapper.childElementCount) {
        featuresWrapper.innerHTML = '<p class="no-data">Highlights coming soon.</p>';
      }

      const menuUrl = venue.menuUrl ? `<a href="${venue.menuUrl}" target="_blank" rel="noopener" class="btn-secondary">View Menu</a>` : '';
      const cta = document.createElement('div');
      cta.className = 'restaurant-cta';
      cta.innerHTML = `
        ${menuUrl}
        <button class="btn-primary" type="button" data-reserve="${venue.name}">Reserve</button>
      `;

      info.appendChild(featuresWrapper);
      info.appendChild(cta);

      const gallery = document.createElement('div');
      gallery.className = 'restaurant-gallery';

      const mainImage = document.createElement('div');
      mainImage.className = 'main-image';
      const primaryImage = (venue.images && venue.images[0]) || 'https://images.unsplash.com/photo-1543352634-873f17a7a088?w=900';
      mainImage.innerHTML = `
        <div class="photo-placeholder">
          <img src="${primaryImage}" alt="${venue.name} primary" />
        </div>
      `;

      const thumbnails = document.createElement('div');
      thumbnails.className = 'gallery-thumbnails';
      (venue.images || []).slice(1, 4).forEach((url, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'photo-placeholder';
        thumb.innerHTML = `<img src="${url}" alt="${venue.name} gallery ${idx + 1}" />`;
        thumbnails.appendChild(thumb);
      });

      if (!thumbnails.childElementCount) {
        thumbnails.innerHTML = '<div class="photo-placeholder"><span>Gallery coming soon</span></div>';
      }

      gallery.appendChild(mainImage);
      gallery.appendChild(thumbnails);

      if (index % 2 === 1) {
        content.appendChild(gallery);
        content.appendChild(info);
      } else {
        content.appendChild(info);
        content.appendChild(gallery);
      }

      wrapper.appendChild(content);
      fragment.appendChild(wrapper);
    });

    featuredContainer.innerHTML = '';
    featuredContainer.appendChild(fragment);

    featuredContainer.querySelectorAll('[data-reserve]').forEach((button) => {
      button.addEventListener('click', () => {
        window.location.href = 'index.html#contact';
      });
    });
  }

  function renderGrid(venues) {
    if (!gridContainer) return;

    if (!Array.isArray(venues) || venues.length === 0) {
      gridContainer.innerHTML = '<p class="no-data">Additional dining options will be announced soon.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    venues.forEach((venue) => {
      const card = document.createElement('div');
      card.className = 'dining-card';
      const image = (venue.images && venue.images[0]) || 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600';
      card.innerHTML = `
        <div class="photo-placeholder">
          <img src="${image}" alt="${venue.name}" />
        </div>
        <h3>${venue.name}</h3>
        <p>${venue.description || 'Experience elevated cuisine crafted by our culinary team.'}</p>
        <div class="dining-hours">${venue.hours || 'Open daily'}</div>
      `;
      fragment.appendChild(card);
    });

    gridContainer.innerHTML = '';
    gridContainer.appendChild(fragment);
  }

  async function init() {
    try {
      const venues = await api.fetchJson('/api/v1/dining');
      const featured = venues.slice(0, 4);
      const additional = venues.slice(4);

      renderFeatured(featured);
      renderGrid(additional);
    } catch (error) {
      console.error('Unable to load dining data', error);
      if (featuredContainer) {
        featuredContainer.innerHTML = '<p class="error">Unable to load dining experiences. Please refresh the page.</p>';
      }
      if (gridContainer) {
        gridContainer.innerHTML = '<p class="error">Unable to load additional dining options.</p>';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();

(function () {
  const api = window.LuminaAPI;
  if (!api) return;

  const featuredContainer = document.querySelector('[data-amenities-featured]');
  const gridContainer = document.querySelector('[data-amenities-grid]');

  if (!featuredContainer && !gridContainer) return;

  function renderFeatured(featured) {
    if (!featuredContainer) return;

    if (!Array.isArray(featured) || featured.length === 0) {
      featuredContainer.innerHTML = '<p class="no-data">Signature amenities are being curated. Please check back soon.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    featured.forEach((item, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'amenity-detail';

      const content = document.createElement('div');
      content.className = 'amenity-content' + (index % 2 === 1 ? ' reverse' : '');

      const info = document.createElement('div');
      info.className = 'amenity-info';
      info.innerHTML = `
        <h2>${item.name}</h2>
        <div class="amenity-hours">${item.hours || 'Open daily'}</div>
        <p class="amenity-description">${item.description || 'Experience elevated hospitality.'}</p>
      `;

      const featuresWrapper = document.createElement('div');
      featuresWrapper.className = 'amenity-features';
      const highlights = [
        item.category ? `${item.category.replace(/_/g, ' ')} experience` : null,
        item.hours ? `Hours: ${item.hours}` : null,
      ].filter(Boolean);

      if (item.images && item.images.length > 1) {
        highlights.push('Immersive photo gallery');
      }

      if (highlights.length === 0) {
        featuresWrapper.innerHTML = '<p class="no-data">Highlights coming soon.</p>';
      } else {
        highlights.forEach((highlight) => {
          const featureEl = document.createElement('div');
          featureEl.className = 'feature';
          featureEl.innerHTML = `
            <span class="feature-icon">✨</span>
            <span>${highlight}</span>
          `;
          featuresWrapper.appendChild(featureEl);
        });
      }

      info.appendChild(featuresWrapper);

      const gallery = document.createElement('div');
      gallery.className = 'amenity-gallery';

      const mainImage = document.createElement('div');
      mainImage.className = 'main-image';
      const primaryImage = (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1562072541-88ec2c73a470?w=800';
      mainImage.innerHTML = `
        <div class="photo-placeholder">
          <img src="${primaryImage}" alt="${item.name} primary" />
        </div>
      `;

      const thumbnails = document.createElement('div');
      thumbnails.className = 'gallery-thumbnails';
      (item.images || []).slice(1, 4).forEach((url, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'photo-placeholder';
        thumb.innerHTML = `<img src="${url}" alt="${item.name} gallery ${idx + 1}" />`;
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
  }

  function renderGrid(amenities) {
    if (!gridContainer) return;

    if (!Array.isArray(amenities) || amenities.length === 0) {
      gridContainer.innerHTML = '<p class="no-data">Amenities are being curated. Please check back soon.</p>';
      return;
    }

    const grouped = api.groupBy(amenities, (item) => item.category || 'OTHER');
    const fragment = document.createDocumentFragment();

    Object.entries(grouped).forEach(([category, items]) => {
      const sectionHeading = document.createElement('h3');
      sectionHeading.className = 'subsection-title';
      sectionHeading.textContent = category.replace(/_/g, ' ');
      fragment.appendChild(sectionHeading);

      const row = document.createElement('div');
      row.className = 'amenities-grid-row';

      items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'amenity-card';
        const image = (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600';
        card.innerHTML = `
          <div class="photo-placeholder">
            <img src="${image}" alt="${item.name}" />
          </div>
          <h3>${item.name}</h3>
          <p>${item.description || 'Details coming soon.'}</p>
          <p class="amenity-hours">${item.hours || 'Open daily'}</p>
        `;
        row.appendChild(card);
      });

      fragment.appendChild(row);
    });

    gridContainer.innerHTML = '';
    gridContainer.appendChild(fragment);
  }

  async function init() {
    try {
      const amenities = await api.fetchJson('/api/v1/amenities');
      const featured = amenities.slice(0, 4);
      const remaining = amenities.slice(4);

      renderFeatured(featured);
      renderGrid(remaining);
    } catch (error) {
      console.error('Unable to load amenities data', error);
      if (featuredContainer) {
        featuredContainer.innerHTML = '<p class="error">Unable to load amenities. Please refresh the page.</p>';
      }
      if (gridContainer) {
        gridContainer.innerHTML = '<p class="error">Unable to load additional services.</p>';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();

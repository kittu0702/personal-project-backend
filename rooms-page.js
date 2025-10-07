(function () {
  const api = window.LuminaAPI;
  if (!api) return;

  const detailedContainer = document.querySelector('[data-rooms-detailed]');
  const comparisonContainer = document.querySelector('[data-room-comparison]');

  if (!detailedContainer && !comparisonContainer) return;

  function renderDetailed(rooms) {
    if (!detailedContainer) return;

    if (!Array.isArray(rooms) || rooms.length === 0) {
      detailedContainer.innerHTML = '<p class="error">Suites are being curated. Please check back soon.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    rooms.forEach((room, index) => {
      const detail = document.createElement('div');
      detail.className = 'room-detail';

      const content = document.createElement('div');
      content.className = 'room-content' + (index % 2 === 1 ? ' reverse' : '');

      const info = document.createElement('div');
      info.className = 'room-info';
      info.innerHTML = `
        <h2>${room.name}</h2>
        <div class="room-price">${api.formatCurrency(room.price)}<span>/night</span></div>
        <p class="room-description">${room.description}</p>
      `;

      const featuresWrapper = document.createElement('div');
      featuresWrapper.className = 'room-features-detailed';
      (room.highlights || []).slice(0, 4).forEach((highlight) => {
        const feature = document.createElement('div');
        feature.className = 'feature';
        feature.innerHTML = `
          <span class="feature-icon">✨</span>
          <div>
            <h4>${highlight}</h4>
            <p>Included with your stay</p>
          </div>
        `;
        featuresWrapper.appendChild(feature);
      });
      if (!featuresWrapper.childElementCount) {
        featuresWrapper.innerHTML = '<p class="no-data">Signature amenities coming soon.</p>';
      }

      const meta = document.createElement('div');
      meta.className = 'room-meta';
      meta.innerHTML = `
        <p><strong>Size:</strong> ${room.sizeSqm ? `${room.sizeSqm} m²` : '—'}</p>
        <p><strong>Guests:</strong> ${room.occupancy || '—'}</p>
        <p><strong>Floor:</strong> ${room.floor || '—'}</p>
      `;

      const bookButton = document.createElement('button');
      bookButton.className = 'btn-primary';
      bookButton.type = 'button';
      bookButton.textContent = `Book ${room.name}`;
      bookButton.addEventListener('click', () => {
        window.location.href = 'index.html#contact';
      });

      info.appendChild(featuresWrapper);
      info.appendChild(meta);
      info.appendChild(bookButton);

      const gallery = document.createElement('div');
      gallery.className = 'room-gallery';
      const mainImage = document.createElement('div');
      mainImage.className = 'main-image';
      const primaryImage = (room.images && room.images[0]) || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800';
      mainImage.innerHTML = `
        <div class="photo-placeholder">
          <img src="${primaryImage}" alt="${room.name} main" />
        </div>
      `;

      const thumbnails = document.createElement('div');
      thumbnails.className = 'gallery-thumbnails';
      (room.images || []).slice(1, 5).forEach((url, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'photo-placeholder';
        thumb.innerHTML = `<img src="${url}" alt="${room.name} view ${idx + 1}" />`;
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

      detail.appendChild(content);
      fragment.appendChild(detail);
    });

    detailedContainer.innerHTML = '';
    detailedContainer.appendChild(fragment);
  }

  function renderComparison(rooms) {
    if (!comparisonContainer) return;

    if (!Array.isArray(rooms) || rooms.length === 0) {
      comparisonContainer.innerHTML = '<p class="no-data">Comparison data coming soon.</p>';
      return;
    }

    const rows = [
      { label: 'Room Size', formatter: (room) => room.sizeSqm ? `${room.sizeSqm} m²` : '—' },
      { label: 'Guests', formatter: (room) => room.occupancy || '—' },
      { label: 'Floor', formatter: (room) => room.floor || '—' },
      { label: 'Nightly Rate', formatter: (room) => api.formatCurrency(room.price) },
      { label: 'Highlights', formatter: (room) => (room.highlights || []).slice(0, 3).join(', ') || '—' },
    ];

    const table = document.createElement('div');
    table.className = 'comparison-table';

    const header = document.createElement('div');
    header.className = 'comparison-header';
    header.innerHTML = ['<div class="feature-column">Features</div>']
      .concat(rooms.map((room) => `<div class="room-column">${room.name}</div>`))
      .join('');

    table.appendChild(header);

    rows.forEach((row) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'comparison-row';
      rowEl.innerHTML = [`<div class="feature-name">${row.label}</div>`]
        .concat(rooms.map((room) => `<div class="feature-value">${row.formatter(room)}</div>`))
        .join('');
      table.appendChild(rowEl);
    });

    comparisonContainer.innerHTML = '';
    comparisonContainer.appendChild(table);
  }

  async function init() {
    try {
      const rooms = await api.fetchJson('/api/v1/rooms');
      renderDetailed(rooms);
      renderComparison(rooms);
    } catch (error) {
      console.error('Unable to load rooms page data', error);
      if (detailedContainer) {
        detailedContainer.innerHTML = '<p class="error">Unable to load suites. Please refresh the page.</p>';
      }
      if (comparisonContainer) {
        comparisonContainer.innerHTML = '<p class="error">Unable to build comparison table.</p>';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();

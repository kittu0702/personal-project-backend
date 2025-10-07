(function () {
  const metaBase = document
    .querySelector('meta[name="lumina-api-base"]')
    ?.getAttribute('content');

  const computedBase =
    window.LUMINA_API_BASE_URL ||
    metaBase ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:4000'
      : '/api');

  const baseUrl = computedBase.replace(/\/$/, '');

  async function fetchJson(path, options = {}) {
    const isAbsolute = path.startsWith('http://') || path.startsWith('https://');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = isAbsolute ? path : `${baseUrl}${normalizedPath}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;
      try {
        const text = await response.text();
        if (text) message = text;
      } catch (error) {
        /* ignore */
      }
      throw new Error(message);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    return response.text();
  }

  function formatCurrency(amount) {
    if (typeof amount === 'object' && amount !== null && 'toString' in amount) {
      amount = Number(amount);
    }

    const numeric = Number(amount);
    if (Number.isNaN(numeric)) return '$—';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(numeric);
  }

  function groupBy(items, key) {
    return items.reduce((acc, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    }, {});
  }

  window.LuminaAPI = {
    baseUrl,
    fetchJson,
    formatCurrency,
    groupBy,
  };
})();

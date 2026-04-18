/**
 * Format ISO date string to dd/MM/yyyy format
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Map reading status to Spanish label
 * @param {string} status - 'not_started' | 'reading' | 'finished'
 * @returns {string} Spanish label
 */
export const readingStatusLabel = (status) => {
  const labels = {
    not_started: 'No iniciado',
    reading: 'Leyendo',
    finished: 'Terminado',
  };
  return labels[status] || status;
};

/**
 * Map wishlist status to Spanish label
 * @param {string} status - 'wish' | 'on_the_way' | 'obtained'
 * @returns {string} Spanish label
 */
export const wishlistStatusLabel = (status) => {
  const labels = {
    wish: 'Deseado',
    on_the_way: 'En camino',
    obtained: 'Obtenido',
  };
  return labels[status] || status;
};

/**
 * Map confidence level to Tailwind color classes
 * @param {string} level - 'high' | 'medium' | 'low'
 * @returns {string} Tailwind color classes
 */
export const confidenceColor = (level) => {
  const colors = {
    high: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200',
    medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200',
  };
  return colors[level] || '';
};

/**
 * Combine classnames, filtering out falsy values
 * @param  {...any} classes - Class names or conditional values
 * @returns {string} Combined class string
 */
export const cn = (...classes) => {
  return classes
    .filter((cls) => Boolean(cls) && typeof cls === 'string')
    .join(' ');
};

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} len - Maximum length
 * @returns {string} Truncated string
 */
export const truncate = (str, len) => {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.substring(0, len) + '...';
};

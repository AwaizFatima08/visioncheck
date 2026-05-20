// VisionCheck — Date Formatter
// app/utils/dateFormatter.js
//
// Formats ISO date strings into readable English and Urdu display formats.
// Used by history screens.

// Urdu month names
const URDU_MONTHS = [
  'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
  'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر',
];

// Urdu digits
const toUrduDigits = (num) => {
  return String(num).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
};

/**
 * Format ISO date string for display
 * @param {string} isoDate - ISO date string from SQLite
 * @param {string} language - 'en' or 'ur'
 * @returns {string} formatted date
 */
export const formatDate = (isoDate, language = 'en') => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date)) return isoDate;

  const day   = date.getDate();
  const month = date.getMonth();
  const year  = date.getFullYear();
  const hours = date.getHours();
  const mins  = date.getMinutes().toString().padStart(2, '0');
  const ampm  = hours >= 12 ? (language === 'ur' ? 'شام' : 'PM') : (language === 'ur' ? 'صبح' : 'AM');
  const h12   = hours % 12 || 12;

  if (language === 'ur') {
    return `${toUrduDigits(day)} ${URDU_MONTHS[month]} ${toUrduDigits(year)} — ${toUrduDigits(h12)}:${toUrduDigits(mins)} ${ampm}`;
  }

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${day} ${MONTHS[month]} ${year} — ${h12}:${mins} ${ampm}`;
};

/**
 * Relative time label — "Today", "Yesterday", "3 days ago"
 * @param {string} isoDate
 * @param {string} language
 * @returns {string}
 */
export const relativeDate = (isoDate, language = 'en') => {
  if (!isoDate) return '';
  const date  = new Date(isoDate);
  const now   = new Date();
  const diffMs   = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (language === 'ur') {
    if (diffDays === 0) return 'آج';
    if (diffDays === 1) return 'کل';
    if (diffDays < 7)  return `${toUrduDigits(diffDays)} دن پہلے`;
    if (diffDays < 30) return `${toUrduDigits(Math.floor(diffDays / 7))} ہفتے پہلے`;
    return `${toUrduDigits(Math.floor(diffDays / 30))} مہینے پہلے`;
  }

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

/**
 * Age band display label
 */
export const ageBandLabel = (band, language = 'en') => {
  const labels = {
    en: { child: 'Under 13', young: '13–40 yrs', middle: '40–60 yrs', senior: '60+ yrs' },
    ur: { child: '۱۳ سال سے کم', young: '۱۳–۴۰ سال', middle: '۴۰–۶۰ سال', senior: '۶۰+ سال' },
  };
  return (labels[language] || labels.en)[band] || band;
};

function daysUntil(dateText) {
  const target = new Date(`${dateText}T00:00:00`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

module.exports = { daysUntil, formatDate };

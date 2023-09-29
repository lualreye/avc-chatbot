function formatDate(fecha) {
  const day = fecha.getDate().toString().padStart(2, '0');
  const month = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Add 1 month index start on 0
  const year = fecha.getFullYear();
  return `${day}/${month}/${year}`;
}

module.exports = { formatDate } 
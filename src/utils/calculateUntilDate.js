function calculateDaysUntilDate(targetDate) {
  // Parse the target date in the format "dd/mm/yyyy"
  const [day, month, year] = targetDate.split('/').map(Number);
  const targetDateObj = new Date(year, month - 1, day); // Month is 0-based

  // Get the current date
  const currentDate = new Date();

  // Calculate the difference in milliseconds between the two dates
  const timeDifference = targetDateObj - currentDate;

  // Calculate the number of days
  const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return daysRemaining;
}

module.exports = { calculateDaysUntilDate }
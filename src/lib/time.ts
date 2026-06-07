/**
 * Converts a 24-hour time string (e.g. "13:00") to a 12-hour format (e.g. "1:00 PM")
 */
export function formatTo12hr(time24: string): string {
  if (!time24) return "";
  
  const [hoursStr, minutes] = time24.split(":");
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Converts a 12-hour time string (e.g. "1:00 PM") back to 24-hour format (e.g. "13:00")
 */
export function formatTo24hr(time12: string): string {
  if (!time12) return "";
  
  const [time, modifier] = time12.split(" ");
  let [hoursStr, minutes] = time.split(":");
  let hours = parseInt(hoursStr, 10);
  
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  
  const finalHours = hours.toString().padStart(2, "0");
  return `${finalHours}:${minutes}`;
}

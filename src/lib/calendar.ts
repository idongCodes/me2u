/**
 * Generates calendar links for Google and generic ICS
 */

export function generateCalendarLinks(data: {
  title: string;
  description: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes?: number;
}) {
  const [year, month, day] = data.date.split("-").map(Number);
  const [hour, minute] = data.time.split(":").map(Number);
  
  // Create start date (assume America/New_York for Worcester, MA)
  // We'll use local time construction for simple links
  const start = new Date(year, month - 1, day, hour, minute);
  const end = new Date(start.getTime() + (data.durationMinutes || 30) * 60000);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const gCalDates = `${formatDate(start)}/${formatDate(end)}`;
  
  const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(data.title)}&dates=${gCalDates}&details=${encodeURIComponent(data.description)}&location=${encodeURIComponent(data.location)}`;

  // Generic ICS Content (can be used in a data URI)
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PROID:-//Me2U//Reservation//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${data.title}`,
    `DESCRIPTION:${data.description}`,
    `LOCATION:${data.location}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\n");

  const icsDataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  return { googleUrl, icsDataUri };
}

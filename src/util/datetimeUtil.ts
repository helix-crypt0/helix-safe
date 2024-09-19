/**
 * Format to format of "Aug 02, 2024 21:32:48 +UTC"
 * @param timestamp - number to format
 * @returns date string
 */
export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);

    // Format the date part (e.g., "Aug 02, 2024")
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
    const formattedDate = dateFormatter.format(date);

    // Format the time part (e.g., "21:32:48")
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
    const formattedTime = timeFormatter.format(date);

    // Combine the date, time, and UTC timezone
    return `${formattedDate} ${formattedTime} +UTC`;
}

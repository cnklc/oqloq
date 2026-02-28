/**
 * Clock Service
 * Handles all clock-related calculations:
 * - Time to angle conversions
 * - Block positioning
 * - Current time calculations
 */

/**
 * Convert minutes (0-1439) to degrees (0-360)
 * 24 hours = 1440 minutes = 360 degrees
 * 1 minute = 0.25 degrees
 */
export const minutesToDegrees = (minutes: number): number => {
	return (minutes / 1440) * 360;
};

/**
 * Convert degrees back to minutes
 */
export const degreesToMinutes = (degrees: number): number => {
	return (degrees / 360) * 1440;
};

/**
 * Get current time in minutes (0-1439)
 */
export const getCurrentTimeInMinutes = (): number => {
	const now = new Date();
	return now.getHours() * 60 + now.getMinutes();
};

/**
 * Get current time as formatted string (HH:MM)
 */
export const getCurrentTimeFormatted = (): string => {
	const now = new Date();
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
};

/**
 * Convert minutes to time string (HH:MM)
 */
export const minutesToTimeString = (minutes: number): string => {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

/**
 * Convert time string (HH:MM) to minutes
 */
export const timeStringToMinutes = (timeStr: string): number => {
	const [hours, minutes] = timeStr.split(":").map(Number);
	return hours * 60 + minutes;
};

/**
 * Calculate SVG path data for a block segment
 * Returns path data for an arc from startMinute to endMinute
 *
 * @param startMinute - Start time in minutes (0-1439)
 * @param endMinute - End time in minutes (0-1439)
 * @param radius - Outer radius of the arc
 * @param thickness - Thickness of the arc segment
 * @param centerX - X coordinate of circle center
 * @param centerY - Y coordinate of circle center
 */
export const getBlockArcPath = (
	startMinute: number,
	endMinute: number,
	radius: number,
	thickness: number,
	centerX: number,
	centerY: number
): string => {
	const innerRadius = radius - thickness;

	const startAngle = minutesToDegrees(startMinute) - 90; // -90 to start from top
	const endAngle = minutesToDegrees(endMinute) - 90;

	const startAngleRad = (startAngle * Math.PI) / 180;
	const endAngleRad = (endAngle * Math.PI) / 180;

	// Outer arc start point
	const x1 = centerX + radius * Math.cos(startAngleRad);
	const y1 = centerY + radius * Math.sin(startAngleRad);

	// Outer arc end point
	const x2 = centerX + radius * Math.cos(endAngleRad);
	const y2 = centerY + radius * Math.sin(endAngleRad);

	// Inner arc start point
	const x3 = centerX + innerRadius * Math.cos(endAngleRad);
	const y3 = centerY + innerRadius * Math.sin(endAngleRad);

	// Inner arc end point
	const x4 = centerX + innerRadius * Math.cos(startAngleRad);
	const y4 = centerY + innerRadius * Math.sin(startAngleRad);

	const largeArc = endMinute - startMinute > 720 ? 1 : 0;

	return [
		`M ${x1} ${y1}`, // Move to outer start
		`A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, // Outer arc
		`L ${x3} ${y3}`, // Line to inner end
		`A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`, // Inner arc (reverse)
		"Z", // Close path
	].join(" ");
};

/**
 * Clamp minutes between 0 and 1439
 */
export const clampMinutes = (minutes: number): number => {
	return Math.max(0, Math.min(1439, Math.round(minutes)));
};

/**
 * Get current day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
export const getCurrentDayOfWeek = (): number => {
	return new Date().getDay();
};

/**
 * Check if a minute value is within a block's time range
 */
export const isTimeInBlock = (minute: number, blockStart: number, blockEnd: number): boolean => {
	return minute >= blockStart && minute < blockEnd;
};

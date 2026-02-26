/**
 * useCurrentTime Hook
 * Provides current time in minutes and updates every minute
 */

import { useState, useEffect } from "react";
import { getCurrentTimeInMinutes, getCurrentTimeFormatted } from "../services/clockService";

interface UseCurrentTimeReturn {
	currentMinute: number;
	currentTimeFormatted: string;
}

export const useCurrentTime = (): UseCurrentTimeReturn => {
	const [currentMinute, setCurrentMinute] = useState(getCurrentTimeInMinutes());
	const [currentTimeFormatted, setCurrentTimeFormatted] = useState(getCurrentTimeFormatted());

	useEffect(() => {
		// Update immediately
		setCurrentMinute(getCurrentTimeInMinutes());
		setCurrentTimeFormatted(getCurrentTimeFormatted());

		// Calculate delay until next minute
		const now = new Date();
		const secondsUntilNextMinute = 60 - now.getSeconds();
		const msUntilNextMinute = secondsUntilNextMinute * 1000;

		// Set initial timeout to next minute
		const initialTimeout = setTimeout(() => {
			setCurrentMinute(getCurrentTimeInMinutes());
			setCurrentTimeFormatted(getCurrentTimeFormatted());

			// Then set interval for every minute
			const interval = setInterval(() => {
				setCurrentMinute(getCurrentTimeInMinutes());
				setCurrentTimeFormatted(getCurrentTimeFormatted());
			}, 60000); // Update every 60 seconds

			return () => clearInterval(interval);
		}, msUntilNextMinute);

		return () => clearTimeout(initialTimeout);
	}, []);

	return { currentMinute, currentTimeFormatted };
};

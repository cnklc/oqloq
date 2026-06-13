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
	const [currentMinute, setCurrentMinute] = useState(getCurrentTimeInMinutes);
	const [currentTimeFormatted, setCurrentTimeFormatted] = useState(getCurrentTimeFormatted);

	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval> | undefined;

		const tick = () => {
			setCurrentMinute(getCurrentTimeInMinutes());
			setCurrentTimeFormatted(getCurrentTimeFormatted());
		};

		// Align the first update to the next minute boundary, then tick every minute.
		const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000;
		const timeoutId = setTimeout(() => {
			tick();
			intervalId = setInterval(tick, 60000);
		}, msUntilNextMinute);

		return () => {
			clearTimeout(timeoutId);
			if (intervalId) clearInterval(intervalId);
		};
	}, []);

	return { currentMinute, currentTimeFormatted };
};

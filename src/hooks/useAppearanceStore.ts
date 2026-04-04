import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppearanceState {
	backgroundColor: string;
	clockFaceColor: string;
	clockScale: number;
	
	// Actions
	setBackgroundColor: (color: string) => void;
	setClockFaceColor: (color: string) => void;
	setClockScale: (scale: number) => void;
	resetAppearance: () => void;
}

const DEFAULT_BACKGROUND = "#FFD200";
const DEFAULT_CLOCK_FACE = "#ffffff";
const DEFAULT_SCALE = 1.0;

export const useAppearanceStore = create<AppearanceState>()(
	persist(
		(set) => ({
			backgroundColor: DEFAULT_BACKGROUND,
			clockFaceColor: DEFAULT_CLOCK_FACE,
			clockScale: DEFAULT_SCALE,

			setBackgroundColor: (color) => set({ backgroundColor: color }),
			setClockFaceColor: (color) => set({ clockFaceColor: color }),
			setClockScale: (scale) => set({ clockScale: scale }),
			resetAppearance: () => set({ 
				backgroundColor: DEFAULT_BACKGROUND, 
				clockFaceColor: DEFAULT_CLOCK_FACE,
				clockScale: DEFAULT_SCALE
			}),
		}),
		{
			name: "oqlock-appearance",
		}
	)
);

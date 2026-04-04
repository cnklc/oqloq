import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppearanceState {
	backgroundColor: string;
	clockFaceColor: string;
	
	// Actions
	setBackgroundColor: (color: string) => void;
	setClockFaceColor: (color: string) => void;
	resetAppearance: () => void;
}

const DEFAULT_BACKGROUND = "#FFD200";
const DEFAULT_CLOCK_FACE = "#ffffff";

export const useAppearanceStore = create<AppearanceState>()(
	persist(
		(set) => ({
			backgroundColor: DEFAULT_BACKGROUND,
			clockFaceColor: DEFAULT_CLOCK_FACE,

			setBackgroundColor: (color) => set({ backgroundColor: color }),
			setClockFaceColor: (color) => set({ clockFaceColor: color }),
			resetAppearance: () => set({ 
				backgroundColor: DEFAULT_BACKGROUND, 
				clockFaceColor: DEFAULT_CLOCK_FACE 
			}),
		}),
		{
			name: "oqlock-appearance",
		}
	)
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoutineBlock, Template } from "../types/models";
import { DEFAULT_TEMPLATES } from "../types/models";

interface RoutineState {
	blocks: RoutineBlock[];
	templates: Template[];
	activeTemplateId: string | null;
	
	// Actions
	setBlocks: (blocks: RoutineBlock[]) => void;
	addBlock: (block: RoutineBlock) => void;
	updateBlock: (blockId: string, updatedBlock: Partial<RoutineBlock>) => void;
	deleteBlock: (blockId: string) => void;
	
	setTemplates: (templates: Template[]) => void;
	saveCurrentAsTemplate: (name: string) => void;
	deleteTemplate: (templateId: string) => void;
	applyTemplate: (templateId: string) => void;
	
	setActiveTemplateId: (id: string | null) => void;
}

export const useRoutineStore = create<RoutineState>()(
	persist(
		(set, get) => ({
			blocks: DEFAULT_TEMPLATES[0].blocks,
			templates: DEFAULT_TEMPLATES,
			activeTemplateId: DEFAULT_TEMPLATES[0].id,

			setBlocks: (blocks) => set({ blocks }),
			
			addBlock: (block) => set((state) => ({ 
				blocks: [...state.blocks, block] 
			})),
			
			updateBlock: (blockId, updatedBlock) => set((state) => ({
				blocks: state.blocks.map((b) => 
					b.id === blockId ? { ...b, ...updatedBlock } : b
				)
			})),
			
			deleteBlock: (blockId) => set((state) => ({
				blocks: state.blocks.filter((b) => b.id !== blockId)
			})),
			
			setTemplates: (templates) => set({ templates }),
			
			saveCurrentAsTemplate: (name) => set((state) => {
				const newTemplate: Template = {
					id: `custom-${Date.now()}`,
					name,
					blocks: JSON.parse(JSON.stringify(state.blocks)),
				};
				return { templates: [...state.templates, newTemplate] };
			}),
			
			deleteTemplate: (id) => set((state) => ({
				templates: state.templates.filter((t) => t.id !== id)
			})),

			applyTemplate: (templateId) => {
				const template = get().templates.find((t) => t.id === templateId);
				if (template) {
					set({ 
						blocks: JSON.parse(JSON.stringify(template.blocks)),
						activeTemplateId: templateId
					});
				}
			},
			
			setActiveTemplateId: (id) => set({ activeTemplateId: id }),
		}),
		{
			name: "oqlock-storage",
		}
	)
);

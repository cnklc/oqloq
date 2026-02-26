/**
 * Storage Service
 * Handles LocalStorage persistence for blocks and templates
 */

import type { RoutineBlock, Template } from "../types/models";
import { DEFAULT_TEMPLATES } from "../types/models";

const BLOCKS_KEY = "oqlock_blocks";
const TEMPLATES_KEY = "oqlock_templates";
const CURRENT_TEMPLATE_KEY = "oqlock_current_template";

/**
 * Get all routine blocks from storage
 * Returns default template blocks if none exist
 */
export const getBlocks = (): RoutineBlock[] => {
	try {
		const stored = localStorage.getItem(BLOCKS_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (error) {
		console.error("Error reading blocks from storage:", error);
	}
	// Return first default template blocks
	return DEFAULT_TEMPLATES[0].blocks;
};

/**
 * Save blocks to storage
 */
export const saveBlocks = (blocks: RoutineBlock[]): void => {
	try {
		localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
	} catch (error) {
		console.error("Error saving blocks to storage:", error);
	}
};

/**
 * Get all templates from storage
 * Includes default templates
 */
export const getTemplates = (): Template[] => {
	try {
		const stored = localStorage.getItem(TEMPLATES_KEY);
		if (stored) {
			const customTemplates = JSON.parse(stored);
			return [...DEFAULT_TEMPLATES, ...customTemplates];
		}
	} catch (error) {
		console.error("Error reading templates from storage:", error);
	}
	return DEFAULT_TEMPLATES;
};

/**
 * Save custom templates to storage
 * Does not overwrite default templates
 */
export const saveCustomTemplate = (template: Template): void => {
	try {
		const customTemplates = getCustomTemplates();
		// Check if template already exists
		const index = customTemplates.findIndex((t) => t.id === template.id);
		if (index >= 0) {
			customTemplates[index] = template;
		} else {
			customTemplates.push(template);
		}
		localStorage.setItem(TEMPLATES_KEY, JSON.stringify(customTemplates));
	} catch (error) {
		console.error("Error saving template to storage:", error);
	}
};

/**
 * Get only custom templates (not defaults)
 */
export const getCustomTemplates = (): Template[] => {
	try {
		const stored = localStorage.getItem(TEMPLATES_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (error) {
		console.error("Error reading custom templates from storage:", error);
	}
	return [];
};

/**
 * Get current active template ID
 */
export const getCurrentTemplateId = (): string => {
	try {
		const stored = localStorage.getItem(CURRENT_TEMPLATE_KEY);
		if (stored) {
			return stored;
		}
	} catch (error) {
		console.error("Error reading current template from storage:", error);
	}
	return "student"; // Default to student template
};

/**
 * Save current active template ID
 */
export const setCurrentTemplateId = (templateId: string): void => {
	try {
		localStorage.setItem(CURRENT_TEMPLATE_KEY, templateId);
	} catch (error) {
		console.error("Error saving current template to storage:", error);
	}
};

/**
 * Clear all data from storage (for debugging/reset)
 */
export const clearAllStorage = (): void => {
	try {
		localStorage.removeItem(BLOCKS_KEY);
		localStorage.removeItem(TEMPLATES_KEY);
		localStorage.removeItem(CURRENT_TEMPLATE_KEY);
	} catch (error) {
		console.error("Error clearing storage:", error);
	}
};

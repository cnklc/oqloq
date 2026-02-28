/**
 * Storage Service
 * Handles LocalStorage persistence for blocks and templates
 */

import type { RoutineBlock, Template, DaySchedule } from "../types/models";
import { DEFAULT_TEMPLATES } from "../types/models";

const BLOCKS_KEY = "oqlock_blocks";
const TEMPLATES_KEY = "oqlock_templates";
const CURRENT_TEMPLATE_KEY = "oqlock_current_template";
const DAY_SCHEDULES_KEY = "oqlock_day_schedules";
const DELETED_DEFAULTS_KEY = "oqlock_deleted_defaults";

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
 * Includes default templates (except those that have been deleted)
 */
export const getTemplates = (): Template[] => {
	const deletedIds = getDeletedDefaultTemplateIds();
	const visibleDefaults = DEFAULT_TEMPLATES.filter((t) => !deletedIds.includes(t.id));
	try {
		const stored = localStorage.getItem(TEMPLATES_KEY);
		if (stored) {
			const customTemplates = JSON.parse(stored);
			return [...visibleDefaults, ...customTemplates];
		}
	} catch (error) {
		console.error("Error reading templates from storage:", error);
	}
	return visibleDefaults;
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
 * Delete a custom template from storage
 */
export const deleteCustomTemplate = (templateId: string): void => {
	try {
		const customTemplates = getCustomTemplates();
		const filtered = customTemplates.filter((t) => t.id !== templateId);
		localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
	} catch (error) {
		console.error("Error deleting template from storage:", error);
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
		localStorage.removeItem(DAY_SCHEDULES_KEY);
		localStorage.removeItem(DELETED_DEFAULTS_KEY);
	} catch (error) {
		console.error("Error clearing storage:", error);
	}
};

/**
 * Get IDs of default templates that the user has deleted
 */
export const getDeletedDefaultTemplateIds = (): string[] => {
	try {
		const stored = localStorage.getItem(DELETED_DEFAULTS_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (error) {
		console.error("Error reading deleted defaults from storage:", error);
	}
	return [];
};

/**
 * Mark a default template as deleted
 */
export const addDeletedDefaultTemplateId = (templateId: string): void => {
	try {
		const ids = getDeletedDefaultTemplateIds();
		if (!ids.includes(templateId)) {
			ids.push(templateId);
			localStorage.setItem(DELETED_DEFAULTS_KEY, JSON.stringify(ids));
		}
	} catch (error) {
		console.error("Error saving deleted default to storage:", error);
	}
};

/**
 * Get all day schedules from storage
 */
export const getDaySchedules = (): DaySchedule[] => {
	try {
		const stored = localStorage.getItem(DAY_SCHEDULES_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (error) {
		console.error("Error reading day schedules from storage:", error);
	}
	return [];
};

/**
 * Get the day schedule for a specific day of week
 */
export const getDaySchedule = (dayOfWeek: number): DaySchedule | null => {
	const schedules = getDaySchedules();
	return schedules.find((s) => s.dayOfWeek === dayOfWeek) || null;
};

/**
 * Save (create or update) a day schedule
 */
export const saveDaySchedule = (schedule: DaySchedule): void => {
	try {
		const schedules = getDaySchedules();
		const index = schedules.findIndex((s) => s.dayOfWeek === schedule.dayOfWeek);
		if (index >= 0) {
			schedules[index] = schedule;
		} else {
			schedules.push(schedule);
		}
		localStorage.setItem(DAY_SCHEDULES_KEY, JSON.stringify(schedules));
	} catch (error) {
		console.error("Error saving day schedule to storage:", error);
	}
};

/**
 * Delete the day schedule for a specific day of week
 */
export const deleteDaySchedule = (dayOfWeek: number): void => {
	try {
		const schedules = getDaySchedules().filter((s) => s.dayOfWeek !== dayOfWeek);
		localStorage.setItem(DAY_SCHEDULES_KEY, JSON.stringify(schedules));
	} catch (error) {
		console.error("Error deleting day schedule from storage:", error);
	}
};

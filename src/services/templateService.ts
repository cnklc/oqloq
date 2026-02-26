/**
 * Template Service
 * Handles template operations
 */

import type { Template, RoutineBlock } from "../types/models";
import { DEFAULT_TEMPLATES } from "../types/models";
import {
	getTemplates,
	getCurrentTemplateId,
	setCurrentTemplateId,
	saveBlocks,
	saveCustomTemplate,
	deleteCustomTemplate,
} from "./storageService";

/**
 * Get a template by ID
 */
export const getTemplateById = (templateId: string): Template | null => {
	const templates = getTemplates();
	return templates.find((t) => t.id === templateId) || null;
};

/**
 * Get the current active template
 */
export const getCurrentTemplate = (): Template => {
	const templateId = getCurrentTemplateId();
	const template = getTemplateById(templateId);
	return template || DEFAULT_TEMPLATES[0];
};

/**
 * Switch to a different template
 * This loads the template's blocks into the current view
 */
export const switchTemplate = (templateId: string): RoutineBlock[] => {
	const template = getTemplateById(templateId);
	if (!template) {
		return DEFAULT_TEMPLATES[0].blocks;
	}

	setCurrentTemplateId(templateId);
	saveBlocks(template.blocks);
	return template.blocks;
};

/**
 * Create a new custom template from current blocks
 */
export const createTemplateFromBlocks = (name: string, blocks: RoutineBlock[]): Template => {
	const newTemplate: Template = {
		id: `custom_${Date.now()}`,
		name,
		blocks: blocks.map((block) => ({ ...block })), // Deep copy
	};

	saveCustomTemplate(newTemplate);
	return newTemplate;
};

/**
 * Get all available templates (default + custom)
 */
export const getAllTemplates = (): Template[] => {
	return getTemplates();
};

/**
 * Get all default templates
 */
export const getDefaultTemplates = (): Template[] => {
	return DEFAULT_TEMPLATES;
};

/**
 * Delete a custom template
 * Cannot delete default templates
 */
export const deleteTemplate = (templateId: string): boolean => {
	// Cannot delete default templates
	if (DEFAULT_TEMPLATES.some((t) => t.id === templateId)) {
		return false;
	}

	deleteCustomTemplate(templateId);
	return true;
};

/**
 * Check if a template is a default template
 */
export const isDefaultTemplate = (templateId: string): boolean => {
	return DEFAULT_TEMPLATES.some((t) => t.id === templateId);
};

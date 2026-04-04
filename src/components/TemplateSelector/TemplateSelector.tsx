import React from "react";
import type { Template } from "../../types/models";
import { Trash2, Library } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./TemplateSelector.css";

interface TemplateSelectorProps {
	templates: Template[];
	currentTemplateId: string;
	onTemplateSelect: (templateId: string) => void;
	onTemplateDelete: (templateId: string) => void;
	isDefaultTemplate: (templateId: string) => boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
	templates,
	currentTemplateId,
	onTemplateSelect,
	onTemplateDelete,
	isDefaultTemplate,
}) => {
	const defaultTemplates = templates.filter((t) => isDefaultTemplate(t.id));
	const customTemplates = templates.filter((t) => !isDefaultTemplate(t.id));

	return (
		<div className="template-selector-premium">
			<div className="template-section">
				<div className="section-title-group">
					<Library size={16} />
					<h3>Presets</h3>
				</div>
				<div className="template-grid">
					<AnimatePresence mode="popLayout">
						{defaultTemplates.map((template) => (
							<motion.div
								layout
								key={template.id}
								className={`template-card ${currentTemplateId === template.id ? 'active' : ''}`}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								onClick={() => onTemplateSelect(template.id)}
							>
								<div className="template-info">
									<span className="template-name">{template.name}</span>
									<span className="template-meta">{template.blocks.length} blocks</span>
								</div>
								<div className="template-actions">
									{currentTemplateId === template.id && (
										<Library className="active-icon" size={18} />
									)}
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>

			<div className="template-section">
				<div className="section-title-group">
					<Library size={16} />
					<h3>My Patterns</h3>
				</div>
				<div className="template-grid">
					<AnimatePresence mode="popLayout">
						{customTemplates.map((template) => (
							<motion.div 
								layout
								key={template.id} 
								className={`template-card ${currentTemplateId === template.id ? 'active' : ''}`}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								onClick={() => onTemplateSelect(template.id)}
							>
								<div className="template-info">
									<span className="template-name">{template.name}</span>
									<span className="template-meta">{template.blocks.length} blocks</span>
								</div>
								
								<div className="template-actions">
									{currentTemplateId === template.id ? (
										<Library size={18} className="active-icon" />
									) : (
										<button
											className="delete-btn-sm"
											onClick={(e) => {
												e.stopPropagation();
												if (confirm(`Delete "${template.name}"?`)) {
													onTemplateDelete(template.id);
												}
											}}
										>
											<Trash2 size={16} />
										</button>
									)}
								</div>
							</motion.div>
						))}
					</AnimatePresence>
					{customTemplates.length === 0 && (
						<div className="template-empty">
							No custom patterns saved yet
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

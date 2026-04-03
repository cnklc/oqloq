import React from "react";
import type { Template } from "../../types/models";
import { Trash2, CheckCircle2 } from "lucide-react";
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
	return (
		<div className="template-selector-premium">
			<div className="template-header">
				<h3>Routine Templates</h3>
			</div>
			<div className="template-grid">
				<AnimatePresence mode="popLayout">
					{templates.map((template) => (
						<motion.div 
							layout
							key={template.id} 
							className={`template-card ${currentTemplateId === template.id ? 'active' : ''}`}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							onClick={() => onTemplateSelect(template.id)}
						>
							<div className="template-info">
								<span className="template-name">{template.name}</span>
								<span className="template-meta">{template.blocks.length} blocks</span>
							</div>
							
							<div className="template-actions">
								{currentTemplateId === template.id ? (
									<CheckCircle2 size={18} className="active-icon" />
								) : !isDefaultTemplate(template.id) && (
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
			</div>
		</div>
	);
};

/**
 * TemplateSelector Component
 * Allows user to switch between templates
 */

import React, { useState } from "react";
import type { Template } from "../../types/models";
import "./TemplateSelector.css";

interface TemplateSelectorProps {
	templates: Template[];
	currentTemplateId: string;
	onTemplateSelect: (templateId: string) => void;
	onTemplateDelete: (templateId: string) => void;
	isDefaultTemplate: (templateId: string) => boolean;
	hasUnsavedChanges?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
	templates,
	currentTemplateId,
	onTemplateSelect,
	onTemplateDelete,
	isDefaultTemplate,
	hasUnsavedChanges = false,
}) => {
	const [showConfirm, setShowConfirm] = useState(false);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

	const handleTemplateClick = (templateId: string) => {
		if (hasUnsavedChanges && currentTemplateId !== templateId) {
			setSelectedTemplateId(templateId);
			setShowConfirm(true);
		} else {
			onTemplateSelect(templateId);
			setShowConfirm(false);
		}
	};

	const confirmSwitch = () => {
		if (selectedTemplateId) {
			onTemplateSelect(selectedTemplateId);
		}
		setShowConfirm(false);
		setSelectedTemplateId(null);
	};

	return (
		<div className="template-selector">
			<h3>Templates</h3>
			<div className="template-buttons">
				{templates.map((template) => (
					<div key={template.id} className="template-item">
						<button
							className={`template-btn ${currentTemplateId === template.id ? "active" : ""}`}
							onClick={() => handleTemplateClick(template.id)}
						>
							{template.name}
						</button>
						{!isDefaultTemplate(template.id) && (
							<button
								className="delete-template-btn"
								onClick={() => {
									if (
										confirm(`"${template.name}" template'ini silmek istediğinizden emin misiniz?`)
									) {
										onTemplateDelete(template.id);
									}
								}}
								title="Template'i sil"
							>
								✕
							</button>
						)}
					</div>
				))}
			</div>

			{showConfirm && (
				<div className="confirm-dialog">
					<div className="confirm-content">
						<p>Switch template? Current blocks will be replaced.</p>
						<div className="confirm-actions">
							<button className="btn-confirm" onClick={confirmSwitch}>
								Switch
							</button>
							<button className="btn-cancel" onClick={() => setShowConfirm(false)}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

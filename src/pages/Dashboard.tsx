import React, { useState, useEffect } from "react";
import type { RoutineBlock, Template } from "../types/models";
import { COLOR_PALETTE } from "../types/models";
import { useRoutineBlocks } from "../hooks/useRoutineBlocks";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { Clock } from "../components/Clock/Clock";
import { BlockEditor } from "../components/BlockEditor/BlockEditor";
import { TemplateSelector } from "../components/TemplateSelector/TemplateSelector";
import { PomodoroTimer } from "../components/PomodoroTimer/PomodoroTimer";
import {
	switchTemplate,
	getCurrentTemplate,
	getAllTemplates,
	createTemplateFromBlocks,
	deleteTemplate,
} from "../services/templateService";
import { minutesToTimeString, isTimeInBlock, getCurrentDayOfWeek } from "../services/clockService";
import { getDaySchedule } from "../services/storageService";
import "./Dashboard.css";

export const Dashboard: React.FC = () => {
	const { blocks, addBlock, updateBlock, deleteBlock, setBlocks } = useRoutineBlocks();
	const { currentMinute, currentTimeFormatted } = useCurrentTime();

	const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [currentTemplateId, setCurrentTemplateId] = useState(getCurrentTemplate().id);
	const [templates, setTemplates] = useState<Template[]>(getAllTemplates());
	const [showSaveTemplate, setShowSaveTemplate] = useState(false);
	const [saveTemplateName, setSaveTemplateName] = useState("");
	const [showSettings, setShowSettings] = useState(false);
	const [currentDayOfWeek] = useState<number>(() => getCurrentDayOfWeek());

	// Auto-load today's day schedule on mount if one is defined
	useEffect(() => {
		const todaySchedule = getDaySchedule(currentDayOfWeek);
		if (todaySchedule) {
			setBlocks(todaySchedule.blocks);
		}
	}, [currentDayOfWeek, setBlocks]);

	// Find current active block
	const activeBlock = blocks.find((block) =>
		isTimeInBlock(currentMinute, block.startMinute, block.endMinute)
	);

	const handleBlockClick = (blockId: string) => {
		setSelectedBlockId(blockId);
		setIsEditing(true);
	};

	const handleEmptyClick = () => {
		setSelectedBlockId(null);
		setIsEditing(true);
	};

	const handleSaveBlock = (block: RoutineBlock) => {
		const existingBlock = blocks.find((b) => b.id === block.id);
		if (existingBlock) {
			updateBlock(block.id, block);
		} else {
			addBlock(block);
		}
		setIsEditing(false);
		setSelectedBlockId(null);
	};

	const handleDeleteBlock = (blockId: string) => {
		deleteBlock(blockId);
		setIsEditing(false);
		setSelectedBlockId(null);
	};

	const handleTemplateSwitch = (templateId: string) => {
		const newBlocks = switchTemplate(templateId);
		setBlocks(newBlocks);
		setCurrentTemplateId(templateId);
		setIsEditing(false);
		setSelectedBlockId(null);
	};

	const handleSaveAsTemplate = () => {
		if (!saveTemplateName.trim()) {
			alert("Please enter a template name");
			return;
		}

		const newTemplate = createTemplateFromBlocks(saveTemplateName.trim(), blocks);
		setTemplates(getAllTemplates());
		setShowSaveTemplate(false);
		setSaveTemplateName("");
		alert(`"${newTemplate.name}" saved as template!`);
	};

	const handleDeleteTemplate = (templateId: string) => {
		const deleted = deleteTemplate(templateId);
		if (deleted) {
			if (currentTemplateId === templateId) {
				const newBlocks = switchTemplate("student");
				setBlocks(newBlocks);
				setCurrentTemplateId("student");
			}
			setTemplates(getAllTemplates());
		}
	};

	const handleDropColorOnBlock = (blockId: string, color: string) => {
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;
		updateBlock(blockId, { ...block, color });
	};

	const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
	const selectedStartMinute = selectedBlock
		? selectedBlock.startMinute
		: Math.round(currentMinute / 30) * 30;

	return (
		<div className="dashboard">
			<header className="dashboard-header">
				<div className="header-content">
					<h1>Oqloq</h1>
					<p className="tagline">24-Hour Routine Clock</p>
				</div>
				<div className="time-display">
					<div className="current-time">{currentTimeFormatted}</div>
					{activeBlock && <div className="active-block">{activeBlock.title}</div>}
				</div>
				<div className="header-settings">
					<button
						className="settings-icon-btn"
						onClick={() => setShowSettings(!showSettings)}
						aria-label="Open settings"
					>
						Settings
					</button>
				</div>
			</header>

			<div className="dashboard-content">
				<main className="main-section">
					<div className="clock-wrapper">
						<Clock
							blocks={blocks}
							currentMinute={currentMinute}
							currentTimeFormatted={currentTimeFormatted}
							onBlockClick={handleBlockClick}
							onEmptyClick={handleEmptyClick}
							onDropColor={handleDropColorOnBlock}
							selectedBlockId={selectedBlockId || undefined}
						/>
					</div>
				</main>

				<aside className="sidebar">
					{/* Focus - Pomodoro Timer */}
					<div className="sidebar-section">
						<div className="sidebar-section-title">Focus</div>
						<PomodoroTimer inline />
					</div>

					{/* Legend - Color Palette */}
					<div className="sidebar-section">
						<div className="sidebar-section-title">Legend</div>
						<div className="legend-grid">
							{COLOR_PALETTE.map((color) => (
								<div
									key={color}
									className="legend-swatch"
									style={{ backgroundColor: color }}
									draggable
									onDragStart={(e) => {
										e.dataTransfer.setData("text/plain", color);
										e.dataTransfer.effectAllowed = "copy";
									}}
									title={color}
								/>
							))}
						</div>
					</div>

					{/* Controls - Templates & Block Editor */}
					<div className="sidebar-section">
						<div className="sidebar-section-title">Templates</div>
						<TemplateSelector
							templates={templates}
							currentTemplateId={currentTemplateId}
							onTemplateSelect={handleTemplateSwitch}
							onTemplateDelete={handleDeleteTemplate}
							hasUnsavedChanges={false}
						/>
					</div>

					{isEditing && (
						<div className="sidebar-section">
							<div className="sidebar-section-title">
								{selectedBlock ? "Edit Block" : "New Block"}
							</div>
							<BlockEditor
								block={selectedBlock}
								onSave={handleSaveBlock}
								onCancel={() => {
									setIsEditing(false);
									setSelectedBlockId(null);
								}}
								onDelete={handleDeleteBlock}
								initialStartMinute={selectedStartMinute}
							/>
						</div>
					)}

					{selectedBlockId && !isEditing && (
						<div className="sidebar-section">
							{selectedBlock && (
								<div className="block-details">
									<h3>{selectedBlock.title}</h3>
									<p className="block-time">
										{minutesToTimeString(selectedBlock.startMinute)} –{" "}
										{minutesToTimeString(selectedBlock.endMinute)}
									</p>
									<div style={{ marginBottom: "12px" }}>
										<div
											className="color-preview"
											style={{ backgroundColor: selectedBlock.color }}
										/>
									</div>
									<button
										className="btn btn-primary"
										onClick={() => setIsEditing(true)}
										style={{ width: "100%" }}
									>
										Edit
									</button>
								</div>
							)}
						</div>
					)}

					{!selectedBlockId && !isEditing && (
						<div className="sidebar-section">
							<div className="sidebar-hint">
								<p>Click the clock ring to create or edit a block</p>
								<button
									className="btn btn-secondary"
									onClick={() => setShowSaveTemplate(true)}
									style={{ marginTop: "16px", width: "100%" }}
								>
									Save as Template
								</button>
							</div>
						</div>
					)}
				</aside>
			</div>

			{showSaveTemplate && (
				<div className="save-template-dialog">
					<div className="save-template-content">
						<h3>Save as Template</h3>
						<input
							type="text"
							placeholder="Template name"
							value={saveTemplateName}
							onChange={(e) => setSaveTemplateName(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && handleSaveAsTemplate()}
							autoFocus
							style={{
								padding: "10px 12px",
								border: "1px solid #1A1A1A",
								fontSize: "14px",
								marginBottom: "12px",
								width: "100%",
								color: "#1A1A1A",
								background: "#F2F2F2",
								fontFamily: "inherit",
							}}
						/>
						<div style={{ display: "flex", gap: "0" }}>
							<button
								className="btn btn-primary"
								onClick={handleSaveAsTemplate}
								style={{ flex: 1 }}
							>
								Save
							</button>
							<button
								className="btn btn-secondary"
								onClick={() => {
									setShowSaveTemplate(false);
									setSaveTemplateName("");
								}}
								style={{ flex: 1 }}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{showSettings && (
				<div className="save-template-dialog" onClick={() => setShowSettings(false)}>
					<div
						className="save-template-content"
						onClick={(e) => e.stopPropagation()}
						style={{ textAlign: "center" }}
					>
						<h3>Settings</h3>
						<p style={{ marginTop: "12px", color: "#666", fontSize: "13px" }}>
							Use the Legend swatches to drag colors onto clock segments.
						</p>
						<button
							className="btn btn-primary"
							onClick={() => setShowSettings(false)}
							style={{ marginTop: "16px", width: "100%" }}
						>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

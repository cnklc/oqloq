/**
 * Dashboard Page
 * Main application page integrating all components
 */

import React, { useState } from "react";
import type { RoutineBlock, Template, Todo } from "../types/models";
import { useRoutineBlocks } from "../hooks/useRoutineBlocks";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { Clock } from "../components/Clock/Clock";
import { BlockEditor } from "../components/BlockEditor/BlockEditor";
import { TemplateSelector } from "../components/TemplateSelector/TemplateSelector";
import { ActiveBlockTodos } from "../components/ActiveBlockTodos/ActiveBlockTodos";
import {
	switchTemplate,
	getCurrentTemplate,
	getAllTemplates,
	createTemplateFromBlocks,
	deleteTemplate,
	isDefaultTemplate,
} from "../services/templateService";
import { minutesToTimeString, isTimeInBlock } from "../services/clockService";
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

	// Find current active block
	const activeBlock = blocks.find((block) =>
		isTimeInBlock(currentMinute, block.startMinute, block.endMinute)
	);

	const handleBlockClick = (blockId: string) => {
		setSelectedBlockId(blockId);
		setIsEditing(true);
	};

	const handleEmptyClick = (_minute: number) => {
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
			alert("Lütfen template adı girin");
			return;
		}

		const newTemplate = createTemplateFromBlocks(saveTemplateName.trim(), blocks);
		setTemplates(getAllTemplates());
		setShowSaveTemplate(false);
		setSaveTemplateName("");
		alert(`"${newTemplate.name}" template olarak kaydedildi!`);
	};

	const handleDeleteTemplate = (templateId: string) => {
		const deleted = deleteTemplate(templateId);
		if (deleted) {
			// If deleted template was active, switch to student template
			if (currentTemplateId === templateId) {
				const newBlocks = switchTemplate("student");
				setBlocks(newBlocks);
				setCurrentTemplateId("student");
			}
			setTemplates(getAllTemplates());
		}
	};

	const handleAddTodo = (blockId: string, todoText: string) => {
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;

		const newTodo: Todo = {
			id: `todo_${Date.now()}`,
			text: todoText,
			completed: false,
		};

		const updatedBlock: RoutineBlock = {
			...block,
			todos: [...(block.todos || []), newTodo],
		};

		updateBlock(blockId, updatedBlock);
	};

	const handleToggleTodo = (blockId: string, todoId: string) => {
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;

		const updatedTodos = (block.todos || []).map((todo) =>
			todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
		);

		const updatedBlock: RoutineBlock = {
			...block,
			todos: updatedTodos,
		};

		updateBlock(blockId, updatedBlock);
	};

	const handleDeleteTodo = (blockId: string, todoId: string) => {
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;

		const updatedTodos = (block.todos || []).filter((todo) => todo.id !== todoId);

		const updatedBlock: RoutineBlock = {
			...block,
			todos: updatedTodos,
		};

		updateBlock(blockId, updatedBlock);
	};

	const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
	const selectedStartMinute = selectedBlock
		? selectedBlock.startMinute
		: Math.round(currentMinute / 30) * 30; // Round to nearest 30 min for new blocks

	return (
		<div className="dashboard">
			<header className="dashboard-header">
				<div className="header-content">
					<h1>Oqloq</h1>
					<p className="tagline">24-Hour Creative Routine Clock</p>
				</div>
				<div className="time-display">
					<div className="current-time">{currentTimeFormatted}</div>
					{activeBlock && <div className="active-block">Now: {activeBlock.title}</div>}
				</div>
			</header>

			<div className="dashboard-content">
				<main className="main-section">
					<div className="clock-wrapper">
						<Clock
							blocks={blocks}
							currentMinute={currentMinute}
							onBlockClick={handleBlockClick}
							onEmptyClick={handleEmptyClick}
							selectedBlockId={selectedBlockId || undefined}
						/>
					</div>
				</main>

				<aside className="sidebar">
					<TemplateSelector
						templates={templates}
						currentTemplateId={currentTemplateId}
						onTemplateSelect={handleTemplateSwitch}
						onTemplateDelete={handleDeleteTemplate}
						isDefaultTemplate={isDefaultTemplate}
						hasUnsavedChanges={false}
					/>

					{isEditing && (
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
					)}

					{selectedBlockId && !isEditing && (
						<div className="block-details">
							{selectedBlock && (
								<>
									<h3>{selectedBlock.title}</h3>
									<p className="block-time">
										{minutesToTimeString(selectedBlock.startMinute)} -{" "}
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
								</>
							)}
						</div>
					)}

					{!selectedBlockId && !isEditing && (
						<div className="sidebar-hint">
							<p>Click on the clock to create or edit a block</p>
							<button
								className="btn btn-secondary"
								onClick={() => setShowSaveTemplate(true)}
								style={{ marginTop: "16px", width: "100%" }}
							>
								💾 Template Olarak Kaydet
							</button>
						</div>
					)}

					{showSaveTemplate && (
						<div className="save-template-dialog">
							<div className="save-template-content">
								<h3>Template Olarak Kaydet</h3>
								<input
									type="text"
									placeholder="Template adını girin"
									value={saveTemplateName}
									onChange={(e) => setSaveTemplateName(e.target.value)}
									onKeyPress={(e) => e.key === "Enter" && handleSaveAsTemplate()}
									autoFocus
									style={{
										padding: "10px 12px",
										borderRadius: "8px",
										border: "1px solid #e0e0e0",
										fontSize: "14px",
										marginBottom: "12px",
										width: "100%",
										color: "#000000",
									}}
								/>
								<div style={{ display: "flex", gap: "8px" }}>
									<button
										className="btn btn-primary"
										onClick={handleSaveAsTemplate}
										style={{ flex: 1 }}
									>
										Kaydet
									</button>
									<button
										className="btn btn-secondary"
										onClick={() => {
											setShowSaveTemplate(false);
											setSaveTemplateName("");
										}}
										style={{ flex: 1 }}
									>
										İptal
									</button>
								</div>
							</div>
						</div>
					)}
				</aside>

			<aside className="todos-panel">
				<ActiveBlockTodos
					activeBlock={activeBlock || null}
					onAddTodo={handleAddTodo}
					onToggleTodo={handleToggleTodo}
					onDeleteTodo={handleDeleteTodo}
				/>
			</aside>
			</div>
		</div>
	);
};

import React, { useState } from "react";
import type { RoutineBlock, Todo } from "../types/models";
import { useRoutineStore } from "../hooks/useRoutineStore";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { Clock } from "../components/Clock/Clock";
import { BlockEditor } from "../components/BlockEditor/BlockEditor";
import { TemplateSelector } from "../components/TemplateSelector/TemplateSelector";
import { ActiveBlockTodos } from "../components/ActiveBlockTodos/ActiveBlockTodos";
import { SettingsSidebar } from "../components/SettingsSidebar/SettingsSidebar";
import { PomodoroTimer } from "../components/PomodoroTimer/PomodoroTimer";
import { minutesToTimeString, isTimeInBlock } from "../services/clockService";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Save } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle/ThemeToggle";
import "./Dashboard.css";

export const Dashboard: React.FC = () => {
	const { 
		blocks, 
		addBlock, 
		updateBlock, 
		deleteBlock, 
		templates, 
		applyTemplate, 
		saveCurrentAsTemplate, 
		deleteTemplate,
		activeTemplateId 
	} = useRoutineStore();
	
	const { currentMinute, currentTimeFormatted } = useCurrentTime();

	const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [showSaveTemplate, setShowSaveTemplate] = useState(false);
	const [saveTemplateName, setSaveTemplateName] = useState("");
	const [showSettings, setShowSettings] = useState(false);

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

	const handleTemplateSwitch = (id: string) => applyTemplate(id);
	const handleTemplateDelete = (id: string) => deleteTemplate(id);

	const handleSaveAsTemplate = () => {
		if (!saveTemplateName.trim()) {
			alert("Lütfen template adı girin");
			return;
		}

		saveCurrentAsTemplate(saveTemplateName.trim());
		setShowSaveTemplate(false);
		setSaveTemplateName("");
		alert(`"${saveTemplateName}" template olarak kaydedildi!`);
	};

	const handleAddTodo = (blockId: string, todoText: string) => {
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;

		const newTodo: Todo = {
			id: `todo_${Date.now()}`,
			text: todoText,
			completed: false,
		};

		updateBlock(blockId, {
			todos: [...(block.todos || []), newTodo]
		});
	};

	const handleToggleTodo = (blockId: string, todoId: string) => {
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;

		const updatedTodos = (block.todos || []).map((todo) =>
			todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
		);

		updateBlock(blockId, { todos: updatedTodos });
	};

	const handleDeleteTodo = (blockId: string, todoId: string) => {
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;

		const updatedTodos = (block.todos || []).filter((todo) => todo.id !== todoId);

		updateBlock(blockId, { todos: updatedTodos });
	};

	const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
	const selectedStartMinute = selectedBlock
		? selectedBlock.startMinute
		: Math.round(currentMinute / 30) * 30;

	return (
		<div className="dashboard">
			<header className="dashboard-header">
				<motion.div 
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="header-content"
				>
					<h1>Oqloq</h1>
					<p className="tagline">24-Hour Creative Routine Clock</p>
				</motion.div>
				
				<div className="time-display-container">
					<motion.div 
						key={currentTimeFormatted}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="current-time-glow"
					>
						{currentTimeFormatted}
					</motion.div>
					<AnimatePresence mode="wait">
						{activeBlock && (
							<motion.div 
								key={activeBlock.id}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								className="active-block-indicator"
								style={{ color: activeBlock.color }}
							>
								Now: {activeBlock.title}
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<div className="header-actions">
					<ThemeToggle />
					<button
						className="icon-btn"
						onClick={() => setShowSettings(!showSettings)}
						aria-label="Settings"
					>
						<Settings size={20} />
					</button>
				</div>
			</header>

			<div className="dashboard-content">
				<main className="main-section">
					<div className="clock-container-outer">
						<Clock
							blocks={blocks}
							currentMinute={currentMinute}
							onBlockClick={handleBlockClick}
							onEmptyClick={handleEmptyClick}
							selectedBlockId={selectedBlockId || undefined}
						/>
					</div>
				</main>

				<aside className="glass-panel right-panel">
					<div className="panel-tabs">
						<ActiveBlockTodos
							activeBlock={activeBlock || null}
							onAddTodo={handleAddTodo}
							onToggleTodo={handleToggleTodo}
							onDeleteTodo={handleDeleteTodo}
						/>
					</div>
				</aside>

				<aside className="glass-panel left-panel">
					<TemplateSelector
						templates={templates}
						currentTemplateId={activeTemplateId || ""}
						onTemplateSelect={handleTemplateSwitch}
						onTemplateDelete={handleTemplateDelete}
						isDefaultTemplate={(id) => ["student", "professional"].includes(id)}
					/>

					<AnimatePresence>
						{isEditing && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
							>
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
							</motion.div>
						)}
					</AnimatePresence>

					{selectedBlockId && !isEditing && (
						<motion.div 
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							className="block-info-card"
						>
							{selectedBlock && (
								<>
									<div className="block-info-header">
										<div className="color-dot" style={{ backgroundColor: selectedBlock.color }} />
										<h3>{selectedBlock.title}</h3>
									</div>
									<p className="block-time-range">
										{minutesToTimeString(selectedBlock.startMinute)} -{" "}
										{minutesToTimeString(selectedBlock.endMinute)}
									</p>
									<button
										className="btn-premium"
										onClick={() => setIsEditing(true)}
									>
										Edit Block
									</button>
								</>
							)}
						</motion.div>
					)}

					{!selectedBlockId && !isEditing && (
						<div className="empty-state-hint">
							<p>Click the outer ring to create a block</p>
							<button
								className="btn-outline"
								onClick={() => setShowSaveTemplate(true)}
							>
								<Save size={16} /> Save as Template
							</button>
						</div>
					)}

					{showSaveTemplate && (
						<motion.div 
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="glass-modal"
						>
							<h3>Save Template</h3>
							<input
								type="text"
								placeholder="Template Name"
								value={saveTemplateName}
								onChange={(e) => setSaveTemplateName(e.target.value)}
								autoFocus
							/>
							<div className="modal-actions">
								<button className="btn-primary" onClick={handleSaveAsTemplate}>Save</button>
								<button className="btn-ghost" onClick={() => setShowSaveTemplate(false)}>Cancel</button>
							</div>
						</motion.div>
					)}
				</aside>
			</div>

			<PomodoroTimer />
			<SettingsSidebar isOpen={showSettings} onClose={() => setShowSettings(false)} />
		</div>
	);
};

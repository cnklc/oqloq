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
import { isTimeInBlock } from "../services/clockService";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Save, Library, ListTodo, X } from "lucide-react";
import { useAppearanceStore } from "../hooks/useAppearanceStore";
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
		activeTemplateId,
	} = useRoutineStore();

	const { currentMinute, currentTimeFormatted } = useCurrentTime();
	const { backgroundColor, clockFaceColor, clockScale } = useAppearanceStore();

	const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [showSaveTemplate, setShowSaveTemplate] = useState(false);
	const [saveTemplateName, setSaveTemplateName] = useState("");
	const [showSettings, setShowSettings] = useState(false);

	const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
	const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

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
			alert("Lütfen şablon adı girin");
			return;
		}

		saveCurrentAsTemplate(saveTemplateName.trim());
		setShowSaveTemplate(false);
		setSaveTemplateName("");
		alert(`"${saveTemplateName}" şablon olarak kaydedildi!`);
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
			todos: [...(block.todos || []), newTodo],
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
		<div
			className="dashboard"
			style={
				{
					backgroundColor: backgroundColor,
					"--clock-dome-bg": clockFaceColor,
				} as React.CSSProperties
			}
		>
			<header className="minimal-header">
				<div className="header-brand">
					<h1>Oqloq</h1>
				</div>

				<div className="focused-time">
					<motion.div
						key={currentTimeFormatted}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="time-text-main"
					>
						{currentTimeFormatted}
					</motion.div>
				</div>

				<div className="header-meta">
					<AnimatePresence mode="wait">
						{activeBlock && (
							<motion.div
								key={activeBlock.id}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								className="active-block-status"
								style={{ color: activeBlock.color }}
							>
								{activeBlock.title}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</header>

			<nav className="floating-navbar glass-panel">
				<button
					className={`nav-btn ${isLeftDrawerOpen ? "active" : ""}`}
					onClick={() => {
						setIsLeftDrawerOpen(!isLeftDrawerOpen);
						setIsRightDrawerOpen(false);
					}}
					title="Şablon Kütüphanesi"
				>
					<Library size={20} />
				</button>

				<button
					className={`nav-btn ${isRightDrawerOpen ? "active" : ""}`}
					onClick={() => {
						setIsRightDrawerOpen(!isRightDrawerOpen);
						setIsLeftDrawerOpen(false);
					}}
					title="Mevcut Görevler"
				>
					<ListTodo size={20} />
				</button>

				<div className="nav-divider" />

				<button className="nav-btn" onClick={() => setShowSettings(!showSettings)} title="Ayarlar">
					<Settings size={20} />
				</button>
			</nav>

			<div className="focused-content">
				<main className="clock-stage" style={{ transform: `scale(${clockScale})` }}>
					<Clock
						blocks={blocks}
						currentMinute={currentMinute}
						onBlockClick={handleBlockClick}
						onEmptyClick={handleEmptyClick}
						selectedBlockId={selectedBlockId || undefined}
					/>
				</main>

				{/* Left Drawer: Templates */}
				<AnimatePresence>
					{isLeftDrawerOpen && (
						<motion.aside
							initial={{ x: -400, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: -400, opacity: 0 }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="glass-panel side-drawer left"
						>
							<div className="drawer-header">
								<button className="icon-btn-sm" onClick={() => setIsLeftDrawerOpen(false)}>
									<X size={20} />
								</button>
							</div>
							<TemplateSelector
								templates={templates}
								currentTemplateId={activeTemplateId || ""}
								onTemplateSelect={(id) => {
									handleTemplateSwitch(id);
									setIsLeftDrawerOpen(false);
								}}
								onTemplateDelete={handleTemplateDelete}
								isDefaultTemplate={(id) => ["student", "professional"].includes(id)}
							/>

							<div className="drawer-footer">
								<button className="btn-premium w-full" onClick={() => setShowSaveTemplate(true)}>
									<Save size={16} /> Deseni Kaydet
								</button>
							</div>
						</motion.aside>
					)}
				</AnimatePresence>

				{/* Right Drawer: Tasks & Editing */}
				<AnimatePresence>
					{isRightDrawerOpen && (
						<motion.aside
							initial={{ x: 400, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: 400, opacity: 0 }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="glass-panel side-drawer right"
						>
							<div className="drawer-header">
								<button className="icon-btn-sm" onClick={() => setIsRightDrawerOpen(false)}>
									<X size={20} />
								</button>
							</div>

							<ActiveBlockTodos
								activeBlock={activeBlock || null}
								onAddTodo={handleAddTodo}
								onToggleTodo={handleToggleTodo}
								onDeleteTodo={handleDeleteTodo}
							/>
						</motion.aside>
					)}
				</AnimatePresence>

				{/* Focused Editor Overlay */}
				<AnimatePresence>
					{isEditing && (
						<div className="editor-overlay-focused">
							<motion.div
								initial={{ opacity: 0, scale: 0.9, y: 20 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9, y: 20 }}
								className="editor-modal-container"
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
						</div>
					)}
				</AnimatePresence>

				{/* Save Template Modal */}
				<AnimatePresence>
					{showSaveTemplate && (
						<div className="editor-overlay-focused">
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								className="glass-modal"
							>
								<div className="section-title-group" style={{ marginBottom: 0 }}>
									<Save size={18} />
									<h3 style={{ margin: 0 }}>Şablon Kaydet</h3>
								</div>
								<input
									type="text"
									placeholder="Şablon Adı"
									value={saveTemplateName}
									onChange={(e) => setSaveTemplateName(e.target.value)}
									className="premium-input"
									autoFocus
								/>
								<div className="modal-actions">
									<button className="btn-premium flex-1" onClick={handleSaveAsTemplate}>
										Kaydet
									</button>
									<button className="btn-ghost" onClick={() => setShowSaveTemplate(false)}>
										İptal
									</button>
								</div>
							</motion.div>
						</div>
					)}
				</AnimatePresence>
			</div>

			<PomodoroTimer />
			<SettingsSidebar isOpen={showSettings} onClose={() => setShowSettings(false)} />
		</div>
	);
};

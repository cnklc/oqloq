import React, { useState } from "react";
import type { RoutineBlock, Todo } from "../../types/models";
import { COLOR_PALETTE } from "../../types/models";
import {
	minutesToTimeString,
	timeStringToMinutes,
	clampMinutes,
} from "../../services/clockService";
import { Trash2, Plus, X, Check } from "lucide-react";
import "./BlockEditor.css";

interface BlockEditorProps {
	block?: RoutineBlock;
	onSave: (block: RoutineBlock) => void;
	onCancel: () => void;
	onDelete?: (id: string) => void;
	initialStartMinute?: number;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
	block,
	onSave,
	onCancel,
	onDelete,
	initialStartMinute = 0,
}) => {
	const [title, setTitle] = useState(block?.title || "");
	const [color, setColor] = useState(block?.color || COLOR_PALETTE[0]);
	const [startTime, setStartTime] = useState(
		block ? minutesToTimeString(block.startMinute) : minutesToTimeString(initialStartMinute)
	);
	const [endTime, setEndTime] = useState(
		block ? minutesToTimeString(block.endMinute) : minutesToTimeString(initialStartMinute + 120)
	);
	const [todos, setTodos] = useState<Todo[]>(block?.todos || []);
	const [newTodoText, setNewTodoText] = useState("");

	const handleAddTodo = () => {
		if (!newTodoText.trim()) return;
		const newTodo: Todo = {
			id: `todo_${Date.now()}`,
			text: newTodoText.trim(),
			completed: false,
		};
		setTodos([...todos, newTodo]);
		setNewTodoText("");
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		const startMinute = clampMinutes(timeStringToMinutes(startTime));
		const endMinute = clampMinutes(timeStringToMinutes(endTime));

		if (!title.trim()) {
			alert("Please enter a title");
			return;
		}

		onSave({
			id: block?.id || `block_${Date.now()}`,
			title: title.trim(),
			color,
			startMinute,
			endMinute,
			todos,
		});
	};

	return (
		<div className="premium-editor">
			<div className="editor-header">
				<div className="section-title-group">
					<Plus size={18} />
					<h3>{block ? "Edit Routine" : "New Routine"}</h3>
				</div>
				<button className="close-btn-sm" onClick={onCancel}><X size={20} /></button>
			</div>

			<form onSubmit={handleSave} className="editor-form">
				<div className="input-group">
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="What are you doing? (e.g. Deep Work)"
						className="title-input-large"
						autoFocus
					/>
				</div>

				<div className="time-row">
					<div className="time-field">
						<label>Start</label>
						<input
							type="time"
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
						/>
					</div>
					<div className="time-field">
						<label>End</label>
						<input
							type="time"
							value={endTime}
							onChange={(e) => setEndTime(e.target.value)}
						/>
					</div>
				</div>

				<div className="color-section">
					<label>Color Theme</label>
					<div className="premium-color-picker">
						{COLOR_PALETTE.map((c) => (
							<button
								key={c}
								type="button"
								className={`swatch ${color === c ? "active" : ""}`}
								style={{ backgroundColor: c }}
								onClick={() => setColor(c)}
							/>
						))}
					</div>
				</div>

				<div className="todo-section">
					<label>Tasks</label>
					<div className="todo-input-minimal">
						<input
							type="text"
							placeholder="Add a sub-task..."
							value={newTodoText}
							onChange={(e) => setNewTodoText(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTodo())}
						/>
						<button type="button" onClick={handleAddTodo}><Plus size={16} /></button>
					</div>

					<div className="editor-todo-list">
						{todos.map((todo) => (
							<div key={todo.id} className="editor-todo-item">
								<button 
									type="button"
									className={`todo-check ${todo.completed ? 'done' : ''}`}
									onClick={() => setTodos(todos.map(t => t.id === todo.id ? {...t, completed: !t.completed} : t))}
								>
									{todo.completed && <Check size={12} />}
								</button>
								<span className={todo.completed ? 'strikethrough' : ''}>{todo.text}</span>
								<button 
									type="button" 
									className="todo-del"
									onClick={() => setTodos(todos.filter(t => t.id !== todo.id))}
								>
									<Trash2 size={14} />
								</button>
							</div>
						))}
					</div>
				</div>

				<div className="editor-footer">
					{block && onDelete && (
						<button
							type="button"
							className="btn-danger-ghost"
							onClick={() => confirm("Delete this block?") && onDelete(block.id)}
						>
							<Trash2 size={18} />
						</button>
					)}
					<div className="footer-actions">
						<button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
						<button type="submit" className="btn-premium">
							{block ? "Update Block" : "Create Block"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

/**
 * BlockEditor Component
 * Form for creating and editing routine blocks
 */

import React, { useState } from "react";
import type { RoutineBlock, Todo } from "../../types/models";
import { COLOR_PALETTE } from "../../types/models";
import {
	minutesToTimeString,
	timeStringToMinutes,
	clampMinutes,
} from "../../services/clockService";
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

	const handleToggleTodo = (todoId: string) => {
		setTodos(
			todos.map((todo) => (todo.id === todoId ? { ...todo, completed: !todo.completed } : todo))
		);
	};

	const handleDeleteTodo = (todoId: string) => {
		setTodos(todos.filter((todo) => todo.id !== todoId));
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();

		const startMinute = clampMinutes(timeStringToMinutes(startTime));
		const endMinute = clampMinutes(timeStringToMinutes(endTime));

		if (endMinute <= startMinute) {
			alert("End time must be after start time");
			return;
		}

		if (!title.trim()) {
			alert("Please enter a title");
			return;
		}

		const savedBlock: RoutineBlock = {
			id: block?.id || `block_${Date.now()}`,
			title: title.trim(),
			color,
			startMinute,
			endMinute,
			todos,
		};

		onSave(savedBlock);
	};

	return (
		<div className="block-editor">
			<h3>{block ? "Edit Block" : "New Block"}</h3>

			<form onSubmit={handleSave}>
				<div className="form-group">
					<label htmlFor="title">Title</label>
					<input
						id="title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g., Deep Work, Sleep, Meetings"
						autoFocus
					/>
				</div>

				<div className="form-row">
					<div className="form-group">
						<label htmlFor="start-time">Start Time</label>
						<input
							id="start-time"
							type="time"
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
						/>
					</div>

					<div className="form-group">
						<label htmlFor="end-time">End Time</label>
						<input
							id="end-time"
							type="time"
							value={endTime}
							onChange={(e) => setEndTime(e.target.value)}
						/>
					</div>
				</div>

				<div className="form-group">
					<label>Color</label>
					<div className="color-picker">
						{COLOR_PALETTE.map((c) => (
							<button
								key={c}
								type="button"
								className={`color-swatch ${color === c ? "selected" : ""}`}
								style={{ backgroundColor: c }}
								onClick={() => setColor(c)}
								title={c}
							/>
						))}
					</div>
				</div>

				{/* Todo List Section */}
				<div className="form-group">
					<label>📝 Todo List</label>
					<div className="todo-input-group">
						<input
							type="text"
							placeholder="Yeni todo ekle..."
							value={newTodoText}
							onChange={(e) => setNewTodoText(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
						/>
						<button type="button" className="btn-add-todo" onClick={handleAddTodo}>
							+
						</button>
					</div>

					{todos.length > 0 && (
						<div className="todo-list">
							{todos.map((todo) => (
								<div key={todo.id} className="todo-item">
									<input
										type="checkbox"
										checked={todo.completed}
										onChange={() => handleToggleTodo(todo.id)}
										className="todo-checkbox"
									/>
									<span className={`todo-text ${todo.completed ? "completed" : ""}`}>
										{todo.text}
									</span>
									<button
										type="button"
										className="btn-delete-todo"
										onClick={() => handleDeleteTodo(todo.id)}
									>
										×
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="form-actions">
					<button type="submit" className="btn btn-primary">
						{block ? "Update" : "Create"}
					</button>
					<button type="button" className="btn btn-secondary" onClick={onCancel}>
						Cancel
					</button>
					{block && onDelete && (
						<button
							type="button"
							className="btn btn-danger"
							onClick={() => {
								if (confirm("Delete this block?")) {
									onDelete(block.id);
								}
							}}
						>
							Delete
						</button>
					)}
				</div>
			</form>
		</div>
	);
};

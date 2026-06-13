import React, { useState } from "react";
import type { RoutineBlock, Todo } from "../../types/models";
import { Plus, CheckCircle2, Circle, X } from "lucide-react";
import "./ActiveBlockTodos.css";

interface ActiveBlockTodosProps {
	activeBlock: RoutineBlock | null;
	onAddTodo: (blockId: string, todoText: string) => void;
	onToggleTodo: (blockId: string, todoId: string) => void;
	onDeleteTodo: (blockId: string, todoId: string) => void;
}

export const ActiveBlockTodos: React.FC<ActiveBlockTodosProps> = ({
	activeBlock,
	onAddTodo,
	onToggleTodo,
	onDeleteTodo,
}) => {
	const [newTodoText, setNewTodoText] = useState("");

	const handleAddTodo = () => {
		if (!activeBlock || !newTodoText.trim()) return;
		onAddTodo(activeBlock.id, newTodoText.trim());
		setNewTodoText("");
	};

	if (!activeBlock) {
		return (
			<div className="todos-container-minimal">
				<div className="todos-empty-state">
					<p>No active routine block at the moment.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="todos-container-minimal">
			<div className="todos-header-focused">
				<div className="status-dot-pulse" style={{ backgroundColor: activeBlock.color }} />
				<h3>{activeBlock.title}</h3>
			</div>

			<div className="todo-input-premium">
				<input
					type="text"
					placeholder="What needs to be done?"
					value={newTodoText}
					onChange={(e) => setNewTodoText(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
				/>
				<button onClick={handleAddTodo} className="add-todo-btn-inner">
					<Plus size={18} />
				</button>
			</div>

			<div className="todo-scroll-area">
				{activeBlock.todos && activeBlock.todos.length > 0 ? (
					<div className="premium-todo-list">
						{activeBlock.todos.map((todo: Todo) => (
							<div key={todo.id} className={`premium-todo-item ${todo.completed ? 'completed' : ''}`}>
								<button 
									className="todo-toggle-btn"
									onClick={() => onToggleTodo(activeBlock.id, todo.id)}
								>
									{todo.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
								</button>
								<span className="todo-label">{todo.text}</span>
								<button
									className="todo-remove-btn"
									onClick={() => onDeleteTodo(activeBlock.id, todo.id)}
								>
									<X size={14} />
								</button>
							</div>
						))}
					</div>
				) : (
					<div className="todos-empty-state">
						<p>No tasks added for this block yet.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ActiveBlockTodos;

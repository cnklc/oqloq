import React, { useState } from "react";
import type { RoutineBlock, Todo } from "../../types/models";
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  if (!activeBlock) {
    return (
      <div className="active-block-todos">
        <div className="todos-header">
          <h3>Şu Andaki Görevler</h3>
        </div>
        <div className="todos-empty">
          <p>Aktif zaman dilimi yok</p>
        </div>
      </div>
    );
  }

  return (
    <div className="active-block-todos">
      <div className="todos-header">
        <h3 style={{ color: activeBlock.color }}>
          {activeBlock.title}
        </h3>
      </div>

      <div className="todos-input-section">
        <input
          type="text"
          placeholder="Yeni todo ekle..."
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="todos-input"
        />
        <button
          onClick={handleAddTodo}
          className="btn-add-todo"
          title="Todo ekle"
        >
          +
        </button>
      </div>

      {activeBlock.todos && activeBlock.todos.length > 0 ? (
        <div className="todos-list">
          {activeBlock.todos.map((todo: Todo) => (
            <div key={todo.id} className="todo-item">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleTodo(activeBlock.id, todo.id)}
                className="todo-checkbox"
              />
              <span
                className={`todo-text ${todo.completed ? "completed" : ""}`}
              >
                {todo.text}
              </span>
              <button
                type="button"
                className="btn-delete-todo"
                onClick={() => onDeleteTodo(activeBlock.id, todo.id)}
                title="Sil"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="todos-empty">
          <p>Henüz todo yok</p>
        </div>
      )}
    </div>
  );
};

export default ActiveBlockTodos;

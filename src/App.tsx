import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import './App.css'

interface Todo {
  id: number;
  text: string;
  status: 'active' | 'pending' | 'wip' | 'completed';
  deadline: string;
  assignee: string;
  link: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [deadline, setDeadline] = useState('')
  const [assignee, setAssignee] = useState('')
  const [link, setLink] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'wip' | 'completed'>('active')

  useEffect(() => {
    const interval = setInterval(() => {
      checkDueDates();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [todos]);

  const addTodo = () => {
    if (input.trim() !== '') {
      setTodos([...todos, { 
        id: Date.now(), 
        text: input.trim(), 
        status: 'active',
        deadline: deadline,
        assignee: assignee,
        link: link
      }])
      setInput('')
      setDeadline('')
      setAssignee('')
      setLink('')
    }
  }

  const updateTodoStatus = (id: number, newStatus: 'active' | 'pending' | 'wip' | 'completed') => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, status: newStatus } : todo
    ))
  }

  const removeTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const checkDueDates = () => {
    const now = new Date();
    todos.forEach(todo => {
      if (todo.status !== 'completed' && todo.deadline) {
        const dueDate = new Date(todo.deadline);
        if (dueDate < now) {
          console.log(`Email triggered: Task "${todo.text}" is overdue!`);
          // In a real application, you would call an API to send an email here
        }
      }
    });
  };

  const filteredTodos = todos.filter(todo => todo.status === activeTab)

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      todos.map(todo => ({ 
        Task: todo.text, 
        Status: todo.status, 
        Deadline: todo.deadline, 
        Assignee: todo.assignee,
        Link: todo.link
      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Todos')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    const url = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = 'todos.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="App">
      <h1>Todo App</h1>
      <div className="todo-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a new todo"
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <input
          type="text"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          placeholder="Assignee"
        />
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Link"
        />
        <button onClick={addTodo}>Create Task</button>
      </div>
      <div className="tabs">
        <button 
          className={activeTab === 'active' ? 'active' : ''}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button 
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button 
          className={activeTab === 'wip' ? 'active' : ''}
          onClick={() => setActiveTab('wip')}
        >
          WIP
        </button>
        <button 
          className={activeTab === 'completed' ? 'active' : ''}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>
      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={todo.status}>
            <div className="todo-info">
              <span>{todo.text}</span>
              <div className="todo-details">
                <span className="deadline">Deadline: {todo.deadline}</span>
                <span className="assignee">Assignee: {todo.assignee}</span>
                {todo.link && (
                  <span className="link">
                    <a href={todo.link} target="_blank" rel="noopener noreferrer">Link</a>
                  </span>
                )}
              </div>
            </div>
            <div className="todo-actions">
              <select 
                value={todo.status} 
                onChange={(e) => updateTodoStatus(todo.id, e.target.value as 'active' | 'pending' | 'wip' | 'completed')}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="wip">WIP</option>
                <option value="completed">Completed</option>
              </select>
              <button onClick={() => removeTodo(todo.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={downloadExcel} className="download-button">Download Excel</button>
    </div>
  )
}

export default App
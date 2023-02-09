import { createTodoTrpcClient } from '@nx-trpc-demo/todo-trpc-client';
import { TodoTrpcRouter, ToDo } from '@nx-trpc-demo/todo-trpc-server';
import { inferRouterOutputs } from '@trpc/server';
import { createSignal, onMount } from 'solid-js';
import TodoForm from './TodoForm';

const client = createTodoTrpcClient();
const [todos, setTodos] = createSignal<ToDo[]>([]);
const fetchTodos = async () => {
  const data = await client.todos.getAllTodos.query();
  setTodos(data);
};

export default function TodoList() {
  onMount(fetchTodos);
  return (
    <>
      <TodoForm onSubmitSuccess={fetchTodos} />
      <ul>
        {todos()?.map((item) => (
          <TodoItem {...item} />
        ))}
      </ul>
    </>
  );
}

type TodoItemProps =
  inferRouterOutputs<TodoTrpcRouter>['todos']['getAllTodos'][0];

function TodoItem({ completed, title, id }: TodoItemProps) {
  return (
    <li>
      <input
        type="checkbox"
        checked={completed}
        onClick={async () => {
          await client.todos.toggleComplete.mutate({ id });
          fetchTodos();
        }}
        id={`checkbox-${id}`}
      />
      <label for={`checkbox-${id}`}>{title}</label>
      <button
        onClick={async () => {
          await client.todos.deleteTodo.mutate({ id });
          fetchTodos();
        }}
      >
        Delete
      </button>
    </li>
  );
}

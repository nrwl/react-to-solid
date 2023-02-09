import { createTodoTrpcClient } from '@nx-trpc-demo/todo-trpc-client';
import { ToDo, TodoTrpcRouter } from '@nx-trpc-demo/todo-trpc-server';
import { inferRouterOutputs } from '@trpc/server';
import { createSignal, onMount } from 'solid-js';
import AddTodoForm from './AddToDoForm';

const client = createTodoTrpcClient();

export default function TodoList() {
  const [todos, setTodos] = createSignal<ToDo[]>([]);
  onMount(async () => {
    const data = await client.todos.getAllTodos.query();
    setTodos(data);
  });
  return (
    <>
      <AddTodoForm
        onSubmitSuccess={async () => {
          const data = await client.todos.getAllTodos.query();
          setTodos(data);
        }}
      />
      <ul>
        {todos()?.map((item) => (
          <TodoItem
            key={item.id}
            {...item}
            reload={async () => {
              const data = await client.todos.getAllTodos.query();
              setTodos(data);
            }}
          />
        ))}
      </ul>
    </>
  );
}

type TodoItemProps =
  inferRouterOutputs<TodoTrpcRouter>['todos']['getAllTodos'][0] & {
    reload: () => Promise<void>;
  };

function TodoItem({ completed, title, id, reload }: TodoItemProps) {
  return (
    <li>
      <input
        type="checkbox"
        checked={completed}
        onClick={async () => {
          await client.todos.toggleComplete.mutate({ id });
          reload();
        }}
        id={`checkbox-${id}`}
      />
      <label htmlFor={`checkbox-${id}`}>{title}</label>
      <button
        onClick={async () => {
          await client.todos.deleteTodo.mutate({ id });
          reload();
        }}
      >
        Delete
      </button>
    </li>
  );
}

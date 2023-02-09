import { createTodoTrpcClient } from '@nx-trpc-demo/todo-trpc-client';
import { TodoTrpcRouter, ToDo } from '@nx-trpc-demo/todo-trpc-server';
import { createMutation, createQuery } from '@tanstack/solid-query';
import { inferRouterOutputs } from '@trpc/server';
import { createSignal, onMount } from 'solid-js';
import { queryClient } from './query-client';
import TodoForm from './TodoForm';

const client = createTodoTrpcClient();

export default function TodoList() {
  const query = createQuery(
    () => ['todos'],
    async () => await client.todos.getAllTodos.query()
  );

  return (
    <>
      <TodoForm />
      <ul>
        {query.data?.map((item) => (
          <TodoItem {...item} />
        ))}
      </ul>
    </>
  );
}

type TodoItemProps =
  inferRouterOutputs<TodoTrpcRouter>['todos']['getAllTodos'][0];

function TodoItem({ completed, title, id }: TodoItemProps) {
  const { mutate: toggleTodo } = createMutation(
    ['todos'],
    async ({ id }: { id: string }) =>
      await client.todos.toggleComplete.mutate({ id }),
    {
      onSuccess: (newTodo) =>
        queryClient.setQueryData<ToDo[]>(['todos'], (todos) => {
          if (!todos) {
            return [newTodo];
          }
          const index = todos.findIndex((todo) => todo.id === id);
          todos[index] = newTodo;
          return todos;
        }),
    }
  );
  const { mutate: deleteTodo } = createMutation(
    ['todos'],
    async ({ id }: { id: string }) =>
      await client.todos.deleteTodo.mutate({ id }),
    {
      onSuccess: (deletedTodo) =>
        queryClient.setQueryData<ToDo[]>(['todos'], (todos) => {
          if (!todos) {
            return [];
          }
          return todos.filter((todo) => todo.id !== deletedTodo.id);
        }),
    }
  );
  return (
    <li>
      <input
        type="checkbox"
        checked={completed}
        onClick={() => toggleTodo({ id })}
        id={`checkbox-${id}`}
      />
      <label for={`checkbox-${id}`}>{title}</label>
      <button onClick={() => deleteTodo({ id })}>Delete</button>
    </li>
  );
}

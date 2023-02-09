import { createTodoTrpcClient } from '@nx-trpc-demo/todo-trpc-client';
import { ToDo } from '@nx-trpc-demo/todo-trpc-server';
import { createMutation } from '@tanstack/solid-query';
import { createSignal } from 'solid-js';
import { queryClient } from './query-client';

const client = createTodoTrpcClient();

export default function TodoForm() {
  const [title, setTitle] = createSignal('');

  const { mutate: addTodo } = createMutation(
    ['todos'],
    async ({ title }: { title: string }) =>
      await client.todos.addTodo.mutate({ title }),
    {
      onSuccess: (todo) => {
        setTitle('');
        queryClient.setQueryData<ToDo[]>(
          ['todos'],
          (todos: ToDo[] | undefined) => [...(todos || []), todo]
        );
      },
    }
  );

  return (
    <form onSubmit={() => addTodo({ title: title() })}>
      <input
        type="text"
        value={title()}
        onInput={({ target }) => setTitle((target as any).value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}

import { createTodoTrpcClient } from '@nx-trpc-demo/todo-trpc-client';
import { createSignal } from 'solid-js';

const client = createTodoTrpcClient();

export default function TodoForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess: () => Promise<void>;
}) {
  const [title, setTitle] = createSignal('');
  async function handleSubmit(event: Event) {
    event.preventDefault();
    await client.todos.addTodo.mutate({ title: title() });
    setTitle('');
    await onSubmitSuccess();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title()}
        onInput={({ target }) => setTitle((target as any).value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}

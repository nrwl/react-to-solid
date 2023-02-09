import { createTodoTrpcClient } from '@nx-trpc-demo/todo-trpc-client';
import { createSignal } from 'solid-js';

export default function AddTodoForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess: () => Promise<void>;
}) {
  const client = createTodoTrpcClient();
  const [title, setNewTodoName] = createSignal('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await client.todos.addTodo.mutate({ title: title() });
    setNewTodoName('');
    await onSubmitSuccess();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={(event) => {
          setNewTodoName(event.target.value);
        }}
        value={title()}
      />

      <button type="submit">Add</button>
    </form>
  );
}

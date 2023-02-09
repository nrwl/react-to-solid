import { QueryClientProvider } from '@tanstack/solid-query';
import { Component } from 'solid-js';
import { render } from 'solid-js/web';
import { queryClient } from './query-client';
import TodoList from './TodoList';

const App: Component = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoList />
    </QueryClientProvider>
  );
};

export default App;

render(App as any, document.getElementById('root') || document.body);

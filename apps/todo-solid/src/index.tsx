import { Component } from 'solid-js';
import { render } from 'solid-js/web';
import TodoList from './TodoList';

const App: Component = () => {
  return (<TodoList />) as any;
};

export default App;

render(App as any, document.getElementById('root') || document.body);

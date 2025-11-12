import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import TodoList from './components/TodoList';

function App() {
  return (
    <>
      <TodoList />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

export default App;

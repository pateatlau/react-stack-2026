import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import useCounter from './stores/useCounter';
import Button from './components/Button';

function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const count = useCounter((s: any) => s.count);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inc = useCounter((s: any) => s.increment);

  const { data, isLoading } = useQuery({
    queryKey: ['todo', 1],
    queryFn: async () => {
      const r = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      if (!r.ok) throw new Error('Network error');
      return r.json();
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-xl w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">react-stack</h1>
        <div className="mb-4">
          <div className="text-lg text-slate-500 mb-1">Zustand counter</div>
          <div className="flex items-center gap-4">
            <div className="text-3xl text-green-500 font-bold">{count}</div>
            <Button onClick={inc}>Increment</Button>
          </div>
        </div>

        <div>
          <h2 className="font-medium mb-2">TanStack Query fetch</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <pre className="text-sm bg-slate-100 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
          )}
        </div>
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
}

export default App;

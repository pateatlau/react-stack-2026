import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTodoStore, type Todo } from '@react-stack/shared-hooks';
import { Button, Input, Card, CardContent, Badge } from '@react-stack/shared-ui';
import { apiClient } from '@react-stack/shared-utils';
import { Plus, Trash2, Check } from 'lucide-react';

const TodosREST: React.FC = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Fetch todos
  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await apiClient.get('/todos');
      return response.data.data as Todo[];
    },
  });

  // Create todo mutation
  const createMutation = useMutation({
    mutationFn: async (newTodo: { title: string; description?: string }) => {
      const response = await apiClient.post('/todos', newTodo);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setTitle('');
      setDescription('');
    },
  });

  // Toggle todo mutation
  const toggleMutation = useMutation({
    mutationFn: async (todo: Todo) => {
      const response = await apiClient.patch(`/todos/${todo.id}`, {
        completed: !todo.completed,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // Delete todo mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createMutation.mutate({
        title: title.trim(),
        description: description.trim() || undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Todos (REST API)</h1>
          <p className="mt-2 text-gray-600">Manage your tasks with TanStack Query</p>
        </div>

        {/* Create Todo Form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
              />
              <Input
                label="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
              />
              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {createMutation.isPending ? 'Adding...' : 'Add Todo'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Todos List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading todos...</p>
          </div>
        ) : todos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No todos yet. Create one above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <Card key={todo.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => toggleMutation.mutate(todo)}
                        className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          todo.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {todo.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${
                            todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {todo.title}
                        </h3>
                        {todo.description && (
                          <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={todo.completed ? 'success' : 'secondary'}>
                            {todo.completed ? 'Completed' : 'Pending'}
                          </Badge>
                          {todo.priority && (
                            <Badge
                              variant={
                                todo.priority === 'high'
                                  ? 'error'
                                  : todo.priority === 'medium'
                                    ? 'warning'
                                    : 'default'
                              }
                            >
                              {todo.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(todo.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodosREST;

import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Button, Input, Card, CardContent, Badge } from '@react-stack/shared-ui';
import { Plus, Trash2, Check } from 'lucide-react';

const GET_TODOS = gql`
  query GetTodos {
    todos {
      data {
        id
        title
        completed
        createdAt
        updatedAt
      }
      meta {
        total
        page
        limit
      }
    }
  }
`;

const CREATE_TODO = gql`
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      title
      completed
    }
  }
`;

const UPDATE_TODO = gql`
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      id
      completed
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

const TodosGraphQL: React.FC = () => {
  const [title, setTitle] = useState('');

  // Query todos
  const { data, loading } = useQuery(GET_TODOS);
  const todos = data?.todos?.data || [];

  // Create mutation
  const [createTodo, { loading: creating }] = useMutation(CREATE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
    onCompleted: () => {
      setTitle('');
    },
  });

  // Update mutation
  const [updateTodo] = useMutation(UPDATE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  // Delete todo mutation
  const [deleteTodo] = useMutation(DELETE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createTodo({
        variables: {
          input: {
            title: title.trim(),
          },
        },
      });
    }
  };

  const handleToggle = (todo: Todo) => {
    updateTodo({
      variables: {
        id: todo.id,
        input: { completed: !todo.completed },
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteTodo({ variables: { id } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Todos (GraphQL)</h1>
          <p className="mt-2 text-gray-600">Manage your tasks with Apollo Client</p>
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
              <Button type="submit" disabled={creating} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {creating ? 'Adding...' : 'Add Todo'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Todos List */}
        {loading ? (
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
            {todos.map((todo: Todo) => (
              <Card key={todo.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => handleToggle(todo)}
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
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={todo.completed ? 'success' : 'secondary'}>
                            {todo.completed ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(todo.id)}>
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

export default TodosGraphQL;

/* eslint-disable */
// @ts-nocheck
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

/** Input for creating a new todo */
export type CreateTodoInput = {
  /** Initial completion status (optional, defaults to false) */
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Todo title (required) */
  title: Scalars['String']['input'];
};

/** Health check response */
export type HealthResponse = {
  __typename?: 'HealthResponse';
  /** Database connection status */
  database: Scalars['String']['output'];
  /** Database type (postgres or mongodb) */
  dbType?: Maybe<Scalars['String']['output']>;
  /** API status */
  status: Scalars['String']['output'];
};

/** Mutation operations */
export type Mutation = {
  __typename?: 'Mutation';
  /** Create a new todo */
  createTodo: Todo;
  /** Delete a todo */
  deleteTodo: Scalars['Boolean']['output'];
  /** Toggle todo completion status */
  toggleTodo?: Maybe<Todo>;
  /** Update an existing todo */
  updateTodo?: Maybe<Todo>;
};

/** Mutation operations */
export type MutationCreateTodoArgs = {
  input: CreateTodoInput;
};

/** Mutation operations */
export type MutationDeleteTodoArgs = {
  id: Scalars['ID']['input'];
};

/** Mutation operations */
export type MutationToggleTodoArgs = {
  id: Scalars['ID']['input'];
};

/** Mutation operations */
export type MutationUpdateTodoArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTodoInput;
};

/** Pagination metadata information */
export type PaginationMeta = {
  __typename?: 'PaginationMeta';
  /** Items per page */
  limit: Scalars['Int']['output'];
  /** Current page number */
  page: Scalars['Int']['output'];
  /** Total number of items */
  total: Scalars['Int']['output'];
  /** Total number of pages */
  totalPages: Scalars['Int']['output'];
};

/** Query operations */
export type Query = {
  __typename?: 'Query';
  /** Health check endpoint */
  health: HealthResponse;
  /** Get a single todo by ID */
  todo?: Maybe<Todo>;
  /** Get paginated list of todos with optional filtering and sorting */
  todos: TodosResponse;
};

/** Query operations */
export type QueryTodoArgs = {
  id: Scalars['ID']['input'];
};

/** Query operations */
export type QueryTodosArgs = {
  filter?: InputMaybe<TodoFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<TodoSortField>;
  sortOrder?: InputMaybe<SortOrder>;
};

/** Supported sort orders */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/** Subscription operations for real-time updates */
export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to all todo changes (created, updated, deleted) */
  todoChanged: TodoChangePayload;
  /** Subscribe only to new todos */
  todoCreated: Todo;
  /** Subscribe only to todo deletions */
  todoDeleted: Scalars['ID']['output'];
  /** Subscribe only to todo updates */
  todoUpdated: Todo;
};

/** Todo item representing a task */
export type Todo = {
  __typename?: 'Todo';
  /** Completion status */
  completed: Scalars['Boolean']['output'];
  /** Creation timestamp (ISO 8601 format) */
  createdAt: Scalars['String']['output'];
  /** Unique identifier (UUID for PostgreSQL, ObjectId for MongoDB) */
  id: Scalars['ID']['output'];
  /** Todo title/description */
  title: Scalars['String']['output'];
  /** Last update timestamp (ISO 8601 format) */
  updatedAt: Scalars['String']['output'];
};

/** Payload for todo change subscription with operation type */
export type TodoChangePayload = {
  __typename?: 'TodoChangePayload';
  /** ID of deleted todo (only for DELETE operations) */
  deletedId?: Maybe<Scalars['ID']['output']>;
  /** Type of operation (CREATED, UPDATED, DELETED) */
  operation: Scalars['String']['output'];
  /** The affected todo (null for DELETE operations) */
  todo?: Maybe<Todo>;
};

/** Filter options for querying todos */
export type TodoFilterInput = {
  /** Filter by completion status */
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  /** Search in title (case-insensitive partial match) */
  titleContains?: InputMaybe<Scalars['String']['input']>;
};

/** Fields available for sorting todos */
export enum TodoSortField {
  completed = 'completed',
  createdAt = 'createdAt',
  title = 'title',
  updatedAt = 'updatedAt',
}

/** Paginated response for todos list */
export type TodosResponse = {
  __typename?: 'TodosResponse';
  /** Array of todo items */
  data: Array<Todo>;
  /** Pagination metadata */
  meta: PaginationMeta;
};

/** Input for updating an existing todo */
export type UpdateTodoInput = {
  /** New completion status (optional) */
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  /** New title (optional) */
  title?: InputMaybe<Scalars['String']['input']>;
};

export type TodoFieldsFragment = {
  __typename?: 'Todo';
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTodoMutationVariables = Exact<{
  input: CreateTodoInput;
}>;

export type CreateTodoMutation = {
  __typename?: 'Mutation';
  createTodo: {
    __typename?: 'Todo';
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteTodoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteTodoMutation = { __typename?: 'Mutation'; deleteTodo: boolean };

export type ToggleTodoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type ToggleTodoMutation = {
  __typename?: 'Mutation';
  toggleTodo?: {
    __typename?: 'Todo';
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type UpdateTodoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTodoInput;
}>;

export type UpdateTodoMutation = {
  __typename?: 'Mutation';
  updateTodo?: {
    __typename?: 'Todo';
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type GetTodoQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetTodoQuery = {
  __typename?: 'Query';
  todo?: {
    __typename?: 'Todo';
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type GetTodosQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<TodoFilterInput>;
  sortBy?: InputMaybe<TodoSortField>;
  sortOrder?: InputMaybe<SortOrder>;
}>;

export type GetTodosQuery = {
  __typename?: 'Query';
  todos: {
    __typename?: 'TodosResponse';
    data: Array<{
      __typename?: 'Todo';
      id: string;
      title: string;
      completed: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    meta: {
      __typename?: 'PaginationMeta';
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};

export type TodoUpdatedSubscriptionVariables = Exact<{ [key: string]: never }>;

export type TodoUpdatedSubscription = {
  __typename?: 'Subscription';
  todoUpdated: {
    __typename?: 'Todo';
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export const TodoFieldsFragmentDoc = gql`
  fragment TodoFields on Todo {
    id
    title
    completed
    createdAt
    updatedAt
  }
`;
export const CreateTodoDocument = gql`
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      ...TodoFields
    }
  }
  ${TodoFieldsFragmentDoc}
`;
export type CreateTodoMutationFn = MutationFunction<
  CreateTodoMutation,
  CreateTodoMutationVariables
>;

/**
 * __useCreateTodoMutation__
 *
 * To run a mutation, you first call `useCreateTodoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTodoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTodoMutation, { data, loading, error }] = useCreateTodoMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTodoMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateTodoMutation, CreateTodoMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateTodoMutation, CreateTodoMutationVariables>(
    CreateTodoDocument,
    options
  );
}
export type CreateTodoMutationHookResult = ReturnType<typeof useCreateTodoMutation>;
export type CreateTodoMutationResult = Apollo.MutationResult<CreateTodoMutation>;
export type CreateTodoMutationOptions = BaseMutationOptions<
  CreateTodoMutation,
  CreateTodoMutationVariables
>;
export const DeleteTodoDocument = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;
export type DeleteTodoMutationFn = MutationFunction<
  DeleteTodoMutation,
  DeleteTodoMutationVariables
>;

/**
 * __useDeleteTodoMutation__
 *
 * To run a mutation, you first call `useDeleteTodoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTodoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTodoMutation, { data, loading, error }] = useDeleteTodoMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTodoMutation(
  baseOptions?: Apollo.MutationHookOptions<DeleteTodoMutation, DeleteTodoMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteTodoMutation, DeleteTodoMutationVariables>(
    DeleteTodoDocument,
    options
  );
}
export type DeleteTodoMutationHookResult = ReturnType<typeof useDeleteTodoMutation>;
export type DeleteTodoMutationResult = Apollo.MutationResult<DeleteTodoMutation>;
export type DeleteTodoMutationOptions = BaseMutationOptions<
  DeleteTodoMutation,
  DeleteTodoMutationVariables
>;
export const ToggleTodoDocument = gql`
  mutation ToggleTodo($id: ID!) {
    toggleTodo(id: $id) {
      ...TodoFields
    }
  }
  ${TodoFieldsFragmentDoc}
`;
export type ToggleTodoMutationFn = MutationFunction<
  ToggleTodoMutation,
  ToggleTodoMutationVariables
>;

/**
 * __useToggleTodoMutation__
 *
 * To run a mutation, you first call `useToggleTodoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleTodoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleTodoMutation, { data, loading, error }] = useToggleTodoMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useToggleTodoMutation(
  baseOptions?: Apollo.MutationHookOptions<ToggleTodoMutation, ToggleTodoMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ToggleTodoMutation, ToggleTodoMutationVariables>(
    ToggleTodoDocument,
    options
  );
}
export type ToggleTodoMutationHookResult = ReturnType<typeof useToggleTodoMutation>;
export type ToggleTodoMutationResult = Apollo.MutationResult<ToggleTodoMutation>;
export type ToggleTodoMutationOptions = BaseMutationOptions<
  ToggleTodoMutation,
  ToggleTodoMutationVariables
>;
export const UpdateTodoDocument = gql`
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      ...TodoFields
    }
  }
  ${TodoFieldsFragmentDoc}
`;
export type UpdateTodoMutationFn = MutationFunction<
  UpdateTodoMutation,
  UpdateTodoMutationVariables
>;

/**
 * __useUpdateTodoMutation__
 *
 * To run a mutation, you first call `useUpdateTodoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTodoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTodoMutation, { data, loading, error }] = useUpdateTodoMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTodoMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateTodoMutation, UpdateTodoMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateTodoMutation, UpdateTodoMutationVariables>(
    UpdateTodoDocument,
    options
  );
}
export type UpdateTodoMutationHookResult = ReturnType<typeof useUpdateTodoMutation>;
export type UpdateTodoMutationResult = Apollo.MutationResult<UpdateTodoMutation>;
export type UpdateTodoMutationOptions = BaseMutationOptions<
  UpdateTodoMutation,
  UpdateTodoMutationVariables
>;
export const GetTodoDocument = gql`
  query GetTodo($id: ID!) {
    todo(id: $id) {
      ...TodoFields
    }
  }
  ${TodoFieldsFragmentDoc}
`;

/**
 * __useGetTodoQuery__
 *
 * To run a query within a React component, call `useGetTodoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTodoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTodoQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTodoQuery(
  baseOptions: Apollo.QueryHookOptions<GetTodoQuery, GetTodoQueryVariables> &
    ({ variables: GetTodoQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetTodoQuery, GetTodoQueryVariables>(GetTodoDocument, options);
}
export function useGetTodoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetTodoQuery, GetTodoQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetTodoQuery, GetTodoQueryVariables>(GetTodoDocument, options);
}
export function useGetTodoSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetTodoQuery, GetTodoQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetTodoQuery, GetTodoQueryVariables>(GetTodoDocument, options);
}
export type GetTodoQueryHookResult = ReturnType<typeof useGetTodoQuery>;
export type GetTodoLazyQueryHookResult = ReturnType<typeof useGetTodoLazyQuery>;
export type GetTodoSuspenseQueryHookResult = ReturnType<typeof useGetTodoSuspenseQuery>;
export type GetTodoQueryResult = QueryResult<GetTodoQuery, GetTodoQueryVariables>;
export const GetTodosDocument = gql`
  query GetTodos(
    $page: Int
    $limit: Int
    $filter: TodoFilterInput
    $sortBy: TodoSortField
    $sortOrder: SortOrder
  ) {
    todos(page: $page, limit: $limit, filter: $filter, sortBy: $sortBy, sortOrder: $sortOrder) {
      data {
        ...TodoFields
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
  ${TodoFieldsFragmentDoc}
`;

/**
 * __useGetTodosQuery__
 *
 * To run a query within a React component, call `useGetTodosQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTodosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTodosQuery({
 *   variables: {
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *      filter: // value for 'filter'
 *      sortBy: // value for 'sortBy'
 *      sortOrder: // value for 'sortOrder'
 *   },
 * });
 */
export function useGetTodosQuery(
  baseOptions?: Apollo.QueryHookOptions<GetTodosQuery, GetTodosQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetTodosQuery, GetTodosQueryVariables>(GetTodosDocument, options);
}
export function useGetTodosLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetTodosQuery, GetTodosQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetTodosQuery, GetTodosQueryVariables>(GetTodosDocument, options);
}
export function useGetTodosSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetTodosQuery, GetTodosQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetTodosQuery, GetTodosQueryVariables>(GetTodosDocument, options);
}
export type GetTodosQueryHookResult = ReturnType<typeof useGetTodosQuery>;
export type GetTodosLazyQueryHookResult = ReturnType<typeof useGetTodosLazyQuery>;
export type GetTodosSuspenseQueryHookResult = ReturnType<typeof useGetTodosSuspenseQuery>;
export type GetTodosQueryResult = QueryResult<GetTodosQuery, GetTodosQueryVariables>;
export const TodoUpdatedDocument = gql`
  subscription TodoUpdated {
    todoUpdated {
      ...TodoFields
    }
  }
  ${TodoFieldsFragmentDoc}
`;

/**
 * __useTodoUpdatedSubscription__
 *
 * To run a query within a React component, call `useTodoUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useTodoUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTodoUpdatedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useTodoUpdatedSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    TodoUpdatedSubscription,
    TodoUpdatedSubscriptionVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<TodoUpdatedSubscription, TodoUpdatedSubscriptionVariables>(
    TodoUpdatedDocument,
    options
  );
}
export type TodoUpdatedSubscriptionHookResult = ReturnType<typeof useTodoUpdatedSubscription>;
export type TodoUpdatedSubscriptionResult = Apollo.SubscriptionResult<TodoUpdatedSubscription>;

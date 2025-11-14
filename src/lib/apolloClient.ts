import { ApolloClient, InMemoryCache, HttpLink, split, ApolloLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';

// Get API URLs from environment variables
const GRAPHQL_HTTP_URL = import.meta.env.VITE_GRAPHQL_HTTP_URL || 'http://localhost:4000/graphql';
const GRAPHQL_WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql';

// Auth link to add Bearer token to requests
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage
  const token = localStorage.getItem('accessToken');

  // Return the headers with authorization token
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: GRAPHQL_HTTP_URL,
  credentials: 'include', // Changed from 'same-origin' to 'include' for cookies
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: GRAPHQL_WS_URL,
    connectionParams: () => {
      // Add authentication token for WebSocket connections
      const token = localStorage.getItem('accessToken');
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
    // Reconnect on connection loss
    shouldRetry: () => true,
    retryAttempts: 5,
    retryWait: async (retries) => {
      await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * 2 ** retries, 10000)));
    },
  })
);

// Error handling link
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorLink = onError((errorResponse: any) => {
  const { graphQLErrors, networkError, operation } = errorResponse;

  if (graphQLErrors) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphQLErrors.forEach((error: any) => {
      // Handle rate limiting
      if (error.extensions?.code === 'RATE_LIMIT_EXCEEDED') {
        const retryAfter = error.extensions?.retryAfter || 10;
        return;
      }

      console.error(
        `[GraphQL error]: Message: ${error.message}, Location: ${JSON.stringify(
          error.locations
        )}, Path: ${error.path}`,
        error.extensions
      );
    });
  }

  if (networkError) {
    // Handle 429 status code
    if ('statusCode' in networkError && networkError.statusCode === 429) {
      return;
    }

    console.error(`[Network error]: ${networkError}`, {
      operation: operation.operationName,
    });
  }
});

// Logging link for development only
const loggingLink = new ApolloLink((operation, forward) => {
  return forward(operation);
});

// Split link to route requests to appropriate transport
// WebSocket for subscriptions, HTTP for queries and mutations
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink) // Add authLink before httpLink for HTTP requests
);

// Combine all links
// In production, you might want to remove loggingLink
const link = from([errorLink, ...(import.meta.env.DEV ? [loggingLink] : []), splitLink]);

// Configure Apollo Client cache
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        todos: {
          // Enable pagination for todos query
          keyArgs: false,
          merge(_existing = { data: [], meta: {} }, incoming) {
            // For now, just replace with incoming data
            // You can implement more sophisticated pagination logic here
            return incoming;
          },
        },
      },
    },
    Todo: {
      // Cache todos by their ID
      keyFields: ['id'],
    },
  },
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link,
  cache,
  // Default options for queries
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Helper function to get error message from Apollo error
export const getApolloErrorMessage = (error: unknown): string => {
  const apolloError = error as {
    graphQLErrors?: { message: string }[];
    networkError?: Error;
    message?: string;
  };

  if (apolloError.graphQLErrors && apolloError.graphQLErrors.length > 0) {
    return apolloError.graphQLErrors[0].message;
  }
  if (apolloError.networkError) {
    return 'Network error. Please check your connection.';
  }
  return apolloError.message || 'An unexpected error occurred';
};

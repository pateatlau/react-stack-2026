/// <reference types="vite/client" />
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_HTTP_URL ||
  import.meta.env.VITE_GRAPHQL_URL ||
  'http://localhost:8080/graphql';

// HTTP link
const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include',
});

// Auth link to add authorization header
const authLink = setContext((_, { headers }) => {
  const accessToken = localStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

// Error link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error) =>
      console.error(
        `[GraphQL error]: Message: ${error.message}, Location: ${error.locations}, Path: ${error.path}`
      )
    );
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

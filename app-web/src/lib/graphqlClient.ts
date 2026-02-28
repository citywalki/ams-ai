import { GraphQLClient } from 'graphql-request';

const getAuthToken = () => localStorage.getItem('access_token');

const getGraphQLUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (baseUrl) {
    return `${baseUrl}/graphql`;
  }
  return `${window.location.origin}/graphql`;
};

export const graphqlClient = new GraphQLClient(getGraphQLUrl(), {
  headers: (): Record<string, string> => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

export default graphqlClient;

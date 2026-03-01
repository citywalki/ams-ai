import { GraphQLClient } from 'graphql-request';

const endpoint = '/graphql';

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: (): Record<string, string> => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  },
});

export default graphqlClient;

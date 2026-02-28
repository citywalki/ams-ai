import { GraphQLClient, RequestOptions } from 'graphql-request';

const getAuthToken = () => localStorage.getItem('access_token');

export const graphqlClient = new GraphQLClient('/graphql', {
  headers: () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

export default graphqlClient;

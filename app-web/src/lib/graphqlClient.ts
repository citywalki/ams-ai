import { GraphQLClient } from 'graphql-request';
import JSONBig from 'json-bigint';

// Configure json-bigint to parse large integers as strings (not BigInt)
// This preserves precision for snowflake IDs
const JSONBigString = JSONBig({ storeAsString: true, useNativeBigInt: false });

const getAuthToken = () => localStorage.getItem('access_token');

const getGraphQLUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (baseUrl) {
    return `${baseUrl}/graphql`;
  }
  return `${window.location.origin}/graphql`;
};

// Custom response wrapper for json-bigint parsed data
class JSONBigResponse {
  private data: unknown;
  private originalResponse: Response;

  constructor(data: unknown, originalResponse: Response) {
    this.data = data;
    this.originalResponse = originalResponse;
  }

  get ok() { return this.originalResponse.ok; }
  get status() { return this.originalResponse.status; }
  get statusText() { return this.originalResponse.statusText; }
  get headers() { return this.originalResponse.headers; }
  
  async json() { return this.data; }
  async text() { return JSON.stringify(this.data); }
}

export const graphqlClient = new GraphQLClient(getGraphQLUrl(), {
  headers: (): Record<string, string> => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  // Custom fetch function to use json-bigint for parsing
  fetch: async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await fetch(input, init);
    const text = await response.text();
    const data = JSONBigString.parse(text);
    return new JSONBigResponse(data, response) as unknown as Response;
  },
});

export default graphqlClient;

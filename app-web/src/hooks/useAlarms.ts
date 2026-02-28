import { useQuery } from '@tanstack/react-query';
import graphqlClient from '@/lib/graphqlClient';

export type Alarm = {
  id: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  source?: string;
  createdAt: string;
  occurredAt?: string;
};

export type AlarmConnection = {
  content: Alarm[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

const ALARMS_QUERY = `
  query Alarms($page: Int, $size: Int, $orderBy: [OrderByInputInput]) {
    alarms(page: $page, size: $size, orderBy: $orderBy) {
      content {
        id
        title
        description
        severity
        status
        source
        createdAt
        occurredAt
      }
      totalElements
      totalPages
      page
      size
    }
  }
`;

export function useAlarms(page = 0, size = 20) {
  return useQuery({
    queryKey: ['alarms', page, size],
    queryFn: async () => {
      const data = await graphqlClient.request<{ alarms: AlarmConnection }>(
        ALARMS_QUERY,
        { page, size, orderBy: [{ field: 'createdAt', direction: 'DESC' }] }
      );
      return data.alarms;
    },
  });
}

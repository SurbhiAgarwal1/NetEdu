import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import NetworkPage from '../NetworkPage';

const mockNetworkApi = {
  getMeasurements: vi.fn(),
  getTrend: vi.fn(),
  getPublicStats: vi.fn(),
};

vi.mock('../../services/api', () => ({
  networkApi: {
    getMeasurements: (...args: any[]) => mockNetworkApi.getMeasurements(...args),
    getTrend: (...args: any[]) => mockNetworkApi.getTrend(...args),
    getPublicStats: (...args: any[]) => mockNetworkApi.getPublicStats(...args),
  },
}));

vi.mock('../../components/network/SpeedTestWidget', () => ({
  default: () => <div>speed-test-widget</div>,
}));

vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Legend: () => null,
}));

describe('NetworkPage', () => {
  beforeEach(() => {
    mockNetworkApi.getMeasurements.mockReset();
    mockNetworkApi.getTrend.mockReset();
    mockNetworkApi.getPublicStats.mockReset();
  });

  it('shows city rows in Public Data tab from API cities array', async () => {
    mockNetworkApi.getMeasurements.mockResolvedValueOnce({ data: { results: [] } });
    mockNetworkApi.getTrend.mockResolvedValueOnce({ data: [] });
    mockNetworkApi.getPublicStats.mockResolvedValueOnce({
      data: {
        cities: [
          { city: 'Delhi', country: 'India', avg_download: 45.2, avg_latency: 31.1, avg_quality: 81.2, test_count: 7 },
        ],
      },
    });

    render(<NetworkPage />);

    await userEvent.click(screen.getByRole('button', { name: /public data/i }));

    await waitFor(() => {
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Leaderboard from '../Leaderboard';

const mockGetLeaderboard = vi.fn();
const mockGetMyRank = vi.fn();

vi.mock('../../../services/api', () => ({
  analyticsApi: {
    getLeaderboard: (...args: any[]) => mockGetLeaderboard(...args),
    getMyRank: (...args: any[]) => mockGetMyRank(...args),
  },
}));

vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ isDark: true }),
}));

describe('Leaderboard', () => {
  beforeEach(() => {
    mockGetLeaderboard.mockReset();
    mockGetMyRank.mockReset();
  });

  it('renders API-backed entries', async () => {
    mockGetLeaderboard.mockResolvedValueOnce({
      data: {
        leaders: [
          {
            rank: 1,
            user_id: 1,
            name: 'Alice Example',
            avatar: 'AE',
            courses_completed: 2,
            lessons_completed: 10,
            avg_score: 88,
            streak: 3,
            points: 300,
            is_current_user: false,
          },
        ],
      },
    });
    mockGetMyRank.mockResolvedValueOnce({
      data: {
        found: true,
        rank: 1,
        total_users: 1,
        percentile: 100,
        entry: {
          rank: 1,
          user_id: 1,
          name: 'Alice Example',
          avatar: 'AE',
          courses_completed: 2,
          lessons_completed: 10,
          avg_score: 88,
          streak: 3,
          points: 300,
          is_current_user: false,
        },
        neighbors: [],
      },
    });

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getAllByText(/alice example/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/10 lessons/i)).toBeInTheDocument();
    });
  });
});

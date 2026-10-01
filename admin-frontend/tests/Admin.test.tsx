import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Admin from '../src/pages/Admin';
import * as api from '../src/lib/api';

vi.mock('../src/lib/api', async () => {
  const actual = await vi.importActual<typeof import('../src/lib/api')>('../src/lib/api');
  return {
    ...actual,
    adminLogin: vi.fn(),
    fetchStats: vi.fn().mockResolvedValue({
      projectCount: 5,
      articleCount: 3,
      commentCount: 2,
      totalDownloads: 1200,
      latestProject: null,
      latestArticle: null,
    }),
    fetchAdminProjects: vi.fn().mockResolvedValue([
      {
        id: 'p1',
        slug: 'project-one',
        name: 'Project One',
        tagline: 'Test tagline',
        description: 'Test desc',
        category: 'games',
        version: '1.0.0',
        downloads: 500,
        redirect_url: null,
        file_path: null,
        image_url: null,
        source_url: null,
        author: 'DemonZ',
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]),
    fetchAdminArticles: vi.fn().mockResolvedValue([]),
    fetchAdminComments: vi.fn().mockResolvedValue([]),
    fetchAdminMessages: vi.fn().mockResolvedValue([]),
    fetchAdminStudioLog: vi.fn().mockResolvedValue([]),
  };
});

describe('Admin Page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the login screen when unauthenticated', () => {
    render(<Admin />);
    expect(screen.getByText('Authorization Required')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••••••')).toBeInTheDocument();
    expect(screen.getByText('Authenticate Session')).toBeInTheDocument();
  });

  it('authenticates and displays the admin command center', async () => {
    vi.mocked(api.adminLogin).mockResolvedValueOnce('mock-admin-token');

    render(<Admin />);
    const pwdInput = screen.getByPlaceholderText('••••••••••••••••');
    fireEvent.change(pwdInput, { target: { value: 'secret-pass' } });
    fireEvent.click(screen.getByText('Authenticate Session'));

    await waitFor(() => {
      expect(screen.getByText('Admin Command Center')).toBeInTheDocument();
    });

    expect(screen.getByText('DEMONZ')).toBeInTheDocument();
    expect(screen.getByText('HQ')).toBeInTheDocument();
    expect(screen.getByText('SYSTEM ONLINE')).toBeInTheDocument();
  });

  it('renders the dashboard with projects when token is pre-set', async () => {
    sessionStorage.setItem('dzd_admin_token', 'mock-token');

    render(<Admin />);

    await waitFor(() => {
      expect(screen.getByText('Admin Command Center')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Project One')).toBeInTheDocument();
      expect(screen.getByText('project-one')).toBeInTheDocument();
    });
  });

  it('allows switching between tabs', async () => {
    sessionStorage.setItem('dzd_admin_token', 'mock-token');

    render(<Admin />);

    await waitFor(() => {
      expect(screen.getByText('Admin Command Center')).toBeInTheDocument();
    });

    const articlesTab = screen.getByRole('tab', { name: /articles/i });
    fireEvent.click(articlesTab);

    await waitFor(() => {
      expect(api.fetchAdminArticles).toHaveBeenCalledWith('mock-token');
    });

    const backupTab = screen.getByRole('tab', { name: /backup/i });
    fireEvent.click(backupTab);

    expect(screen.getByText('Export Database Snapshot')).toBeInTheDocument();
    expect(screen.getByText('Restore Database Snapshot')).toBeInTheDocument();
  });
});

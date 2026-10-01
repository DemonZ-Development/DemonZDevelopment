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
    generateMcpToken: vi.fn().mockResolvedValue({
      token: 'mock-12h-mcp-token',
      expires_at: new Date(Date.now() + 43200000).toISOString(),
      expires_in_hours: 12,
      server_url: 'https://dzd-api.demonzdevelopment.workers.dev/api/mcp',
    }),
  };
});

describe('Admin Page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the login screen when unauthenticated', () => {
    render(<Admin />);
    expect(screen.getByRole('heading', { name: 'DemonZ Admin' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('authenticates and displays the admin dashboard', async () => {
    vi.mocked(api.adminLogin).mockResolvedValueOnce('mock-admin-token');

    render(<Admin />);
    const pwdInput = screen.getByPlaceholderText('••••••••••••••••');
    fireEvent.change(pwdInput, { target: { value: 'secret-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('DemonZ')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders the dashboard with projects when token is pre-set', async () => {
    sessionStorage.setItem('dzd_admin_token', 'mock-token');

    render(<Admin />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
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
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    const articlesTab = screen.getByRole('tab', { name: /articles/i });
    fireEvent.click(articlesTab);

    await waitFor(() => {
      expect(api.fetchAdminArticles).toHaveBeenCalledWith('mock-token');
    });

    const backupTab = screen.getByRole('tab', { name: /backup/i });
    fireEvent.click(backupTab);

    expect(screen.getByText('Export Database Backup')).toBeInTheDocument();
    expect(screen.getByText('Restore Database Backup')).toBeInTheDocument();

    const mcpTab = screen.getByRole('tab', { name: /mcp/i });
    fireEvent.click(mcpTab);

    expect(screen.getByText('12-Hour Secret Access Key')).toBeInTheDocument();
    expect(screen.getByText('Generate 12-Hour Key')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Generate 12-Hour Key'));
    await waitFor(() => {
      expect(api.generateMcpToken).toHaveBeenCalledWith('mock-token');
      expect(screen.getByText('mock-12h-mcp-token')).toBeInTheDocument();
      expect(screen.getByText('Expires in 12 hours')).toBeInTheDocument();
    });
  });
});

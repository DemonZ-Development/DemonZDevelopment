import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectCard from '../src/components/ProjectCard';
import type { Project } from '../src/lib/api';

const project: Project = {
  id: '1',
  slug: 'dzd-auth',
  name: 'DZD Auth',
  tagline: 'A simple auth template for Cloudflare Workers.',
  description: '',
  category: 'libraries',
  version: '1.0.0',
  downloads: 1234,
  redirect_url: null,
  file_path: null,
  image_url: null,
  source_url: null,
  author: 'DemonZ',
  is_featured: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('ProjectCard', () => {
  it('renders project name, tagline, and download count', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={project} />
      </MemoryRouter>,
    );
    expect(screen.getByText('DZD Auth')).toBeInTheDocument();
    expect(
      screen.getByText('A simple auth template for Cloudflare Workers.'),
    ).toBeInTheDocument();
    expect(screen.getByText('1.2K')).toBeInTheDocument();
  });

  it('shows a category label', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={project} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Libraries')).toBeInTheDocument();
  });

  it('formats millions correctly', () => {
    render(
      <MemoryRouter>
        <ProjectCard
          project={{ ...project, downloads: 2_500_000 }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('2.5M')).toBeInTheDocument();
  });

  it('links to the project detail page', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={project} />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toHaveAttribute('href', '/projects/dzd-auth');
  });
});

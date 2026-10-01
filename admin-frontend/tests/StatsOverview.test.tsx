import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsOverview } from '../src/components/admin/StatsOverview';

describe('StatsOverview', () => {
  it('renders all metrics with proper formatting', () => {
    render(
      <StatsOverview
        projectCount={12}
        articleCount={8}
        pendingComments={3}
        unreadMessages={5}
        totalDownloads={14850}
      />,
    );

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('14,850')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('Published Articles')).toBeInTheDocument();
    expect(screen.getByText('Total Downloads')).toBeInTheDocument();
    expect(screen.getByText('Pending Comments')).toBeInTheDocument();
    expect(screen.getByText('Unread Messages')).toBeInTheDocument();
  });

  it('displays action badges when comments or messages require attention', () => {
    render(
      <StatsOverview
        projectCount={5}
        articleCount={2}
        pendingComments={4}
        unreadMessages={2}
        totalDownloads={500}
      />,
    );

    expect(screen.getByText('4 pending')).toBeInTheDocument();
    expect(screen.getByText('2 unread')).toBeInTheDocument();
  });

  it('triggers onSelectTab when an interactive tile is clicked', () => {
    const onSelectTab = vi.fn();
    render(
      <StatsOverview
        projectCount={10}
        articleCount={5}
        pendingComments={2}
        unreadMessages={1}
        totalDownloads={100}
        onSelectTab={onSelectTab}
      />,
    );

    fireEvent.click(screen.getByLabelText('Active Projects: 10'));
    expect(onSelectTab).toHaveBeenCalledWith('projects');

    fireEvent.click(screen.getByLabelText('Published Articles: 5'));
    expect(onSelectTab).toHaveBeenCalledWith('articles');

    fireEvent.click(screen.getByLabelText('Pending Comments: 2'));
    expect(onSelectTab).toHaveBeenCalledWith('comments');

    fireEvent.click(screen.getByLabelText('Unread Messages: 1'));
    expect(onSelectTab).toHaveBeenCalledWith('messages');
  });
});

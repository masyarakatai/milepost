import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { AnnouncerContext, type AnnouncementKind } from '../../context/announcerStore';
import { OfflineBanner } from './OfflineBanner';

// The banner consumes the shared announcer. Its provider lives behind the
// router (it clears by pathname), so the test mounts the context directly
// and records every announcement it would make.
type Announcement = { text: string; kind: string };
const announcements: Announcement[] = [];
const announce = vi.fn((text: string, kind?: AnnouncementKind) => {
  announcements.push({ text, kind: kind ?? 'status' });
});

function goOffline() {
  act(() => {
    window.dispatchEvent(new Event('offline'));
  });
}

function goOnline() {
  act(() => {
    window.dispatchEvent(new Event('online'));
  });
}

afterEach(() => {
  cleanup();
  goOnline();
  announcements.length = 0;
  announce.mockClear();
});

describe('OfflineBanner (issue #465)', () => {
  it('shows the banner while offline and clears it when the connection returns', () => {
    render(
		<AnnouncerContext.Provider value={{ announce }}>
			<OfflineBanner />
		</AnnouncerContext.Provider>,
	);
    expect(screen.queryByText(/reads and writes will fail until the connection returns/i))
      .toBeNull();

    goOffline();
    expect(screen.getByText(/reads and writes will fail until the connection returns/i))
      .toBeTruthy();

    goOnline();
    expect(screen.queryByText(/reads and writes will fail until the connection returns/i))
      .toBeNull();
  });

  it('announces going offline once and coming back once', () => {
    render(
		<AnnouncerContext.Provider value={{ announce }}>
			<OfflineBanner />
		</AnnouncerContext.Provider>,
	);

    goOffline();
    expect(announcements).toHaveLength(1);
    expect(announcements[0].text).toMatch(/you are offline\./i);
    expect(announcements[0].kind).toBe('alert');

    goOnline();
    expect(announcements).toHaveLength(2);
    expect(announcements[1].text).toMatch(/back online\./i);
    expect(announcements[1].kind).toBe('status');
  });

  it('does not re-announce while the state holds, so offline ticks never stack', () => {
    render(
		<AnnouncerContext.Provider value={{ announce }}>
			<OfflineBanner />
		</AnnouncerContext.Provider>,
	);

    goOffline();
    goOffline();
    goOffline();
    expect(announcements).toHaveLength(1);

    goOnline();
    goOnline();
    expect(announcements).toHaveLength(2);
  });

  it('stays silent on a page that loaded while online', () => {
    render(
		<AnnouncerContext.Provider value={{ announce }}>
			<OfflineBanner />
		</AnnouncerContext.Provider>,
	);
    goOnline();
    expect(announcements).toHaveLength(0);
  });
});

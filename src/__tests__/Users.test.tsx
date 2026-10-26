import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Users from '../Users';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { toast } from 'react-toastify';

vi.mock('@microsoft/fetch-event-source', () => ({
    fetchEventSource: vi.fn(),
}));

vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe('Users', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows admin, manager, and user filter options when role is admin', () => {
        vi.mocked(fetchEventSource).mockResolvedValueOnce(undefined);
        render(<Users role="admin" apiKey="admin-key" />);

        const options = screen.getAllByRole('option').map((opt) => (opt as HTMLOptionElement).value);
        expect(options).toEqual(['admin', 'manager', 'user']);
    });

    it('shows manager and user filter options when role is manager', () => {
        vi.mocked(fetchEventSource).mockResolvedValueOnce(undefined);
        render(<Users role="manager" apiKey="manager-key" />);

        const options = screen.getAllByRole('option').map((opt) => (opt as HTMLOptionElement).value);
        expect(options).toEqual(['manager', 'user']);
    });

    it('shows only user filter option when role is user', () => {
        vi.mocked(fetchEventSource).mockResolvedValueOnce(undefined);
        render(<Users role="user" apiKey="user-key" />);

        const options = screen.getAllByRole('option').map((opt) => (opt as HTMLOptionElement).value);
        expect(options).toEqual(['user']);
    });

    it('streams users with Authorization Bearer header and renders user items', async () => {
        vi.mocked(fetchEventSource).mockImplementationOnce(async (_url, options) => {
            options.onmessage?.({
                id: '1',
                event: 'message',
                data: JSON.stringify({
                    id: 1,
                    name: 'Alice Admin',
                    email: 'alice@example.com',
                    role: 'admin',
                    lastLoginTime: '2026-10-23T10:00:00Z',
                }),
            });
            options.onmessage?.({
                id: '2',
                event: 'message',
                data: JSON.stringify({
                    id: 2,
                    name: 'Bob Manager',
                    email: 'bob@example.com',
                    role: 'manager',
                    lastLoginTime: '2026-10-23T11:00:00Z',
                }),
            });
        });

        render(<Users role="admin" apiKey="secret-token" />);

        await waitFor(() => {
            expect(fetchEventSource).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/users?role=admin'),
                expect.objectContaining({
                    headers: {
                        Authorization: 'Bearer secret-token',
                    },
                })
            );
            expect(screen.getByText(/Alice Admin - alice@example.com/i)).toBeInTheDocument();
            expect(screen.getByText(/Bob Manager - bob@example.com/i)).toBeInTheDocument();
        });
    });

    it('re-fetches users when filter dropdown selection changes', async () => {
        const user = userEvent.setup();
        vi.mocked(fetchEventSource).mockResolvedValue(undefined);

        render(<Users role="admin" apiKey="secret-token" />);

        const select = screen.getByLabelText(/Filter by role:/i);
        await user.selectOptions(select, 'manager');

        await waitFor(() => {
            expect(fetchEventSource).toHaveBeenLastCalledWith(
                expect.stringContaining('/api/v1/users?role=manager'),
                expect.objectContaining({
                    headers: {
                        Authorization: 'Bearer secret-token',
                    },
                })
            );
        });
    });

    it('shows toast error when stream fails', async () => {
        vi.mocked(fetchEventSource).mockRejectedValueOnce(new Error('Stream connection failed'));

        render(<Users role="user" apiKey="user-token" />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'Stream connection failed',
                expect.objectContaining({ toastId: 'stream-error' })
            );
        });
    });
});

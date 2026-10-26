import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { fetchEventSource } from '@microsoft/fetch-event-source';

vi.mock('@microsoft/fetch-event-source', () => ({
    fetchEventSource: vi.fn(),
}));

describe('App integration', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it('starts on Role Assertion stage and transitions to User Dashboard after submitting role', async () => {
        const user = userEvent.setup();

        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => ({ api_key: 'issued-manager-key' }),
        } as Response);

        vi.mocked(fetchEventSource).mockImplementationOnce(async (_url, options) => {
            options.onmessage?.({
                id: '1',
                event: 'message',
                data: JSON.stringify({
                    id: 10,
                    name: 'Jane Manager',
                    email: 'jane@example.com',
                    role: 'manager',
                    lastLoginTime: '2026-10-23T12:00:00Z',
                }),
            });
        });

        render(<App />);

        // Stage 1: Role Assertion
        expect(screen.getByRole('heading', { name: 'Role Assertion' })).toBeInTheDocument();

        await user.click(screen.getByRole('radio', { name: 'manager' }));
        await user.click(screen.getByRole('button', { name: /submit/i }));

        // Stage 2: Dashboard
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'User Dashboard' })).toBeInTheDocument();
        });

        const options = screen.getAllByRole('option').map((opt) => (opt as HTMLOptionElement).value);
        expect(options).toEqual(['manager', 'user']);

        expect(fetchEventSource).toHaveBeenCalledWith(
            expect.stringContaining('/api/v1/users?role=manager'),
            expect.objectContaining({
                headers: {
                    Authorization: 'Bearer issued-manager-key',
                },
            })
        );

        expect(await screen.findByText(/Jane Manager - jane@example.com/i)).toBeInTheDocument();
    });
});

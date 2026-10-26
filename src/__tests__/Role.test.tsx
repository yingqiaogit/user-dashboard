import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoleAssertion from '../Role';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe('RoleAssertion', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it('renders radio buttons for admin, manager, and user with user selected by default', () => {
        const onRoleSubmit = vi.fn();
        render(<RoleAssertion onRoleSubmit={onRoleSubmit} />);

        const adminRadio = screen.getByRole('radio', { name: 'admin' });
        const managerRadio = screen.getByRole('radio', { name: 'manager' });
        const userRadio = screen.getByRole('radio', { name: 'user' });

        expect(adminRadio).not.toBeChecked();
        expect(managerRadio).not.toBeChecked();
        expect(userRadio).toBeChecked();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('submits selected role to /api/v1/assertion and calls onRoleSubmit with api_key and role', async () => {
        const user = userEvent.setup();
        const onRoleSubmit = vi.fn();

        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => ({ api_key: 'test-api-key-123' }),
        } as Response);

        render(<RoleAssertion onRoleSubmit={onRoleSubmit} />);

        await user.click(screen.getByRole('radio', { name: 'admin' }));
        await user.click(screen.getByRole('button', { name: /submit/i }));

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/assertion'),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ role: 'admin' }),
                }
            );
            expect(onRoleSubmit).toHaveBeenCalledWith('test-api-key-123', 'admin');
        });
    });

    it('displays a toast error when assertion request fails', async () => {
        const user = userEvent.setup();
        const onRoleSubmit = vi.fn();

        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
            ok: false,
            status: 403,
            json: async () => ({ message: 'Invalid role assertion' }),
        } as Response);

        render(<RoleAssertion onRoleSubmit={onRoleSubmit} />);

        await user.click(screen.getByRole('radio', { name: 'manager' }));
        await user.click(screen.getByRole('button', { name: /submit/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'Invalid role assertion',
                expect.objectContaining({ toastId: 'assertion-error' })
            );
            expect(onRoleSubmit).not.toHaveBeenCalled();
        });
    });
});

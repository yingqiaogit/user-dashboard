import { useState } from "react";
import { toast } from "react-toastify";

export type UserRole = 'admin' | 'manager' | 'user';

interface RoleAssertionProps {
    onRoleSubmit: (apiKey: string, role: UserRole) => void;
}

interface AssertionResponse {
    token: string;
}

const BACKEND_SERVER = import.meta.env.VITE_BACKEND_SERVER;
const ROLES: UserRole[] = ['admin', 'manager', 'user'];

export default function RoleAssertion({ onRoleSubmit }: RoleAssertionProps) {
    const [role, setRole] = useState<UserRole>('user');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch(`${BACKEND_SERVER}/api/v1/assertion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "role": role }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to assert role (${response.status})`);
            }

            const data: AssertionResponse = await response.json();
            onRoleSubmit(data.token, role);
        } catch (err) {
            toast.error(`${err instanceof Error ? err.message : String(err)}`, {
                toastId: 'assertion-error',
                autoClose: false,
                closeOnClick: true,
            });
        }
    };

    return (
        <form className="role-form" onSubmit={handleSubmit}>
            <p className="role-form-title">Assert your role: </p>
            <div className="role-radio-group">
                {ROLES.map((r) => (
                    <label key={r} className="role-radio-option">
                        <input
                            type="radio"
                            name="role"
                            value={r}
                            checked={role === r}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                        />
                        {r}
                    </label>
                ))}
            </div>
            <div>
                <button type="submit" className="role-submit-btn">Submit</button>
            </div>
        </form>
    );
}


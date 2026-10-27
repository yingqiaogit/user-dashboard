import { useState, useRef, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { toast } from 'react-toastify';
import type { UserRole } from './Role';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    lastLoginTime: string;
}

interface UsersProps {
    role: UserRole;
    apiKey: string;
}

const ROLE_FILTER_OPTIONS: Record<UserRole, UserRole[]> = {
    admin: ['admin', 'manager', 'user'],
    manager: ['manager', 'user'],
    user: ['user'],
};

const BACKEND_SERVER = import.meta.env.VITE_BACKEND_SERVER;

export default function Users({ role, apiKey }: UsersProps) {
    const roles = ROLE_FILTER_OPTIONS[role] ?? ['user'];
    const [selectedRole, setSelectedRole] = useState<UserRole>(roles[0]);
    const [users, setUsers] = useState<User[]>([]);

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        setUsers([] as User[]); // Clear the user list when the selected role changes

        // Abort the previous fetch if it exists to avoid multiple fetches running simultaneously
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            console.log("Abort previous fetch...");
        }

        // keep the current controller for this fetch request
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const fetchByRole = async () => {
            try {
                await fetchEventSource(`${BACKEND_SERVER}/api/v1/users?role=${selectedRole}`, {
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                    onmessage(event) {
                        const user = JSON.parse(event.data) as User;
                        setUsers((prevUsers) => [...prevUsers, user]);
                    },
                    async onopen(response) {
                        if (response.ok) {
                            return;
                        } else {
                            const errorJson = await response.json();
                            console.error('error from open:', errorJson.message);
                            throw new Error(errorJson.message);
                        }
                    },
                    onerror(err) {
                        console.error('Receive error:', err.message);
                        throw err;
                    }
                });
            } catch (err) {
                if (controller.signal.aborted) {
                    return;
                }
                toast.error(`${err instanceof Error ? err.message : String(err)}`, {
                    toastId: 'stream-error',
                    autoClose: false,
                    closeOnClick: true
                });
            }
        };

        fetchByRole();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };

        // const response = await fetch("http://localhost:8080/api/v1/one");
        // const data = await response.json();
        // await setMessage(data.message);
    }, [selectedRole, apiKey]);

    return (
        <div id="next-steps">
            <div id="role-selector">
                <label htmlFor="role-select">Filter by role:</label>
                <select
                    id="role-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                >
                    {roles.map((r) => (
                        <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <ul>
                {users.map((user) => (
                    <li key={user.id} className={user.role}>
                        {user.name} - {user.email} - Last login: {user.lastLoginTime}
                    </li>
                ))}
            </ul>
        </div>
    );
}

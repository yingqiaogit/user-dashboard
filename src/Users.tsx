import { useState, useRef, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { toast, ToastContainer } from 'react-toastify/unstyled';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    lastLoginTime: string;
}

const BACKEND_SERVER = import.meta.env.VITE_BACKEND_SERVER;

export default function Users() {   
   
    const roles = ['admin', 'user', 'viewer', 'all'];
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [users, setUsers] = useState<User[]>([]);

    const abortControllerRef = useRef<AbortController | null>(null);
    
    useEffect(() => {
        setUsers([] as User[]); // Clear the user list when the selected role changes
        
        // Abort the previous fetch if it exists to avoid multiple fetches running simultaneously        
        if(abortControllerRef.current) {
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
                    return
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
    }, [selectedRole]);

    return (
        <div>
            <ToastContainer position="top-right" theme="colored" />
            <div id="next-steps">            
                <label htmlFor="role-select">Filter by role:</label>
                <select
                    id="role-select"
                    value={selectedRole}                
                    onChange={(e) => setSelectedRole(e.target.value)}
                >
                    {roles.map((role) => (
                        <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                    ))}
                </select>
            
                <ul>
                    {users.map((user) => (
                        <li key={user.id} className={user.role}>
                            {user.name} - {user.email} - Last login: {user.lastLoginTime}
                        </li>
                    ))}
                </ul>            
            </div>
        </div>        
    );
}
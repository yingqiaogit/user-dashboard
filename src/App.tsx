import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css'
import Header from './Header';
import Users from './Users';
import RoleAssertion, { type UserRole } from './Role';
import { useState } from 'react';

const STAGES = ['ROLEASSERTION', 'DASHBOARD'] as const;

export default function App() {
  const [stage, setStage] = useState<string>(STAGES[0]);
  const [apiKey, setApiKey] = useState<string>('');
  const [role, setRole] = useState<UserRole>('user');

  const handleRoleSubmit = (receivedApiKey: string, selectedRole: UserRole) => {
    setApiKey(receivedApiKey);
    setRole(selectedRole);
    setStage(STAGES[1]);
  };

  return (
    <div id="center">
      <ToastContainer position="top-right" theme="colored" />
      {stage === 'ROLEASSERTION' && (
        <div>
          <Header title="Role Assertion" />
          <RoleAssertion onRoleSubmit={handleRoleSubmit} />
        </div>
      )}

      {stage === 'DASHBOARD' && (
        <div>
          <Header title="User Dashboard" />
          <Users apiKey={apiKey} role={role} />
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import DynamicForm from './components/DynamicForm';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {!user ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <DynamicForm user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
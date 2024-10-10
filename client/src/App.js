import React, { useState } from 'react';
import Dashboard from './Dashboard';
import DailyStairLogger from './DailyStairLogger';
import { Login, Register } from './AuthForms';  // Import from AuthForms.js
import { LogOut } from 'lucide-react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showDashboard, setShowDashboard] = useState(false);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowDashboard(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
            Escalera Challenge App
          </h1>
          {isLoggedIn && (
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full shadow-md hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition-all duration-300"
              >
                {showDashboard ? 'Show Logger' : 'Show Dashboard'}
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-full shadow-md hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75 transition-all duration-300 flex items-center"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
        {isLoggedIn ? (
          showDashboard ? <Dashboard /> : <DailyStairLogger />
        ) : (
          <div className="mt-8 space-y-8">
            <Login onLogin={handleLogin} />
            <Register onRegister={handleLogin} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
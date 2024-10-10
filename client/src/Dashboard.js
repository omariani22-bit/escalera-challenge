import React, { useState, useEffect } from 'react';
import * as Icon from 'lucide-react';

const API_URL = 'http://localhost:3001';

const Dashboard = () => {
  const [logs, setLogs] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' or 'week'

  useEffect(() => {
    fetchLogs();
  }, [currentDate, view]);

  const fetchLogs = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/all-logs`, {
        headers: { 'Authorization': token }
      });
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      const groupedLogs = groupLogsByDateAndUser(data);
      setLogs(groupedLogs);
      const uniqueUsers = [...new Set(data.map(log => log.username))];
      setUsers(uniqueUsers);
      if (!selectedUser && uniqueUsers.length > 0) {
        setSelectedUser(uniqueUsers[0]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert('Failed to fetch logs. Please try again.');
    }
  };

  const groupLogsByDateAndUser = (data) => {
    return data.reduce((acc, log) => {
      if (!acc[log.username]) acc[log.username] = {};
      if (!acc[log.username][log.date]) {
        acc[log.username][log.date] = {
          upstairs: 0, downstairs: 0, liftUsesUp: 0, liftUsesDown: 0
        };
      }
      acc[log.username][log.date].upstairs += log.upstairs;
      acc[log.username][log.date].downstairs += log.downstairs;
      acc[log.username][log.date].liftUsesUp += log.lift_uses_up;
      acc[log.username][log.date].liftUsesDown += log.lift_uses_down;
      return acc;
    }, {});
  };

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const renderMonthCalendar = () => {
    const days = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const calendar = [];

    for (let i = 0; i < firstDay; i++) {
      calendar.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= days; day++) {
      const date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayLogs = selectedUser && logs[selectedUser] ? logs[selectedUser][date] || {} : {};
      calendar.push(
        <div key={day} className="p-2 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="font-bold text-lg mb-2">{day}</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center" title="Stairs Up">
              <Icon.MoveUp className="mr-1 text-green-500" size={16} />
              <span>{dayLogs.upstairs || 0}</span>
            </div>
            <div className="flex items-center" title="Stairs Down">
              <Icon.MoveDown className="mr-1 text-yellow-500" size={16} />
              <span>{dayLogs.downstairs || 0}</span>
            </div>
            <div className="flex items-center" title="Lift Up">
              <Icon.ArrowBigUp className="mr-1 text-red-500" size={16} />
              <span>{dayLogs.liftUsesUp || 0}</span>
            </div>
            <div className="flex items-center" title="Lift Down">
              <Icon.ArrowBigDown className="mr-1 text-blue-500" size={16} />
              <span>{dayLogs.liftUsesDown || 0}</span>
            </div>
          </div>
        </div>
      );
    }

    return calendar;
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekDays = [];
    for (let day = new Date(startOfWeek); day <= endOfWeek; day.setDate(day.getDate() + 1)) {
      weekDays.push(new Date(day));
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="p-2 border">User</th>
              {weekDays.map((day, index) => (
                <th key={index} className="p-2 border">
                  {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user}>
                <td className="p-2 border font-semibold">{user}</td>
                {weekDays.map((day, index) => {
                  const date = day.toISOString().split('T')[0];
                  const dayLogs = logs[user] && logs[user][date] ? logs[user][date] : {};
                  return (
                    <td key={index} className="p-2 border">
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div title="Stairs Up" className="flex items-center">
                          <Icon.MoveUp className="mr-1 text-green-500" size={12} />
                          <span>{dayLogs.upstairs || 0}</span>
                        </div>
                        <div title="Stairs Down" className="flex items-center">
                          <Icon.MoveDown className="mr-1 text-yellow-500" size={12} />
                          <span>{dayLogs.downstairs || 0}</span>
                        </div>
                        <div title="Lift Up" className="flex items-center">
                          <Icon.ArrowBigUp className="mr-1 text-red-500" size={12} />
                          <span>{dayLogs.liftUsesUp || 0}</span>
                        </div>
                        <div title="Lift Down" className="flex items-center">
                          <Icon.ArrowBigDown className="mr-1 text-blue-500" size={12} />
                          <span>{dayLogs.liftUsesDown || 0}</span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const changeDate = (increment) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (view === 'month') {
        newDate.setMonth(newDate.getMonth() + increment);
      } else {
        newDate.setDate(newDate.getDate() + (7 * increment));
      }
      return newDate;
    });
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Activity Dashboard</h2>
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setView('month')} className={`px-4 py-2 rounded ${view === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          Month View
        </button>
        <button onClick={() => setView('week')} className={`px-4 py-2 rounded ${view === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          Week View
        </button>
      </div>
      {view === 'month' && (
        <div className="mb-6">
          <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">Select User:</label>
          <select
            id="user-select"
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-white transition-colors duration-300">
          <Icon.ChevronLeft size={24} />
        </button>
        <h3 className="text-2xl font-semibold">
          {view === 'month' 
            ? currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
            : `Week of ${currentDate.toLocaleDateString()}`
          }
        </h3>
        <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-white transition-colors duration-300">
          <Icon.ChevronRight size={24} />
        </button>
      </div>
      {view === 'month' ? (
        <div className="grid grid-cols-7 gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold">{day}</div>
          ))}
          {renderMonthCalendar()}
        </div>
      ) : (
        renderWeekView()
      )}
      <div className="mt-6 text-sm text-gray-600">
        <p><Icon.MoveUp className="inline mr-1 text-green-500" size={16} /> Stairs Up</p>
        <p><Icon.MoveDown className="inline mr-1 text-yellow-500" size={16} /> Stairs Down</p>
        <p><Icon.ArrowBigUp className="inline mr-1 text-red-500" size={16} /> Lift Up</p>
        <p><Icon.ArrowBigDown className="inline mr-1 text-blue-500" size={16} /> Lift Down</p>
      </div>
    </div>
  );
};

export default Dashboard;
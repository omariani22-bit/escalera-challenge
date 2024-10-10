import React, { useState } from 'react';
// import { PlusCircle, MinusCircle, Stairs, Elevator } from 'lucide-react';
import * as Icon from 'lucide-react';

const API_URL = 'http://localhost:3001';

const DailyStairLogger = () => {
  const [upstairs, setUpstairs] = useState(0);
  const [downstairs, setDownstairs] = useState(0);
  const [liftUsesUp, setLiftUsesUp] = useState(0);
  const [liftUsesDown, setLiftUsesDown] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          upstairs,
          downstairs,
          liftUsesUp,
          liftUsesDown
        }),
      });
      const data = await response.json();
      if (data.id) {
        alert('Activity logged successfully');
        setUpstairs(0);
        setDownstairs(0);
        setLiftUsesUp(0);
        setLiftUsesDown(0);
      } else {
        alert('Failed to log activity: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Logging error:', error);
      alert('Failed to log activity. Please try again.');
    }
  };

  const CounterButton = ({ value, setValue, label, iconName, color }) => (
  <div className={`flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${color}`}>
    <div className="text-3xl mb-4">
      {React.createElement(Icon[iconName], { size: 24 })}
    </div>
    <span className="text-lg font-semibold mb-3">{label}</span>
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => setValue(Math.max(0, value - 1))}
        className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-300"
      >
        {React.createElement(Icon.MinusCircle, { size: 28 })}
      </button>
      <span className="mx-4 text-3xl font-bold">{value}</span>
      <button
        type="button"
        onClick={() => setValue(value + 1)}
        className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-300"
      >
        {React.createElement(Icon.PlusCircle, { size: 28 })}
      </button>
    </div>
  </div>
);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Daily Activity Logger</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <CounterButton value={upstairs} setValue={setUpstairs} label="Upstairs" iconName="MoveUp" color="hover:bg-green-50" />
          <CounterButton value={downstairs} setValue={setDownstairs} label="Downstairs" iconName="MoveDown" color="hover:bg-yellow-50" />
          <CounterButton value={liftUsesUp} setValue={setLiftUsesUp} label="Lift Up" iconName="ArrowBigUp" color="hover:bg-red-50" />
          <CounterButton value={liftUsesDown} setValue={setLiftUsesDown} label="Lift Down" iconName="ArrowBigDown" color="hover:bg-blue-50" />
        </div>
        <button
          type="submit"
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-xl shadow-md hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition-all duration-300"
        >
          Log Activity
        </button>
      </form>
    </div>
  );
};

export default DailyStairLogger;
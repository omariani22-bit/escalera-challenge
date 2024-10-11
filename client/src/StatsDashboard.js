import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || '';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/stats`, {
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div className="stats-dashboard">
      <h2>Escalera Challenge Stats</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <h3>Top Climber This Week</h3>
          <p>{stats.topUserWeek?.username} ({stats.topUserWeek?.totalStairs} stairs)</p>
        </div>
        <div className="stat-item">
          <h3>Top Climber This Month</h3>
          <p>{stats.topUserMonth?.username} ({stats.topUserMonth?.totalStairs} stairs)</p>
        </div>
        <div className="stat-item">
          <h3>Needs More Steps This Week</h3>
          <p>{stats.bottomUserWeek?.username} ({stats.bottomUserWeek?.totalStairs} stairs)</p>
        </div>
        <div className="stat-item">
          <h3>Needs More Steps This Month</h3>
          <p>{stats.bottomUserMonth?.username} ({stats.bottomUserMonth?.totalStairs} stairs)</p>
        </div>
        <div className="stat-item">
          <h3>Newest Challenger</h3>
          <p>{stats.newestChallenger}</p>
        </div>
        <div className="stat-item">
          <h3>Total Challengers</h3>
          <p>{stats.numberOfChallengers}</p>
        </div>
        <div className="stat-item">
          <h3>Total Stairs Climbed This Month</h3>
          <p>{stats.totalStairsThisMonth}</p>
        </div>
        <div className="stat-item">
          <h3>Average Stairs per User</h3>
          <p>{stats.averageStairsPerUser}</p>
        </div>
      </div>
      <div className="chart-container">
        <h3>Top Climbers Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.topTwoUsers}>
            <XAxis dataKey="username" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalStairs" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsDashboard;
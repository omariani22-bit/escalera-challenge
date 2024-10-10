import React, { useState } from 'react';
import { User, Lock, UserPlus, Mail, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3001';

const InputField = ({ icon, type, placeholder, value, onChange, error }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      type={type}
      className={`block w-full pl-10 pr-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
    {error && (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <AlertCircle className="h-5 w-5 text-red-500" />
      </div>
    )}
  </div>
);

const ErrorMessage = ({ message }) => (
  <p className="mt-2 text-sm text-red-600">{message}</p>
);

export const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.auth) {
        localStorage.setItem('token', data.token);
        onLogin();
      } else {
        if (data.error === 'User not found') {
          setErrors({ username: 'User not found' });
        } else if (data.error === 'Invalid password') {
          setErrors({ password: 'Invalid password' });
        } else {
          setErrors({ general: data.error || 'Login failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again later.' });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <InputField
            icon={<User className="h-5 w-5 text-gray-400" />}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
          />
          {errors.username && <ErrorMessage message={errors.username} />}
        </div>
        <div>
          <InputField
            icon={<Lock className="h-5 w-5 text-gray-400" />}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {errors.password && <ErrorMessage message={errors.password} />}
        </div>
        {errors.general && <ErrorMessage message={errors.general} />}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (data.auth) {
        localStorage.setItem('token', data.token);
        onRegister();
      } else {
        if (data.error === 'Username already exists') {
          setErrors({ username: 'Username already taken' });
        } else if (data.error === 'Email already exists') {
          setErrors({ email: 'Email already in use' });
        } else if (data.error === 'Invalid email format') {
          setErrors({ email: 'Invalid email format' });
        } else if (data.error === 'Password too weak') {
          setErrors({ password: 'Password must be at least 8 characters long and include a number' });
        } else {
          setErrors({ general: data.error || 'Registration failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again later.' });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <InputField
            icon={<User className="h-5 w-5 text-gray-400" />}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
          />
          {errors.username && <ErrorMessage message={errors.username} />}
        </div>
        <div>
          <InputField
            icon={<Mail className="h-5 w-5 text-gray-400" />}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          {errors.email && <ErrorMessage message={errors.email} />}
        </div>
        <div>
          <InputField
            icon={<Lock className="h-5 w-5 text-gray-400" />}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {errors.password && <ErrorMessage message={errors.password} />}
        </div>
        {errors.general && <ErrorMessage message={errors.general} />}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          Register
        </button>
      </form>
    </div>
  );
};
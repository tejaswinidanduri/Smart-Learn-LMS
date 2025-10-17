import React, { useState } from 'react';
import type { UserRole, User } from '../types';
import { useAppContext } from '../App';
import { SmartLearnLogo, GoogleIcon, UserPlusIcon, UserCircleIcon } from './Icons';
import { Button, Input, Modal } from './ui';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, users, loginWithUserObject } = useAppContext();
  const [error, setError] = useState('');
  const [isGoogleModalOpen, setGoogleModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student' as UserRole,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const success = login(formData.email, formData.password);
      if (!success) setError('Invalid email or password.');
    } else {
      const success = register(formData.name, formData.email, formData.password, formData.role);
      if (!success) setError('User with this email already exists.');
    }
  };

  const handleGoogleSignIn = () => {
    if (users.length === 0) {
      setError("No accounts found. Please register an account first.");
      return;
    }
    setError('');
    setGoogleModalOpen(true);
  };
  
  const handleGoogleUserSelect = (user: User) => {
    loginWithUserObject(user);
    setGoogleModalOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="max-w-md w-full space-y-6 p-10 glassmorphism rounded-xl shadow-[0_0_25px_theme(colors.primary/0.7)]">
        <div className="text-center">
            <div className="flex justify-center mx-auto mb-4">
                <SmartLearnLogo />
            </div>
          <h2 className="text-3xl font-extrabold text-copy neon-text-primary">
            Welcome to Smart Learn
          </h2>
          <p className="mt-2 text-md text-copy-light">
            {isLogin ? 'Sign in to continue' : 'Create an account to get started'}
          </p>
        </div>

        <div>
            <button 
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-white/20 rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-colors duration-300"
            >
                <GoogleIcon className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium text-gray-800">Continue with Google</span>
            </button>
            
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-surface text-copy-light rounded-md">OR</span>
                </div>
            </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <Input id="name" name="name" type="text" label="Full Name" value={formData.name} onChange={handleChange} required />
          )}
          <Input id="email" name="email" type="email" label="Email address" autoComplete="email" value={formData.email} onChange={handleChange} required />
          <Input id="password" name="password" type="password" label="Password" autoComplete="current-password" value={formData.password} onChange={handleChange} required />
          {!isLogin && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-copy-light">I am a...</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full bg-black/20 border border-white/20 rounded-lg py-2 px-3 text-copy focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm">
                <option>Student</option>
                <option>Teacher</option>
              </select>
            </div>
          )}
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          <div>
            <Button type="submit" className="w-full">
              {isLogin ? 'Sign in' : 'Register'}
            </Button>
          </div>
        </form>

         <p className="text-sm text-copy-light text-center">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => { setIsLogin(!isLogin); setError('')}} className="font-medium text-primary hover:text-primary-focus ml-1">
              {isLogin ? 'create one' : 'sign in'}
            </button>
        </p>
      </div>
      
      <Modal isOpen={isGoogleModalOpen} onClose={() => setGoogleModalOpen(false)} title="">
        <div className="text-center mb-6">
            <GoogleIcon className="h-8 w-8 mx-auto" />
            <h3 className="text-2xl font-semibold mt-4">Choose an account</h3>
            <p className="text-copy-light mt-1">to continue to Smart Learn</p>
        </div>
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {users.map(user => (
                <li key={user.id}>
                    <button onClick={() => handleGoogleUserSelect(user)} className="w-full text-left p-3 flex items-center rounded-lg hover:bg-white/10 transition-colors duration-200">
                        <UserCircleIcon className="h-10 w-10 mr-4 text-copy-light" />
                        <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-copy-light">{user.email}</p>
                        </div>
                    </button>
                </li>
            ))}
        </ul>
        <div className="mt-4 border-t border-white/10 pt-4">
             <button onClick={() => { setGoogleModalOpen(false); setIsLogin(false); }} className="w-full text-left p-3 flex items-center rounded-lg hover:bg-white/10 transition-colors duration-200">
                <div className="h-10 w-10 mr-4 flex items-center justify-center">
                    <UserPlusIcon />
                </div>
                <div>
                    <p className="font-semibold">Use another account</p>
                </div>
            </button>
        </div>
      </Modal>
    </div>
  );
};

export default Auth;
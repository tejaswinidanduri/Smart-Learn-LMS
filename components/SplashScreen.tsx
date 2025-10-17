import React from 'react';
import { SmartLearnLogo } from './Icons';

const SplashScreen: React.FC = () => {
  return (
    <div className="splash-screen">
      <div className="logo-container">
        <SmartLearnLogo />
      </div>
    </div>
  );
};

export default SplashScreen;

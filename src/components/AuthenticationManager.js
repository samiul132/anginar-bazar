'use client';

import { useState } from 'react';
import LoginModal from './LoginModal';
import OtpVerificationModal from './OtpVerificationModal';
import CompleteProfileModal from './CompleteProfileModal';

export default function AuthenticationManager({ isOpen, onClose, onAuthSuccess }) {
  const [currentStep, setCurrentStep] = useState('login'); 
  const [phone, setPhone] = useState('');
  const [userData, setUserData] = useState(null);

  const handleLoginSuccess = ({ phone, step }) => {
    setPhone(phone);
    setCurrentStep(step);
  };

  const handleOtpSuccess = ({ user, requiresProfile }) => {
    setUserData(user);
    if (requiresProfile) {
      setCurrentStep('profile');
    } else {
      // User is fully authenticated
      onAuthSuccess(user);
      handleClose();
    }
  };

  const handleProfileSuccess = ({ user }) => {
    // User profile completed
    onAuthSuccess(user);
    handleClose();
  };

  const handleBackFromOtp = () => {
    setCurrentStep('login');
    setPhone('');
  };

  const handleBackFromProfile = () => {
    setCurrentStep('otp');
  };

  const handleClose = () => {
    // Reset state when closing
    setCurrentStep('login');
    setPhone('');
    setUserData(null);
    onClose();
  };

  return (
    <>
      <LoginModal
        isOpen={isOpen && currentStep === 'login'}
        onClose={handleClose}
        onSuccess={handleLoginSuccess}
      />

      <OtpVerificationModal
        isOpen={isOpen && currentStep === 'otp'}
        onClose={handleClose}
        onSuccess={handleOtpSuccess}
        onBack={handleBackFromOtp}
        phone={phone}
      />

      <CompleteProfileModal
        isOpen={isOpen && currentStep === 'profile'}
        onClose={handleClose}
        onSuccess={handleProfileSuccess}
        onBack={handleBackFromProfile}
        phone={phone}
      />
    </>
  );
}
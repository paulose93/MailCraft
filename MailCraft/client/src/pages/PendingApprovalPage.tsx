import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2, MailCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PendingApprovalPage: React.FC = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();

  // Poll for user status every 15 seconds (gentle on rate limits)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUser();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchUser]);

  // If user becomes ACTIVE, the ProtectedRoute logic will handle the redirect,
  // but we can also just redirect here as a fallback or let ProtectedRoute handle it.
  useEffect(() => {
    if (user?.organization?.status === 'ACTIVE') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center shadow-lg"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          {user?.organization?.status === 'REQUESTED' ? (
            <ShieldAlert className="w-8 h-8 text-primary" />
          ) : (
            <MailCheck className="w-8 h-8 text-indigo-500" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Account Pending Approval</h2>
        
        <div className="space-y-4 text-muted-foreground mb-8">
          <p>
            Your organization <strong className="text-foreground">{user?.organization?.name}</strong> is currently in the 
            <span className="font-medium px-2 py-1 bg-secondary rounded-md mx-1">
              {user?.organization?.status === 'UNDER_REVIEW' ? 'UNDER REVIEW' : 'REQUESTED'}
            </span> 
            state.
          </p>
          <p className="text-sm">
            Our team is reviewing your account. This usually takes less than 24 hours. This page will automatically update once you are approved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary bg-primary/5 py-3 rounded-lg border border-primary/10">
          <Loader2 className="w-4 h-4 animate-spin" />
          Waiting for admin approval...
        </div>
      </motion.div>
    </div>
  );
};

export default PendingApprovalPage;

'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { IconMail, IconLock, IconUser, IconArrowRight, IconArrowLeft, IconAlertCircle, IconUsers, IconSchool, IconHash, IconUpload, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  
  const [step, setStep] = useState('email'); // 'email', 'login', 'register', 'team-members', 'payment'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [additionalMembers, setAdditionalMembers] = useState([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [currentMemberData, setCurrentMemberData] = useState({ name: '', email: '', yearOfStudy: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentScreenshots, setPaymentScreenshots] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if user exists in teams table
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('leader_email', email)
      .single();

    if (teamError) {
      // Check if it's a "not found" error (PGRST116)
      if (teamError.code === 'PGRST116' || teamError.message.includes('multiple (or no) rows')) {
        // User doesn't exist, show registration form
        setStep('register');
      } else {
        // Network error, database error, or other issue - show error message
        setError('Unable to verify email. Please check your connection and try again.');
      }
    } else if (teamData) {
      // User exists, show login form
      setStep('login');
    } else {
      // No data and no error (shouldn't happen, but handle it)
      setStep('register');
    }
    
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify credentials against database
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('leader_email', email)
        .single();

      if (!teamData) {
        throw new Error('Account not found');
      }

      if (teamData.password !== password) {
        throw new Error('Invalid password');
      }

      // Login successful - save minimal session data (fetch full data from DB on load)
      const sessionData = {
        teamId: teamData.team_id,
        teamName: teamData.team_name,
        leaderEmail: teamData.leader_email,
        totalMembers: teamData.total_members,
      };
      localStorage.setItem('teamSession', JSON.stringify(sessionData));
      window.dispatchEvent(new Event('sessionUpdate'));

      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };



  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    const totalMembers = parseInt(teamMembers);
    const additionalMembersNeeded = totalMembers - 1; // Subtract the leader
    
    if (additionalMembersNeeded > 0) {
      // Move to team members step
      setStep('team-members');
      setCurrentMemberIndex(0);
      setAdditionalMembers([]);
    } else {
      // No additional members, move to payment step
      setStep('payment');
    }
  };

  const handleAddTeamMember = (e) => {
    e.preventDefault();
    setError('');
    
    const totalMembers = parseInt(teamMembers);
    const additionalMembersNeeded = totalMembers - 1;
    
    // Add current member to list
    const updatedMembers = [...additionalMembers, currentMemberData];
    setAdditionalMembers(updatedMembers);
    
    if (currentMemberIndex + 1 < additionalMembersNeeded) {
      // More members to add
      setCurrentMemberIndex(currentMemberIndex + 1);
      setCurrentMemberData({ name: '', email: '', yearOfStudy: '' });
    } else {
      // All members added, move to payment step
      setStep('payment');
    }
  };

  const completeRegistration = async (members = additionalMembers) => {
    setLoading(true);
    try {
      // Double-check that email doesn't already exist (prevents race conditions)
      const { data: existingTeam, error: checkError } = await supabase
        .from('teams')
        .select('team_id')
        .eq('leader_email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116' && !checkError.message.includes('multiple (or no) rows')) {
        // A real error occurred (not just "not found")
        throw new Error('Unable to verify email availability. Please try again.');
      }

      if (existingTeam) {
        // Email already exists
        throw new Error('This email is already registered. Please use the login option.');
      }

      // Upload payment screenshots to Supabase Storage
      const payment_screenshot_urls = [];
      if (paymentScreenshots.length > 0) {
        for (let i = 0; i < paymentScreenshots.length; i++) {
          const file = paymentScreenshots[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `payment-screenshots/${fileName}`;

          console.log(`Uploading screenshot ${i + 1}:`, fileName);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('hackathon-files')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error details:', uploadError);
            
            // Provide specific error messages
            if (uploadError.message.includes('not found')) {
              throw new Error('Storage bucket not configured. Please contact admin to set up storage.');
            } else if (uploadError.message.includes('already exists')) {
              throw new Error(`File conflict. Please try again.`);
            } else if (uploadError.message.includes('not allowed') || uploadError.message.includes('policy')) {
              throw new Error('Storage permissions not configured. Please contact admin.');
            } else {
              throw new Error(`Failed to upload screenshot ${i + 1}: ${uploadError.message}`);
            }
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('hackathon-files')
            .getPublicUrl(filePath);
          
          payment_screenshot_urls.push(publicUrl);
          console.log(`Screenshot ${i + 1} uploaded successfully:`, publicUrl);
        }
      }

      // Generate a unique team ID
      const teamId = crypto.randomUUID();
      
      // Prepare team data with individual member columns
      const teamData = {
        team_id: teamId,
        team_name: teamName,
        total_members: parseInt(teamMembers),
        password: password,
        payment_screenshot_urls: JSON.stringify(payment_screenshot_urls),
        // Leader (Member 1)
        leader_name: name,
        leader_email: email,
        leader_year: yearOfStudy,
        // Member 2
        member2_name: members[0]?.name || null,
        member2_email: members[0]?.email || null,
        member2_year: members[0]?.yearOfStudy || null,
        // Member 3
        member3_name: members[1]?.name || null,
        member3_email: members[1]?.email || null,
        member3_year: members[1]?.yearOfStudy || null,
        // Member 4
        member4_name: members[2]?.name || null,
        member4_email: members[2]?.email || null,
        member4_year: members[2]?.yearOfStudy || null,
        created_at: new Date().toISOString(),
      };
      
      // Insert single row with all team members
      const { error: insertError } = await supabase
        .from('teams')
        .insert([teamData]);
      
      if (insertError) throw insertError;

      // Save minimal session data (fetch full data from DB on load)
      const sessionData = {
        teamId: teamId,
        teamName: teamName,
        leaderEmail: email,
        totalMembers: parseInt(teamMembers),
      };
      localStorage.setItem('teamSession', JSON.stringify(sessionData));
      window.dispatchEvent(new Event('sessionUpdate'));

      router.push('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      // Go back from payment to previous step
      const totalMembers = parseInt(teamMembers);
      if (totalMembers > 1) {
        setStep('team-members');
        // Reset to last team member
        setCurrentMemberIndex(additionalMembers.length - 1);
      } else {
        setStep('register');
      }
    } else if (step === 'team-members') {
      if (currentMemberIndex > 0) {
        // Go back to previous team member
        setCurrentMemberIndex(currentMemberIndex - 1);
        setCurrentMemberData(additionalMembers[currentMemberIndex - 1]);
        setAdditionalMembers(additionalMembers.slice(0, -1));
      } else {
        // Go back to register step
        setStep('register');
        setCurrentMemberIndex(0);
        setAdditionalMembers([]);
        setCurrentMemberData({ name: '', email: '', yearOfStudy: '' });
      }
    } else {
      setStep('email');
      setError('');
      setPassword('');
      setName('');
      setTeamName('');
      setTeamMembers('');
      setYearOfStudy('');
      setAdditionalMembers([]);
      setCurrentMemberIndex(0);
      setCurrentMemberData({ name: '', email: '', yearOfStudy: '' });
      setPaymentScreenshots([]);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (paymentScreenshots.length === 0) {
      setError('Please upload at least one payment screenshot');
      return;
    }
    
    await completeRegistration();
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 overflow-hidden" style={{ background: '#0055FF' }}>
      {/* Y2K Animated background shapes */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: shouldReduceMotion ? 0.4 : 0.6 }}
        transition={{ duration: shouldReduceMotion ? 0.5 : 1 }}
      >
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 border-4 rounded-full"
          style={{ borderColor: '#CCFF00' }}
          initial={{ scale: 0, rotate: shouldReduceMotion ? 0 : -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.3 : 1.5, delay: shouldReduceMotion ? 0.2 : 0.5, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-20 h-20 border-4 rounded-full"
          style={{ borderColor: '#FFFFFF' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: shouldReduceMotion ? 0.3 : 1.2, delay: shouldReduceMotion ? 0.2 : 0.7, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute bottom-40 left-20 w-16 h-16 rounded-full"
          style={{ background: '#CCFF00' }}
          initial={{ y: shouldReduceMotion ? 0 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 0.7 }}
          transition={{ duration: shouldReduceMotion ? 0.3 : 1, delay: shouldReduceMotion ? 0.2 : 0.9, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute top-60 right-10 w-24 h-24 border-4 transform rotate-45"
          style={{ borderColor: '#001A6E' }}
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 45 }}
          transition={{ duration: shouldReduceMotion ? 0.3 : 1.3, delay: shouldReduceMotion ? 0.2 : 1.1, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute bottom-60 right-40 w-12 h-12 border-4 transform rotate-12"
          style={{ borderColor: '#CCFF00' }}
          initial={{ scale: 0, rotate: 12 }}
          animate={{ scale: 1, rotate: 12 }}
          transition={{ duration: shouldReduceMotion ? 0.3 : 1.1, delay: shouldReduceMotion ? 0.2 : 1.3, ease: "easeOut" }}
        />
      </motion.div>

      {/* Login Form Container - Y2K Window Style */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 50, scale: shouldReduceMotion ? 1 : 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.4 : 0.8, delay: shouldReduceMotion ? 0.1 : 0.3 }}
      >
        <motion.div
          className="flex flex-col"
          style={{
            border: '3px solid #001A6E',
            background: '#FFFFFF',
            boxShadow: '8px 8px 0px #001A6E',
          }}
        >
          {/* Header */}
          {/* Y2K Window Title Bar */}
          <div className="flex items-center justify-between px-4 py-2 shrink-0"
            style={{ background: '#CCFF00', borderBottom: '3px solid #001A6E' }}>
            <span className="font-bold text-sm uppercase tracking-wide" 
              style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
              {step === 'email' ? '⚡ Welcome' : step === 'login' ? '🔐 Login' : step === 'team-members' ? '👥 Team Members' : step === 'payment' ? '💳 Payment' : '📝 Register'}
            </span>
            <div className="flex items-center justify-center w-5 h-5"
              style={{ background: '#FFFFFF', border: '2px solid #001A6E' }}>
              <span className="text-xs font-bold" style={{ color: '#001A6E' }}>✕</span>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6" style={{ background: '#FFFFFF' }}>
            {/* Subtitle */}
            <motion.div className="text-center mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: shouldReduceMotion ? 0.1 : 0.4 }}
            >
              <p className="text-sm font-medium uppercase tracking-wide" 
                style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                {step === 'email' ? 'Enter your email to continue' : 
                 step === 'login' ? 'Enter your password' : 
                 step === 'team-members' ? `Member ${currentMemberIndex + 2} of ${teamMembers}` : 
                 step === 'payment' ? 'Upload payment confirmation screenshots' :
                 'Complete your registration'}
              </p>
            </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3"
              style={{ 
                background: '#FFE6E6', 
                border: '3px solid #FF0000',
                boxShadow: '4px 4px 0px #001A6E'
              }}
            >
              <div className="flex items-start gap-2">
                <IconAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#FF0000' }} />
                <div className="flex-1">
                  <span className="text-sm font-medium block" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                    {error}
                  </span>
                  {error.includes('Storage bucket') && (
                    <span className="text-xs block mt-1" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#64748B' }}>
                      Admin: Check STORAGE_SETUP.md for configuration instructions.
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <motion.form
              onSubmit={handleEmailSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <label className="block text-sm font-bold uppercase mb-2" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 text-sm font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    placeholder="you@example.com"
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '4px 4px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 font-bold uppercase text-sm flex items-center justify-center gap-2"
                style={{
                  fontFamily: 'var(--y2k-font-ui)',
                  background: '#CCFF00',
                  color: '#001A6E',
                  border: '3px solid #001A6E',
                  letterSpacing: '0.08em',
                  boxShadow: '4px 4px 0px #001A6E',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
                whileHover={!loading ? { x: -2, y: -2, boxShadow: '6px 6px 0px #001A6E' } : {}}
                whileTap={!loading ? { x: 2, y: 2, boxShadow: '2px 2px 0px #001A6E' } : {}}
              >
                {loading ? 'Checking...' : 'Continue'}
                <IconArrowRight className="w-5 h-5" strokeWidth={3} />
              </motion.button>
            </motion.form>
          )}

          {/* Login Step */}
          {step === 'login' && (
            <motion.form
              onSubmit={handleLogin}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <label className="block text-sm font-bold uppercase mb-2" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                    <IconMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full pl-11 pr-4 py-2.5 text-sm font-medium cursor-not-allowed"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#F1F5F9',
                      color: '#64748B',
                      border: '3px solid #CBD5E1',
                    }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold uppercase mb-2" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconLock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 text-sm font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    placeholder="Enter password"
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '4px 4px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 font-bold uppercase text-sm flex items-center gap-2"
                  style={{
                    fontFamily: 'var(--y2k-font-ui)',
                    background: '#FFFFFF',
                    color: '#001A6E',
                    border: '3px solid #001A6E',
                    letterSpacing: '0.08em',
                  }}
                  whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px #CBD5E1' }}
                  whileTap={{ x: 1, y: 1, boxShadow: 'none' }}
                >
                  <IconArrowLeft className="w-4 h-4" strokeWidth={3} />
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-2.5 font-bold uppercase text-sm"
                  style={{
                    fontFamily: 'var(--y2k-font-ui)',
                    background: '#CCFF00',
                    color: '#001A6E',
                    border: '3px solid #001A6E',
                    letterSpacing: '0.08em',
                    boxShadow: '4px 4px 0px #001A6E',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                  whileHover={!loading ? { x: -2, y: -2, boxShadow: '6px 6px 0px #001A6E' } : {}}
                  whileTap={!loading ? { x: 2, y: 2, boxShadow: '2px 2px 0px #001A6E' } : {}}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Register Step */}
          {step === 'register' && (
            <motion.form
              onSubmit={handleRegister}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-3">
                <label className="block text-xs font-bold uppercase mb-1.5" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                    <IconMail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium cursor-not-allowed"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#F1F5F9',
                      color: '#64748B',
                      border: '3px solid #CBD5E1',
                    }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold uppercase mb-1.5" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconUser className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    placeholder="John Doe"
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold uppercase mb-1.5" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Team Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconUsers className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    placeholder="Team Phoenix"
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold uppercase mb-1.5" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Team Members
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconHash className="w-4 h-4" />
                  </div>
                  <select
                    value={teamMembers}
                    onChange={(e) => setTeamMembers(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  >
                    <option value="" style={{ background: '#FFFFFF', color: '#001A6E' }}>Select team size...</option>
                    <option value="2" style={{ background: '#FFFFFF', color: '#001A6E' }}>2 Members</option>
                    <option value="3" style={{ background: '#FFFFFF', color: '#001A6E' }}>3 Members</option>
                    <option value="4" style={{ background: '#FFFFFF', color: '#001A6E' }}>4 Members</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold uppercase mb-1.5" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Year of Study
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconSchool className="w-4 h-4" />
                  </div>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  >
                    <option value="" style={{ background: '#FFFFFF', color: '#001A6E' }}>Select year...</option>
                    <option value="1st Year" style={{ background: '#FFFFFF', color: '#001A6E' }}>1st Year</option>
                    <option value="2nd Year" style={{ background: '#FFFFFF', color: '#001A6E' }}>2nd Year</option>
                    <option value="3rd Year" style={{ background: '#FFFFFF', color: '#001A6E' }}>3rd Year</option>
                    <option value="4th Year" style={{ background: '#FFFFFF', color: '#001A6E' }}>4th Year</option>
                    <option value="Graduate" style={{ background: '#FFFFFF', color: '#001A6E' }}>Graduate</option>
                  </select>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold uppercase mb-1.5" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconLock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    placeholder="Min 6 characters"
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 font-bold uppercase text-xs flex items-center gap-1.5"
                  style={{
                    fontFamily: 'var(--y2k-font-ui)',
                    background: '#FFFFFF',
                    color: '#001A6E',
                    border: '3px solid #001A6E',
                    letterSpacing: '0.08em',
                  }}
                  whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px #CBD5E1' }}
                  whileTap={{ x: 1, y: 1, boxShadow: 'none' }}
                >
                  <IconArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 font-bold uppercase text-xs flex items-center justify-center gap-1.5"
                  style={{
                    fontFamily: 'var(--y2k-font-ui)',
                    background: '#CCFF00',
                    color: '#001A6E',
                    border: '3px solid #001A6E',
                    letterSpacing: '0.08em',
                    boxShadow: '4px 4px 0px #001A6E',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                  whileHover={!loading ? { x: -2, y: -2, boxShadow: '6px 6px 0px #001A6E' } : {}}
                  whileTap={!loading ? { x: 2, y: 2, boxShadow: '2px 2px 0px #001A6E' } : {}}
                >
                  {parseInt(teamMembers) > 1 ? 'Next: Team' : 'Next: Payment'}
                  <IconArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Team Members Step */}
          {step === 'team-members' && (
            <motion.form
              onSubmit={handleAddTeamMember}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <div className="p-3 mb-3"
                  style={{ 
                    background: '#F0F9FF', 
                    border: '3px solid #0055FF',
                    boxShadow: '3px 3px 0px #001A6E'
                  }}>
                  <p className="text-xs font-bold uppercase" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                    Team: {teamName}
                  </p>
                  <p className="text-xs mt-1" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#64748B' }}>
                    Member {currentMemberIndex + 2} of {teamMembers}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold uppercase mb-1.5" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Member Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconUser className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={currentMemberData.name}
                    onChange={(e) => setCurrentMemberData({ ...currentMemberData, name: e.target.value })}
                    required
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    placeholder="Jane Doe"
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold uppercase mb-1.5" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Member Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconMail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={currentMemberData.email}
                    onChange={(e) => setCurrentMemberData({ ...currentMemberData, email: e.target.value })}
                    required
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    placeholder="jane@example.com"
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold uppercase mb-1.5" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Year of Study
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconSchool className="w-4 h-4" />
                  </div>
                  <select
                    value={currentMemberData.yearOfStudy}
                    onChange={(e) => setCurrentMemberData({ ...currentMemberData, yearOfStudy: e.target.value })}
                    required
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  >
                    <option value="" style={{ background: '#FFFFFF', color: '#001A6E' }}>Select year...</option>
                    <option value="1st Year" style={{ background: '#FFFFFF', color: '#001A6E' }}>1st Year</option>
                    <option value="2nd Year" style={{ background: '#FFFFFF', color: '#001A6E' }}>2nd Year</option>
                    <option value="3rd Year" style={{ background: '#FFFFFF', color: '#001A6E' }}>3rd Year</option>
                    <option value="4th Year" style={{ background: '#FFFFFF', color: '#001A6E' }}>4th Year</option>
                    <option value="Graduate" style={{ background: '#FFFFFF', color: '#001A6E' }}>Graduate</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 font-bold uppercase text-xs flex items-center gap-1.5"
                  style={{
                    fontFamily: 'var(--y2k-font-ui)',
                    background: '#FFFFFF',
                    color: '#001A6E',
                    border: '3px solid #001A6E',
                    letterSpacing: '0.08em',
                  }}
                  whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px #CBD5E1' }}
                  whileTap={{ x: 1, y: 1, boxShadow: 'none' }}
                >
                  <IconArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 font-bold uppercase text-xs flex items-center justify-center gap-1.5"
                  style={{
                    fontFamily: 'var(--y2k-font-ui)',
                    background: '#CCFF00',
                    color: '#001A6E',
                    border: '3px solid #001A6E',
                    letterSpacing: '0.08em',
                    boxShadow: '4px 4px 0px #001A6E',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                  whileHover={!loading ? { x: -2, y: -2, boxShadow: '6px 6px 0px #001A6E' } : {}}
                  whileTap={!loading ? { x: 2, y: 2, boxShadow: '2px 2px 0px #001A6E' } : {}}
                >
                  {loading ? 'Saving...' : currentMemberIndex + 1 < parseInt(teamMembers) - 1 ? 'Next Member' : 'Next: Payment'}
                  <IconArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <motion.form
              onSubmit={handlePaymentSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase mb-1.5" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Payment Screenshots
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setPaymentScreenshots([...paymentScreenshots, ...files]);
                    }}
                    id="payment-upload"
                    className="hidden"
                    disabled={loading}
                  />
                  <label
                    htmlFor="payment-upload"
                    className="w-full px-3 py-2 text-xs font-medium cursor-pointer flex items-center gap-2"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: paymentScreenshots.length > 0 ? '#CCFF00' : '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                  >
                    <IconUpload className="w-4 h-4" />
                    <span className="flex-1">
                      {paymentScreenshots.length > 0 
                        ? `${paymentScreenshots.length} file(s) selected` 
                        : 'Upload payment screenshots (multiple)'}
                    </span>
                  </label>
                </div>
                {paymentScreenshots.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {paymentScreenshots.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 px-2 py-1 text-xs"
                        style={{
                          background: '#F1F5F9',
                          border: '2px solid #CBD5E1',
                          fontFamily: 'var(--y2k-font-ui)',
                          color: '#001A6E'
                        }}
                      >
                        <span className="flex-1 truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentScreenshots(paymentScreenshots.filter((_, i) => i !== index));
                          }}
                          className="p-1 hover:bg-red-500 hover:text-white rounded"
                          style={{ color: '#EF4444' }}
                        >
                          <IconX className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs mt-1" style={{ color: '#64748B', fontFamily: 'var(--y2k-font-ui)' }}>
                  Upload one or more screenshots of your payment confirmation
                </p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 font-bold uppercase text-xs flex items-center gap-1.5"
                  style={{
                    fontFamily: 'var(--y2k-font-ui)',
                    background: '#FFFFFF',
                    color: '#001A6E',
                    border: '3px solid #001A6E',
                    letterSpacing: '0.08em',
                  }}
                  whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px #CBD5E1' }}
                  whileTap={{ x: 1, y: 1, boxShadow: 'none' }}
                >
                  <IconArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 font-bold uppercase text-xs flex items-center justify-center gap-1.5"
                  style={{
                    fontFamily: 'var(--y2k-font-ui)',
                    background: '#CCFF00',
                    color: '#001A6E',
                    border: '3px solid #001A6E',
                    letterSpacing: '0.08em',
                    boxShadow: '4px 4px 0px #001A6E',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                  whileHover={!loading ? { x: -2, y: -2, boxShadow: '6px 6px 0px #001A6E' } : {}}
                  whileTap={!loading ? { x: 2, y: 2, boxShadow: '2px 2px 0px #001A6E' } : {}}
                >
                  {loading ? 'Completing...' : 'Complete Registration'}
                  <IconArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Progress Indicator */}
          <div className="mt-6 pt-4 flex justify-center gap-2" style={{ borderTop: '3px solid #E2E8F0' }}>
            <motion.div 
              className={`h-2.5 transition-all duration-300`}
              style={{ 
                background: step === 'email' ? '#CCFF00' : '#CBD5E1',
                border: '2px solid #001A6E',
                width: step === 'email' ? '32px' : '12px'
              }}
              animate={{ width: step === 'email' ? 32 : 12 }}
            />
            <motion.div 
              className={`h-2.5 transition-all duration-300`}
              style={{ 
                background: step === 'login' || step === 'register' ? '#CCFF00' : '#CBD5E1',
                border: '2px solid #001A6E',
                width: step === 'login' || step === 'register' ? '32px' : '12px'
              }}
              animate={{ width: step === 'login' || step === 'register' ? 32 : 12 }}
            />
            <motion.div 
              className={`h-2.5 transition-all duration-300`}
              style={{ 
                background: step === 'team-members' ? '#CCFF00' : '#CBD5E1',
                border: '2px solid #001A6E',
                width: step === 'team-members' ? '32px' : '12px'
              }}
              animate={{ width: step === 'team-members' ? 32 : 12 }}
            />
            <motion.div 
              className={`h-2.5 transition-all duration-300`}
              style={{ 
                background: step === 'payment' ? '#CCFF00' : '#CBD5E1',
                border: '2px solid #001A6E',
                width: step === 'payment' ? '32px' : '12px'
              }}
              animate={{ width: step === 'payment' ? 32 : 12 }}
            />
          </div>
          </div>
        </motion.div>

        {/* Back to Home Link */}
        <motion.div
          className="text-center mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-5 py-2 font-bold uppercase text-xs"
            style={{
              fontFamily: 'var(--y2k-font-ui)',
              background: '#FFFFFF',
              color: '#001A6E',
              border: '3px solid #001A6E',
              letterSpacing: '0.08em',
            }}
            whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px #CCFF00' }}
            whileTap={{ x: 1, y: 1, boxShadow: 'none' }}
          >
            <IconArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
            Back to Home
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

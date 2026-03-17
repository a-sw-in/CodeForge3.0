'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { IconMail, IconLock, IconUser, IconArrowRight, IconArrowLeft, IconAlertCircle, IconUsers, IconSchool, IconUpload, IconX, IconPhone } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import data from '@/data/hackathon.json';

export default function LoginPage() {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  
  const [step, setStep] = useState('email'); // 'email', 'login', 'register', 'team-members', 'payment'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [isIEEEMember, setIsIEEEMember] = useState(false);
  const [ieeeId, setIeeeId] = useState('');
  const [additionalMembers, setAdditionalMembers] = useState([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [currentMemberData, setCurrentMemberData] = useState({ name: '', email: '', phone: '', yearOfStudy: '', isIEEEMember: false, ieeeId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentScreenshots, setPaymentScreenshots] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate total fee based on IEEE membership
  const calculateTotalFee = () => {
    let total = 0;
    
    // Leader fee
    let leaderFee = isIEEEMember ? 299 : 399;
    total += leaderFee;
    
    // Additional members fees
    additionalMembers.forEach((member) => {
      let memberFee = member.isIEEEMember ? 299 : 399;
      total += memberFee;
    });
    
    return total;
  };

  // Get fee breakdown
  const getFeeBreakdown = () => {
    const members = [];
    
    // Add leader
    let leaderFee = isIEEEMember ? 299 : 399;
    members.push({
      name: name || 'Team Leader',
      isIEEE: isIEEEMember,
      fee: leaderFee
    });
    
    // Add additional members
    additionalMembers.forEach((member, index) => {
      let memberFee = member.isIEEEMember ? 299 : 399;
      members.push({
        name: member.name || `Member ${index + 2}`,
        isIEEE: member.isIEEEMember,
        fee: memberFee
      });
    });
    
    return members;
  };

  // Generate UPI payment link
  const generateUPILink = () => {
    const totalFee = calculateTotalFee();
    const upiId = process.env.NEXT_PUBLIC_UPI_ID;
    const payeeName = process.env.NEXT_PUBLIC_UPI_NAME || 'CodeForge3.0';
    
    if (!upiId) {
      return null;
    }
    
    // UPI format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&tn=NOTE&tr=REFERENCE
    // Include team name in the note for better tracking
    const note = `CodeForge-${totalFee}-${teamName || 'N/A'}`;
    const transactionRef = `CF3-${Date.now()}-${teamName.substring(0, 5)}`.replace(/\s/g, '');
    
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalFee}&tn=${encodeURIComponent(note)}&tr=${transactionRef}`;
    
    console.log('UPI Link Generated:', upiLink); // Debug log
    return upiLink;
  };

  // Note: Razorpay is optional and not required
  // UPI payment system works standalone without any payment gateway

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
        approved: Boolean(teamData.approved),
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
    // Store leader IEEE info
    localStorage.setItem('leaderIEEE', JSON.stringify({ isIEEEMember, ieeeId }));
  };

  const handleAddTeamMember = (e) => {
    e.preventDefault();
    setError('');
    
    const totalMembers = parseInt(teamMembers);
    const additionalMembersNeeded = totalMembers - 1;
    
    // Update or add current member to list
    const updatedMembers = [...additionalMembers];
    // Only add if this is a new member position, otherwise update existing
    if (currentMemberIndex >= updatedMembers.length) {
      updatedMembers.push(currentMemberData);
    } else {
      updatedMembers[currentMemberIndex] = currentMemberData;
    }
    setAdditionalMembers(updatedMembers);
    
    if (currentMemberIndex + 1 < additionalMembersNeeded) {
      // More members to add
      setCurrentMemberIndex(currentMemberIndex + 1);
      // Preload existing member data if editing, or reset if new
      const nextMemberData = currentMemberIndex + 1 < updatedMembers.length 
        ? updatedMembers[currentMemberIndex + 1]
        : { name: '', email: '', phone: '', yearOfStudy: '', isIEEEMember: false, ieeeId: '' };
      setCurrentMemberData(nextMemberData);
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
        leader_phone: phone,
        leader_year: yearOfStudy,
        leader_ieee_member: isIEEEMember,
        leader_ieee_id: isIEEEMember ? ieeeId : null,
        // Member 2
        member2_name: members[0]?.name || null,
        member2_email: members[0]?.email || null,
        member2_phone: members[0]?.phone || null,
        member2_year: members[0]?.yearOfStudy || null,
        member2_ieee_member: members[0]?.isIEEEMember || false,
        member2_ieee_id: members[0]?.isIEEEMember ? members[0]?.ieeeId : null,
        // Member 3
        member3_name: members[1]?.name || null,
        member3_email: members[1]?.email || null,
        member3_phone: members[1]?.phone || null,
        member3_year: members[1]?.yearOfStudy || null,
        member3_ieee_member: members[1]?.isIEEEMember || false,
        member3_ieee_id: members[1]?.isIEEEMember ? members[1]?.ieeeId : null,
        // Member 4
        member4_name: members[2]?.name || null,
        member4_email: members[2]?.email || null,
        member4_phone: members[2]?.phone || null,
        member4_year: members[2]?.yearOfStudy || null,
        member4_ieee_member: members[2]?.isIEEEMember || false,
        member4_ieee_id: members[2]?.isIEEEMember ? members[2]?.ieeeId : null,
        approved: false,
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
        approved: false,
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
        // Reset to last team member for review/editing
        const lastIndex = additionalMembers.length - 1;
        setCurrentMemberIndex(lastIndex);
        setCurrentMemberData(additionalMembers[lastIndex] || { name: '', email: '', phone: '', yearOfStudy: '', isIEEEMember: false, ieeeId: '' });
      } else {
        setStep('register');
      }
    } else if (step === 'team-members') {
      if (currentMemberIndex > 0) {
        // Go back to previous team member
        setCurrentMemberIndex(currentMemberIndex - 1);
        const prevMemberData = additionalMembers[currentMemberIndex - 1] || { name: '', email: '', phone: '', yearOfStudy: '', isIEEEMember: false, ieeeId: '' };
        setCurrentMemberData(prevMemberData);
      } else {
        // Go back to register step
        setStep('register');
        setCurrentMemberIndex(0);
        setAdditionalMembers([]);
        setCurrentMemberData({ name: '', email: '', phone: '', yearOfStudy: '', isIEEEMember: false, ieeeId: '' });
      }
    } else {
      setStep('email');
      setError('');
      setPassword('');
      setName('');
      setPhone('');
      setTeamName('');
      setTeamMembers('');
      setYearOfStudy('');
      setIsIEEEMember(false);
      setIeeeId('');
      setAdditionalMembers([]);
      setCurrentMemberIndex(0);
      setCurrentMemberData({ name: '', email: '', phone: '', yearOfStudy: '', isIEEEMember: false, ieeeId: '' });
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
    <div className='m-[15vh]'>
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
              {step === 'email' ? ' Welcome' : step === 'login' ? ' Login' : step === 'team-members' ? ' Team Members' : step === 'payment' ? ' Payment' : ' Register'}
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
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconPhone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    pattern="[0-9]{10}"
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    placeholder="9876543210"
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>
                <p className="text-xs mt-1" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#64748B' }}>
                  Enter 10-digit phone number
                </p>
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
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      paddingRight: '24px',
                      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23001A6E%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%3e%3c/polyline%3e%3c/svg%3e")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                      backgroundSize: '16px',
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
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      paddingRight: '24px',
                      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23001A6E%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%3e%3c/polyline%3e%3c/svg%3e")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                      backgroundSize: '16px',
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

              <div className="mb-3">
                <label className="flex items-center text-xs font-bold uppercase mb-2" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  <input
                    type="checkbox"
                    checked={isIEEEMember}
                    onChange={(e) => setIsIEEEMember(e.target.checked)}
                    className="w-4 h-4 mr-2"
                    style={{
                      cursor: 'pointer',
                      accentColor: '#0055FF',
                    }}
                    disabled={loading}
                  />
                  IEEE Member
                </label>
              </div>

              {isIEEEMember && (
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase mb-1.5" 
                    style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                    IEEE Membership ID
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                      <IconHash className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={ieeeId}
                      onChange={(e) => setIeeeId(e.target.value)}
                      required={isIEEEMember}
                      className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                      style={{
                        fontFamily: 'var(--y2k-font-ui)',
                        background: '#FFFFFF',
                        color: '#001A6E',
                        border: '3px solid #0055FF',
                        outline: 'none',
                      }}
                      placeholder="Enter IEEE membership ID"
                      disabled={loading}
                      onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                      onBlur={(e) => e.target.style.boxShadow = 'none'}
                    />
                  </div>
                </div>
              )}

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

              <div className="mb-3">
                <label className="block text-xs font-bold uppercase mb-1.5" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                    <IconPhone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={currentMemberData.phone}
                    onChange={(e) => setCurrentMemberData({ ...currentMemberData, phone: e.target.value })}
                    required
                    pattern="[0-9]{10}"
                    className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                    style={{
                      fontFamily: 'var(--y2k-font-ui)',
                      background: '#FFFFFF',
                      color: '#001A6E',
                      border: '3px solid #001A6E',
                      outline: 'none',
                    }}
                    placeholder="9876543210"
                    disabled={loading}
                    onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>
                <p className="text-xs mt-1" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#64748B' }}>
                  Enter 10-digit phone number
                </p>
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

              <div className="mb-3">
                <label className="flex items-center text-xs font-bold uppercase mb-2" 
                  style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                  <input
                    type="checkbox"
                    checked={currentMemberData.isIEEEMember}
                    onChange={(e) => setCurrentMemberData({ ...currentMemberData, isIEEEMember: e.target.checked })}
                    className="w-4 h-4 mr-2"
                    style={{
                      cursor: 'pointer',
                      accentColor: '#0055FF',
                    }}
                    disabled={loading}
                  />
                  IEEE Member
                </label>
              </div>

              {currentMemberData.isIEEEMember && (
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase mb-1.5" 
                    style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', letterSpacing: '0.05em' }}>
                    IEEE Membership ID
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#001A6E' }}>
                      <IconHash className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={currentMemberData.ieeeId}
                      onChange={(e) => setCurrentMemberData({ ...currentMemberData, ieeeId: e.target.value })}
                      required={currentMemberData.isIEEEMember}
                      className="w-full pl-10 pr-3 py-2 text-xs font-medium"
                      style={{
                        fontFamily: 'var(--y2k-font-ui)',
                        background: '#FFFFFF',
                        color: '#001A6E',
                        border: '3px solid #0055FF',
                        outline: 'none',
                      }}
                      placeholder="Enter IEEE membership ID"
                      disabled={loading}
                      onFocus={(e) => e.target.style.boxShadow = '3px 3px 0px #CCFF00'}
                      onBlur={(e) => e.target.style.boxShadow = 'none'}
                    />
                  </div>
                </div>
              )}

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
      

              {/* Screenshot Upload Section - Make it PROMINENT */}
              <div className="mb-5">
                <div className="p-4 rounded" style={{ 
                  background: '#CCFF00', 
                  border: '4px solid #001A6E',
                  boxShadow: '4px 4px 0px #001A6E'
                }}>
                  <p className="text-sm font-bold uppercase mb-3" style={{ fontFamily: 'var(--y2k-font-display)', color: '#001A6E', fontSize: '16px' }}>
                     Upload Payment Proof
                  </p>
                  
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
                      className="w-full px-4 py-4 text-sm font-bold cursor-pointer flex flex-col items-center gap-2 rounded"
                      style={{
                        fontFamily: 'var(--y2k-font-ui)',
                        background: '#FFFFFF',
                        color: '#001A6E',
                        border: '3px dashed #001A6E',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <IconUpload className="w-8 h-8" style={{ color: '#00AA00' }} />
                      <span className="text-center">
                        {paymentScreenshots.length > 0 
                          ? ` ${paymentScreenshots.length} Screenshot(s) Selected`
                          : 'Click here or drag screenshots\n(Required for payment confirmation)'}
                      </span>
                    </label>
                  </div>

                  {paymentScreenshots.length > 0 && (
                    <div className="mt-3 space-y-2 p-2 bg-white rounded border-2" style={{ borderColor: '#00AA00' }}>
                      <p className="text-xs font-bold" style={{ color: '#00AA00' }}> Attached Screenshots:</p>
                      {paymentScreenshots.map((file, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 text-xs rounded"
                          style={{
                            background: '#E0F7E0',
                            border: '2px solid #00AA00',
                            fontFamily: 'var(--y2k-font-ui)',
                            color: '#001A6E'
                          }}
                        >
                          <span style={{ color: '#00AA00' }}>✓</span>
                          <span className="flex-1 truncate font-bold">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentScreenshots(paymentScreenshots.filter((_, i) => i !== index));
                            }}
                            className="p-1 rounded"
                            style={{ color: '#EF4444', background: '#FEE2E2', border: '1px solid #EF4444' }}
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs mt-3 p-2 rounded" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E', background: '#FEF3C7', border: '1px solid #F59E0B' }}>
                    <strong>⚠️ Important:</strong> Upload screenshot showing payment confirmation (date, amount ₹{calculateTotalFee()}, UPI ID )and Write a note of your team name with the payment 
                  </p>
                </div>
              </div>

  {/* Fee Summary */}
              <div className="mb-5 p-3"
                style={{
                  background: '#F0F9FF',
                  border: '3px solid #0055FF',
                  boxShadow: '3px 3px 0px #001A6E'
                }}>
                <p className="text-xs font-bold uppercase mb-3" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                   Payment Summary
                </p>
                <div className="space-y-1 mb-3">
                  {getFeeBreakdown().map((member, index) => (
                    <div key={index} className="flex justify-between text-xs px-2 py-1 rounded"
                      style={{
                        background: member.isIEEE ? '#E0F2FE' : '#FEF3C7',
                        fontFamily: 'var(--y2k-font-ui)',
                        color: '#001A6E'
                      }}>
                      <span>{member.name} {member.isIEEE ? '(IEEE)' : ''}</span>
                      <span className="font-bold">₹{member.fee}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2" style={{ borderTop: '2px solid #0055FF' }}>
                  <div className="flex justify-between text-sm font-bold"
                    style={{
                      fontFamily: 'var(--y2k-font-display)',
                      color: '#0055FF'
                    }}>
                    <span>Total Amount</span>
                    <span>₹{calculateTotalFee()}</span>
                  </div>
                </div>
              </div>


              {/* UPI Payment Information - Always Show */}
              <div className="mb-5 p-3"
                  style={{
                    background: '#F0F9FF',
                    border: '3px solid #0055FF',
                    boxShadow: '3px 3px 0px #001A6E'
                  }}>
                  <p className="text-xs font-bold uppercase mb-3" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                     Payment Details
                  </p>
                  
                  {/* Total Amount - Prominent Display */}
                  <div className="mb-3 p-2 rounded"
                    style={{
                      background: '#CCFF00',
                      border: '2px solid #001A6E',
                      fontFamily: 'var(--y2k-font-display)',
                      textAlign: 'center'
                    }}>
                    <p className="text-xs font-bold" style={{ color: '#001A6E', marginBottom: '4px' }}>
                      TOTAL AMOUNT TO PAY
                    </p>
                    <p className="text-2xl font-bold" style={{ color: '#001A6E' }}>
                      ₹{calculateTotalFee()}
                    </p>
                  </div>

                  {/* Contact Number */}
                  <div className="mb-3">
                    <p className="text-xs font-bold mb-1" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                       Contact Number
                    </p>
                    <div className="p-2 rounded"
                      style={{
                        background: '#E0F2FE',
                        border: '2px solid #0055FF',
                        fontFamily: 'var(--y2k-font-ui)',
                        color: '#001A6E'
                      }}>
                      <p className="text-xs font-bold">{data.event.phone || 'Contact support'}</p>
                    </div>
                  </div>

                  {/* UPI ID */}
                  <div className="mb-3">
                    <p className="text-xs font-bold mb-1" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                       UPI ID to Pay
                    </p>
                    <div className="flex items-center gap-2 p-2 rounded"
                      style={{
                        background: '#FFFFFF',
                        border: '2px solid #0055FF',
                        fontFamily: 'var(--y2k-font-ui)',
                        color: process.env.NEXT_PUBLIC_UPI_ID ? '#000000' : '#FF6B6B'
                      }}>
                      <code className="flex-1 text-xs font-mono font-bold">
                        {process.env.NEXT_PUBLIC_UPI_ID || '⚠️ Configure .env.local'}
                      </code>
                      {process.env.NEXT_PUBLIC_UPI_ID && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(process.env.NEXT_PUBLIC_UPI_ID);
                            setCopiedUPI(true);
                            setTimeout(() => setCopiedUPI(false), 5000);
                          }}
                          className="px-2 py-1 text-xs font-bold rounded"
                          style={{
                            background: '#24ac15',
                            color: '#FFFFFF',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {copiedUPI ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* UPI Payment Link - Mobile Only */}
                  <div className="mb-3">
                    <p className="text-xs font-bold mb-1" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#001A6E' }}>
                      {isMobile ? ' Open UPI App' : ' Scan QR Code from Phone'}
                    </p>
                    
                    {isMobile ? (
                      // Mobile: Show TAP TO PAY button
                      <>
                        {generateUPILink() ? (
                          <a
                            href={generateUPILink()}
                            className="block w-full px-3 py-3 text-xs font-bold uppercase text-center rounded"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: '#00AA00',
                              color: '#FFFFFF',
                              border: '3px solid #001A6E',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              boxShadow: '3px 3px 0px #001A6E'
                            }}
                          >
                             ₹{calculateTotalFee()} - TAP TO PAY
                          </a>
                        ) : (
                          <div className="block w-full px-3 py-3 text-xs font-bold uppercase text-center rounded"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: '#CCCCCC',
                              color: '#666666',
                              border: '3px solid #001A6E',
                              boxShadow: '3px 3px 0px #001A6E'
                            }}
                          >
                            Configure .env.local
                          </div>
                        )}
                      </>
                    ) : (
                      // Desktop: Show QR Code
                      <>
                        {generateUPILink() ? (
                          <div className="flex justify-center p-3 bg-white rounded border-2" style={{ borderColor: '#0055FF' }}>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generateUPILink())}`}
                              alt="UPI Payment QR Code"
                              style={{ width: '150px', height: '150px' }}
                            />
                          </div>
                        ) : (
                          <div className="block w-full px-3 py-3 text-xs font-bold text-center rounded"
                            style={{
                              fontFamily: 'var(--y2k-font-ui)',
                              background: '#CCCCCC',
                              color: '#666666',
                              border: '3px solid #001A6E',
                              boxShadow: '3px 3px 0px #001A6E'
                            }}
                          >
                           Configure .env.local
                          </div>
                        )}
                        <p className="text-xs text-center mt-2" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#64748B' }}>
                          Scan this QR with your phone's camera to pay
                        </p>
                      </>
                    )}
                  </div>

                  <p className="text-xs" style={{ fontFamily: 'var(--y2k-font-ui)', color: '#64748B', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #0055FF' }}>
                    After payment, upload the confirmation screenshot below
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
                  {loading ? 'Uploading...' : 'Completed..'}
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
    </div>
  );
}

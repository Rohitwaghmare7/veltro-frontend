"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useDataChannel,
} from "@livekit/components-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useOnboarding } from "@/app/onboarding/OnboardingContext";
import api from "@/lib/api";
import { integrationService } from "@/lib/services/integration.service";

interface LiveKitVoiceFlowProps {
  onComplete: (data: any) => void;
}

interface Message {
  type: 'ai' | 'user';
  text: string;
}

function VoiceConversation({ onComplete }: LiveKitVoiceFlowProps) {
  const { setActiveStep } = useOnboarding();
  const [messages, setMessages] = useState<Message[]>([]);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showGmailConnect, setShowGmailConnect] = useState(false);
  const [showCalendarConnect, setShowCalendarConnect] = useState(false);
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [connectingCalendar, setConnectingCalendar] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch existing onboarding progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/onboarding/progress');
        const { currentStep, business } = res.data.data;
        
        // If already complete, redirect to dashboard
        if (res.data.data.isSetupComplete) {
          window.location.href = '/dashboard';
          return;
        }
        
        // Update sidebar to current step
        setActiveStep(Math.max(0, currentStep - 1));
        
        // Mark completed steps
        const completed = [];
        for (let i = 1; i < currentStep; i++) {
          completed.push(i);
        }
        setCompletedSteps(completed);
        
        // Pre-fill collected data
        if (business) {
          setCollectedData({
            name: business.name,
            customCategory: business.customCategory,
            description: business.description,
            phone: business.phone,
            email: business.email,
            website: business.website,
            services: business.services,
            workingHours: business.workingHours,
          });
        }
        
        // Add initial message based on current step
        const stepMessages: Record<number, string> = {
          1: "Hi!",
          2: "Hi! Welcome back. Say 'services' when you're ready to add your services.",
          3: "Hi!",
          4: "Hi! Welcome back. Say 'services' to add your services.",
          5: "Hi! Welcome back. Say 'hours' to set your business hours.",
          6: "You're all set!",
        };
        
        const initialMessage = stepMessages[currentStep] || "Hi!";
        setMessages([{ type: 'ai', text: initialMessage }]);
        
        setInitialDataLoaded(true);
      } catch (error) {
        console.error('Failed to fetch progress:', error);
        // Start from beginning if fetch fails
        setMessages([{ 
          type: 'ai', 
          text: "Hi! Welcome to Veltro." 
        }]);
        setInitialDataLoaded(true);
      }
    };
    
    fetchProgress();
  }, [setActiveStep]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for data messages from the Python agent
  const handleDataReceived = useCallback((msg: any) => {
    try {
      const decoder = new TextDecoder();
      const payload = msg.payload instanceof Uint8Array ? msg.payload : new Uint8Array(msg.payload);
      const message = JSON.parse(decoder.decode(payload));
      
      console.log('Received from agent:', message);
      
      switch (message.action) {
        case 'ai_message':
          setMessages(prev => {
            // Avoid duplicate messages
            if (prev.length > 0 && prev[prev.length - 1].type === 'ai' && prev[prev.length - 1].text === message.text) {
              return prev;
            }
            return [...prev, { type: 'ai', text: message.text }];
          });
          break;
          
        case 'user_message':
          setMessages(prev => {
            // Avoid duplicate messages
            if (prev.length > 0 && prev[prev.length - 1].type === 'user' && prev[prev.length - 1].text === message.text) {
              return prev;
            }
            return [...prev, { type: 'user', text: message.text }];
          });
          break;
          
        case 'fill_field':
          if (message.value) {
            console.log(`[FILL_FIELD] ${message.field} = ${JSON.stringify(message.value)}`);
            
            // Validate the value before storing
            const value = message.value;
            let isValid = true;
            
            // Skip if value contains question marks or looks like a question
            if (typeof value === 'string') {
              if (value.includes('?') || value.length > 300) {
                console.log(`[FILL_FIELD] Skipping invalid value for ${message.field}`);
                isValid = false;
              }
            }
            
            if (isValid) {
              setCollectedData(prev => ({
                ...prev,
                [message.field]: message.value
              }));
            }
          }
          break;
          
        case 'step_complete':
          // Mark step as complete in sidebar
          if (message.step && !completedSteps.includes(message.step)) {
            setCompletedSteps(prev => [...prev, message.step]);
            
            // Wait a bit for all fill_field messages to be processed
            setTimeout(async () => {
              try {
                let payload = {};
                
                // Get the latest collectedData from state
                setCollectedData(currentData => {
                  console.log(`[STEP ${message.step}] Saving data:`, currentData);
                  
                  switch (message.step) {
                    case 1: // Business Profile
                      payload = {
                        name: currentData.name || '',
                        category: 'other',
                        customCategory: currentData.customCategory || '',
                        description: currentData.description || '',
                        phone: currentData.phone || '',
                        email: currentData.email || '',
                        website: currentData.website || '',
                        address: { street: '', city: '', state: '', zipCode: '', country: '' },
                      };
                      
                      // Save step 1, 2, 3 in sequence
                      (async () => {
                        try {
                          await api.put('/onboarding/step/1', payload);
                          console.log('[STEP 1] Business profile saved');
                          
                          // Skip step 2 (channels) and step 3 (contact form) - use defaults
                          await api.put('/onboarding/step/2', { emailConnected: false });
                          console.log('[STEP 2] Channels saved (defaults)');
                          
                          await api.put('/onboarding/step/3', { contactFormFields: ['name', 'email'] });
                          console.log('[STEP 3] Contact form saved (defaults)');
                        } catch (error) {
                          console.error('[STEP 1] Failed to save:', error);
                        }
                      })();
                      break;
                      
                    case 2: // Services
                      payload = { services: currentData.services || [] };
                      api.put('/onboarding/step/4', payload)
                        .then(() => console.log('[STEP 2] Services saved'))
                        .catch(error => console.error('[STEP 2] Failed to save:', error));
                      break;
                      
                    case 3: // Operating Hours
                      payload = { workingHours: currentData.workingHours || [] };
                      api.put('/onboarding/step/5', payload)
                        .then(() => console.log('[STEP 3] Working hours saved'))
                        .catch(error => console.error('[STEP 3] Failed to save:', error));
                      break;
                  }
                  
                  return currentData; // Return unchanged
                });
              } catch (error) {
                console.error(`Failed to save step ${message.step}:`, error);
              }
            }, 500); // Wait 500ms for all fill_field messages to arrive
            
            // Update sidebar to show correct progress
            // Voice has 3 steps, but sidebar has 6 steps
            // Voice Step 1 (Profile) → Complete sidebar steps 0,1,2 → Show step 3 (Services)
            // Voice Step 2 (Services) → Complete sidebar step 3 → Show step 4 (Hours)
            // Voice Step 3 (Hours) → Complete sidebar step 4 → Show step 5 (Launch)
            const sidebarStepMap: Record<number, number> = {
              1: 3, // After profile, show services step
              2: 4, // After services, show hours step
              3: 5, // After hours, show launch step
            };
            const nextSidebarStep = sidebarStepMap[message.step];
            if (nextSidebarStep !== undefined) {
              setActiveStep(nextSidebarStep);
            }
          }
          break;
          
        case 'show_gmail_connect':
          setShowGmailConnect(true);
          break;
          
        case 'show_calendar_connect':
          setShowCalendarConnect(true);
          break;
          
        case 'voice_complete':
          // Voice onboarding complete - show launch screen
          // Save all collected data first
          onComplete(collectedData);
          break;
          
        case 'complete':
          onComplete(message.data);
          break;
      }
    } catch (error) {
      console.error('Error processing data message:', error);
    }
  }, [onComplete]);

  useDataChannel(handleDataReceived);
  
  const handleConnectGmail = async () => {
    try {
      setConnectingGmail(true);
      
      // Save mode and conversation state to localStorage before redirecting
      localStorage.setItem('onboardingMode', 'voice');
      localStorage.setItem('voiceOnboardingState', JSON.stringify({
        messages,
        collectedData,
        completedSteps,
        timestamp: Date.now(),
      }));
      
      const response = await api.get('/integrations/gmail/connect?return=onboarding', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
      setConnectingGmail(false);
    }
  };
  
  const handleConnectCalendar = async () => {
    try {
      setConnectingCalendar(true);
      
      // Save mode and conversation state to localStorage before redirecting
      localStorage.setItem('onboardingMode', 'voice');
      localStorage.setItem('voiceOnboardingState', JSON.stringify({
        messages,
        collectedData,
        completedSteps,
        timestamp: Date.now(),
      }));
      
      const url = await integrationService.getGoogleUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to connect Calendar:', error);
      setConnectingCalendar(false);
    }
  };
  
  // Restore conversation state on mount (only if returning from OAuth)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isReturningFromOAuth = urlParams.get('gmail') === 'connected' || urlParams.get('calendar') === 'connected';
    
    // Only restore if returning from OAuth
    if (isReturningFromOAuth) {
      const savedState = localStorage.getItem('voiceOnboardingState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          // Only restore if less than 10 minutes old
          if (Date.now() - state.timestamp < 10 * 60 * 1000) {
            setMessages(state.messages || []);
            setCollectedData(state.collectedData || {});
            setCompletedSteps(state.completedSteps || []);
            
            // Update sidebar to last completed step
            if (state.completedSteps && state.completedSteps.length > 0) {
              const lastStep = Math.max(...state.completedSteps);
              const sidebarStepMap: Record<number, number> = {
                1: 0, 2: 1, 3: 2, 4: 3, 5: 4,
              };
              const sidebarStep = sidebarStepMap[lastStep];
              if (sidebarStep !== undefined) {
                setActiveStep(sidebarStep);
              }
            }
            
            // Add a message that we're back
            setTimeout(() => {
              setMessages(prev => [...prev, {
                type: 'ai',
                text: "Great! I see you've successfully connected. Say 'continue' or 'next' and I'll move on to the next step."
              }]);
              
              // Hide the connect buttons
              setShowGmailConnect(false);
              setShowCalendarConnect(false);
            }, 1000);
            
            setInitialDataLoaded(true);
          }
          // Clear the saved state
          localStorage.removeItem('voiceOnboardingState');
        } catch (error) {
          console.error('Failed to restore state:', error);
        }
      }
    }
  }, [setActiveStep]);

  const fieldLabels: Record<string, string> = {
    name: 'Business Name',
    customCategory: 'Industry',
    description: 'Description',
    phone: 'Phone Number',
    email: 'Email Address',
    website: 'Website',
    services: 'Services',
    workingHours: 'Business Hours'
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Spline Background - Full coverage */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        <Box
          component="iframe"
          src="https://my.spline.design/particles-BzEh87Im38XoBcS1ACxeJqlV/"
          title="Voice Onboarding Spline Background"
          sx={{
            border: 'none',
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'none',
          }}
        />
      </Box>

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          p: 2.5,
        }}
      >
        {/* Chat Container */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            gap: 2.5,
            minHeight: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Messages Column */}
          <Box
            sx={{
              width: '100%',
              maxWidth: '900px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Messages Area */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 4,
                py: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                justifyContent: messages.length === 0 ? 'center' : 'flex-start',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                  },
                },
              }}
            >
              {messages.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '1rem',
                      textAlign: 'center',
                    }}
                  >
                    Starting conversation...
                  </Typography>
                </Box>
              )}
              
              {messages.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    width: '100%',
                    mb: 2,
                    animation: 'slideIn 0.3s ease-out',
                    '@keyframes slideIn': {
                      from: { opacity: 0, transform: 'translateY(15px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '65%',
                      px: 2.5,
                      py: 1.75,
                      borderRadius: msg.type === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      bgcolor: msg.type === 'user' 
                        ? 'rgba(255, 107, 74, 0.95)' 
                        : 'rgba(40, 40, 40, 0.9)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: msg.type === 'user' 
                        ? '0 4px 16px rgba(255, 107, 74, 0.35)' 
                        : '0 4px 16px rgba(0,0,0,0.5)',
                      border: msg.type === 'ai' ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                    }}
                  >
                    {msg.type === 'ai' && (
                      <Typography 
                        sx={{ 
                          fontSize: '0.7rem', 
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontWeight: '600',
                          mb: 0.5,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        AI Assistant
                      </Typography>
                    )}
                    {msg.type === 'user' && (
                      <Typography 
                        sx={{ 
                          fontSize: '0.7rem', 
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: '600',
                          mb: 0.5,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        You
                      </Typography>
                    )}
                    <Typography 
                      sx={{ 
                        fontSize: '0.95rem', 
                        lineHeight: 1.6, 
                        color: 'white',
                        fontWeight: '400',
                      }}
                    >
                      {msg.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              {/* Gmail Connect Button */}
              {showGmailConnect && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<EmailIcon />}
                    onClick={handleConnectGmail}
                    disabled={connectingGmail}
                    sx={{
                      background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: '600',
                      boxShadow: '0 4px 16px rgba(255, 107, 74, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FF8A4D 0%, #FF6B4A 100%)',
                        boxShadow: '0 6px 20px rgba(255, 107, 74, 0.5)',
                      },
                    }}
                  >
                    {connectingGmail ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Connect Gmail'}
                  </Button>
                </Box>
              )}
              
              {/* Calendar Connect Button */}
              {showCalendarConnect && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<CalendarTodayIcon />}
                    onClick={handleConnectCalendar}
                    disabled={connectingCalendar}
                    sx={{
                      background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: '600',
                      boxShadow: '0 4px 16px rgba(255, 107, 74, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FF8A4D 0%, #FF6B4A 100%)',
                        boxShadow: '0 6px 20px rgba(255, 107, 74, 0.5)',
                      },
                    }}
                  >
                    {connectingCalendar ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Connect Google Calendar'}
                  </Button>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>
          </Box>

          {/* Collected Data Column - Hidden for now, can be shown later */}
          <Box
            sx={{
              display: 'none', // Hidden to center the chat
              width: 340,
              flexDirection: 'column',
              gap: 2,
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                },
              },
            }}
          >
            {Object.keys(collectedData).length > 0 && (
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <Typography sx={{ color: 'white', fontWeight: '700', mb: 2.5, fontSize: '0.95rem', textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
                  📝 Information Collected
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(collectedData).map(([key, value]) => {
                    if (!value) return null;
                    
                    if (key === 'services' && Array.isArray(value)) {
                      return (
                        <Box key={key}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            {fieldLabels[key] || key}:
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {value.map((service: any, idx: number) => (
                              <Box key={idx} sx={{ p: 1.5, bgcolor: 'rgba(255, 107, 74, 0.2)', borderRadius: 1, border: '1px solid rgba(255, 107, 74, 0.3)' }}>
                                <Typography sx={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>
                                  {service.name}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                                  {service.duration} min • ${service.price}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      );
                    }
                    
                    if (key === 'workingHours' && Array.isArray(value)) {
                      const openDays = value.filter((h: any) => h.isOpen);
                      if (openDays.length === 0) return null;
                      
                      return (
                        <Box key={key}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            {fieldLabels[key] || key}:
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {openDays.map((hour: any, idx: number) => (
                              <Typography key={idx} sx={{ color: 'white', fontSize: '0.85rem', fontWeight: '500' }}>
                                {hour.day.charAt(0).toUpperCase() + hour.day.slice(1)}: {hour.start} - {hour.end}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      );
                    }
                    
                    return (
                      <Box key={key}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                          {fieldLabels[key] || key}:
                        </Typography>
                        <Typography sx={{ color: 'white', fontWeight: '500', fontSize: '0.9rem', mt: 0.5 }}>
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Exit Button - Bottom Left */}
      <IconButton
        onClick={() => window.location.reload()}
        sx={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          width: 56,
          height: 56,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          '&:hover': {
            bgcolor: 'rgba(239, 68, 68, 0.9)',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
          },
          transition: 'all 0.2s ease',
          zIndex: 10,
        }}
      >
        <CloseIcon sx={{ fontSize: 28 }} />
      </IconButton>

      <RoomAudioRenderer />
    </Box>
  );
}

export default function LiveKitVoiceFlow({ onComplete }: LiveKitVoiceFlowProps) {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

  useEffect(() => {
    const roomName = `onboarding-${Date.now()}`;
    const participantName = `user-${Math.random().toString(36).substring(7)}`;

    fetch(`/api/livekit-token?room=${roomName}&participant=${participantName}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setToken(data.token);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to get token:', err);
        setError('Failed to connect to voice service');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="50vh" gap={2}>
        <CircularProgress sx={{ color: '#FF6B4A' }} size={48} />
        <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>
          Connecting to voice assistant...
        </Typography>
      </Box>
    );
  }

  if (error || !token) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="50vh" gap={2}>
        <Typography sx={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: '600' }}>
          ⚠️ Connection Error
        </Typography>
        <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
          {error || 'Unable to connect to voice service'}
        </Typography>
      </Box>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={false}
    >
      <VoiceConversation onComplete={onComplete} />
    </LiveKitRoom>
  );
}

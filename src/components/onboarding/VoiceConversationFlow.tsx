"use client";

import { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";

interface VoiceConversationFlowProps {
  onComplete: (data: any) => void;
}

// Conversation steps
const CONVERSATION_STEPS = [
  {
    id: 'business_name',
    question: "What's your business name?",
    field: 'name',
  },
  {
    id: 'business_category',
    question: "What category or industry is your business in?",
    field: 'customCategory',
  },
  {
    id: 'business_description',
    question: "Can you briefly describe what your business does?",
    field: 'description',
  },
  {
    id: 'business_phone',
    question: "What's your business phone number? Say skip if you don't want to provide it.",
    field: 'phone',
    optional: true
  },
  {
    id: 'business_email',
    question: "What's your business email? Say skip if you don't want to provide it.",
    field: 'email',
    optional: true
  },
  {
    id: 'business_website',
    question: "Do you have a website? Say skip if you don't.",
    field: 'website',
    optional: true
  },
];

interface Message {
  type: 'ai' | 'user';
  text: string;
}

export default function VoiceConversationFlow({ onComplete }: VoiceConversationFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [conversationState, setConversationState] = useState<'ready' | 'speaking' | 'listening' | 'processing'>('ready');
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Hook from react-speech-recognition
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasSpokenRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentQuestion = CONVERSATION_STEPS[currentStepIndex];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle listening state changes and transcript processing
  useEffect(() => {
    // Update local state to match hook state
    if (listening && conversationState !== 'listening') {
      setConversationState('listening');
    } else if (!listening && conversationState === 'listening') {
      // Listening stopped - check if we have a transcript
      if (transcript) {
        handleAnswerReceived(transcript);
      } else {
        // No transcript - maybe silence timeout?
        // Restart listening if needed or prompt user?
        // For now, let's try to restart once if it was likely an error
        // OR wait for user to manually tap mic (if we add one).
        // But to keep flow fluid, we might want to prompt or restart.
        console.log("Listening stopped with no transcript.");
        // If no transcript and it was listening, it means silence or error.
        // We should probably re-prompt or restart listening.
        // For now, let's restart listening to keep the flow going.
        // This might lead to infinite loops if the mic is truly broken.
        // A better solution would be to have a retry count or a "Say something" prompt.
        if (conversationState === 'listening') { // Ensure we are still expecting input
          console.log('No speech captured, restarting listening...');
          setTimeout(() => {
            startListening();
          }, 500);
        }
      }
    }
  }, [listening, conversationState, transcript]);


  // Initialize speech synthesis and wait for voices to load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      // Wait for voices to load
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        console.log('🔊 Voices loaded:', voices.length);
        if (voices.length > 0) {
          console.log('🔊 First 5 voices:', voices.slice(0, 5).map(v => `${v.name} (${v.lang})`));
        }
      };

      // Load voices immediately
      loadVoices();
      
      // Also listen for voices changed event
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices;
      }

      // Force load voices on macOS/Safari
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance('');
        synthRef.current.speak(utterance);
        synthRef.current.cancel();
      }
    }
  }, []);

  // Ask the current question when step changes (only after user starts)
  useEffect(() => {
    // Skip the first step in useEffect because we handle it directly in startConversation
    // to ensure user gesture protects the audio playback.
    if (hasStarted && currentQuestion && !hasSpokenRef.current && currentStepIndex > 0) {
      console.log('🔄 useEffect triggered - will speak question', { step: currentStepIndex });
      hasSpokenRef.current = true;
      // Small delay to ensure state is ready
      setTimeout(() => {
        speakAndListen(currentQuestion.question);
      }, 300);
    }
  }, [currentStepIndex, hasStarted, currentQuestion]);

  // Start the conversation
  const startConversation = () => {
    console.log('🚀 Starting conversation...');
    setHasStarted(true);

    // Speak immediately on user click to satisfy browser autoplay policies
    if (CONVERSATION_STEPS[0]) {
      console.log('🗣️ Manually triggering first question');
      hasSpokenRef.current = true;
      // Immediate call without timeout to ensure user gesture validity
      speakAndListen(CONVERSATION_STEPS[0].question);
    }
  };

  // Speak and then auto-start listening
  const speakAndListen = (text: string) => {
    console.log('🎤 speakAndListen called with:', text);
    
    // Add AI message to conversation
    setMessages(prev => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg && lastMsg.text === text && lastMsg.type === 'ai') return prev;
      return [...prev, { type: 'ai', text }];
    });

    if (!synthRef.current) {
      console.error('❌ Speech synthesis not available');
      setTimeout(() => {
        startListening();
      }, 500);
      return;
    }

    // Check if speech synthesis is speaking
    if (synthRef.current.speaking) {
      console.log('⚠️ Already speaking, canceling...');
      synthRef.current.cancel();
    }

    // Wait a moment after cancel
    setTimeout(() => {
      if (!synthRef.current) return;

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Get and log available voices
      const voices = synthRef.current.getVoices();
      console.log('📢 Available voices:', voices.length);
      
      if (voices.length > 0) {
        // Prefer English voices
        const englishVoice = voices.find(v => v.lang.startsWith('en-'));
        if (englishVoice) {
          utterance.voice = englishVoice;
          console.log('✅ Using voice:', englishVoice.name, englishVoice.lang);
        } else {
          console.log('⚠️ No English voice found, using default');
        }
      } else {
        console.warn('⚠️ No voices available yet');
      }

      let speechStarted = false;

      utterance.onstart = () => {
        console.log('✅ Speech STARTED successfully');
        speechStarted = true;
        setConversationState('speaking');
      };

      utterance.onend = () => {
        console.log('✅ Speech ENDED, starting listening in 500ms');
        utteranceRef.current = null;
        setTimeout(() => {
          startListening();
        }, 500);
      };

      utterance.onerror = (event) => {
        console.error('❌ Speech synthesis ERROR:', event.error, event);
        if (event.error === 'canceled' || event.error === 'interrupted') {
          return;
        }
        setTimeout(() => {
          startListening();
        }, 500);
      };

      console.log('📢 About to call speak()...');
      console.log('📢 SpeechSynthesis state:', {
        speaking: synthRef.current.speaking,
        pending: synthRef.current.pending,
        paused: synthRef.current.paused
      });

      try {
        synthRef.current.speak(utterance);
        console.log('📢 speak() called successfully');
        console.log('📢 SpeechSynthesis state after speak:', {
          speaking: synthRef.current.speaking,
          pending: synthRef.current.pending,
          paused: synthRef.current.paused
        });

        // Fallback: if speech doesn't start in 3 seconds, skip to listening
        setTimeout(() => {
          if (!speechStarted && utteranceRef.current === utterance) {
            console.warn('⚠️ Speech did not start after 3s, skipping to listening');
            console.warn('⚠️ Final state:', {
              speaking: synthRef.current?.speaking,
              pending: synthRef.current?.pending,
              paused: synthRef.current?.paused
            });
            synthRef.current?.cancel();
            startListening();
          }
        }, 3000);
      } catch (error) {
        console.error('❌ Failed to call speak():', error);
        setTimeout(() => {
          startListening();
        }, 500);
      }
    }, 100);
  };

  // Start listening
  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    resetTranscript();
    setConversationState('listening');
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };

  // Stop listening
  const stopListening = () => {
    SpeechRecognition.stopListening();
    // Logic handled in useEffect
  };

  // Handle answer received
  const handleAnswerReceived = (answer: string) => {
    stopListening(); // Ensure listening is stopped
    setConversationState('processing');

    // Add user message to conversation
    setMessages(prev => [...prev, { type: 'user', text: answer }]);

    // Check if user said "skip"
    if (currentQuestion.optional && (answer.toLowerCase().includes('skip') || answer.toLowerCase().includes('no'))) {
      setTimeout(() => {
        moveToNextStep(null);
      }, 500);
    } else {
      setTimeout(() => {
        moveToNextStep(answer);
      }, 500);
    }
  };

  // Move to next step
  const moveToNextStep = (answer: string | null) => {
    const newData = { ...collectedData };
    if (answer) {
      newData[currentQuestion.field] = answer;
    } else if (currentQuestion.optional) {
      newData[currentQuestion.field] = null;
    }
    setCollectedData(newData);

    // Check if done
    if (currentStepIndex >= CONVERSATION_STEPS.length - 1) {
      setConversationState('processing');
      const finalMessage = "Perfect! We've collected all your information. Saving now.";
      setMessages(prev => [...prev, { type: 'ai', text: finalMessage }]);

      if (synthRef.current) {
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(finalMessage);
        synthRef.current.speak(utterance);
      }

      setTimeout(() => {
        onComplete({
          name: newData.name || '',
          category: 'other',
          customCategory: newData.customCategory || '',
          description: newData.description || '',
          phone: newData.phone || '',
          email: newData.email || '',
          website: newData.website || '',
        });
      }, 2000);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
      resetTranscript();
      hasSpokenRef.current = false;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      SpeechRecognition.stopListening();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        p: 4,
      }}
    >
      {/* Spline Background - Only in content area */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          opacity: 0.3,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Box
          component="iframe"
          src="https://my.spline.design/particles-BzEh87Im38XoBcS1ACxeJqlV/"
          title="Voice Onboarding Spline Background"
          sx={{
            border: 'none',
            width: '150%',
            height: '150%',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            msUserSelect: 'none',
          }}
        />
      </Box>

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 800,
          width: '100%',
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {!hasStarted ? (
          // Start Screen
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 107, 74, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: '#FF6B4A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: '2rem' }}>🎙️</Typography>
              </Box>
            </Box>
            <Typography sx={{ color: '#1A1A1A', fontSize: '1.8rem', fontWeight: '700', mb: 2 }}>
              Voice Conversation
            </Typography>
            <Typography sx={{ color: '#666', fontSize: '1rem', maxWidth: 500, textAlign: 'center', mb: 4 }}>
              I'll ask you questions about your business. Just speak naturally and I'll understand!
            </Typography>
            
            {/* Test Audio Button with detailed diagnostics */}
            <Box
              onClick={() => {
                console.log('🧪 === AUDIO TEST STARTED ===');
                
                // Check if speech synthesis is available
                if (!window.speechSynthesis) {
                  console.error('❌ speechSynthesis not available');
                  alert('Speech synthesis is not available in your browser');
                  return;
                }
                
                console.log('✅ speechSynthesis available');
                
                // Get voices
                const voices = window.speechSynthesis.getVoices();
                console.log('🔊 Available voices:', voices.length);
                console.log('🔊 Voices:', voices.map(v => `${v.name} (${v.lang}, ${v.default ? 'default' : 'not default'})`));
                
                // Cancel any ongoing speech
                window.speechSynthesis.cancel();
                console.log('🔄 Canceled any ongoing speech');
                
                // Create test utterance
                const testUtterance = new SpeechSynthesisUtterance("Hello! This is a test. Can you hear me?");
                testUtterance.rate = 1.0;
                testUtterance.pitch = 1.0;
                testUtterance.volume = 1.0;
                
                // Try to use an English voice
                if (voices.length > 0) {
                  const englishVoice = voices.find(v => v.lang.startsWith('en-')) || voices[0];
                  testUtterance.voice = englishVoice;
                  console.log('🎤 Using voice:', englishVoice.name, englishVoice.lang);
                }
                
                testUtterance.onstart = () => {
                  console.log('✅ Test speech STARTED');
                };
                
                testUtterance.onend = () => {
                  console.log('✅ Test speech ENDED');
                };
                
                testUtterance.onerror = (event) => {
                  console.error('❌ Test speech ERROR:', event.error, event);
                };
                
                console.log('📢 Calling speak()...');
                window.speechSynthesis.speak(testUtterance);
                
                console.log('📢 speak() called. State:', {
                  speaking: window.speechSynthesis.speaking,
                  pending: window.speechSynthesis.pending,
                  paused: window.speechSynthesis.paused
                });
                
                // Check state after a moment
                setTimeout(() => {
                  console.log('📢 State after 100ms:', {
                    speaking: window.speechSynthesis.speaking,
                    pending: window.speechSynthesis.pending,
                    paused: window.speechSynthesis.paused
                  });
                }, 100);
                
                setTimeout(() => {
                  console.log('📢 State after 1s:', {
                    speaking: window.speechSynthesis.speaking,
                    pending: window.speechSynthesis.pending,
                    paused: window.speechSynthesis.paused
                  });
                }, 1000);
              }}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                border: '2px solid #FF6B4A',
                color: '#FF6B4A',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                mb: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 107, 74, 0.1)',
                },
              }}
            >
              🔊 Test Audio First (Check Console)
            </Box>
            
            <Box
              onClick={startConversation}
              sx={{
                px: 6,
                py: 2.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(255, 107, 74, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(255, 107, 74, 0.4)',
                },
              }}
            >
              🎤 Start Conversation
            </Box>
          </Box>
        ) : (
          // Conversation Screen
          <>
            {/* Messages Container */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                mb: 3,
                maxHeight: '50vh',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                },
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.type === 'ai' ? 'flex-start' : 'flex-end',
                    mb: 2,
                  }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      maxWidth: '70%',
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: message.type === 'ai' ? 'white' : '#FF6B4A',
                      color: message.type === 'ai' ? '#1A1A1A' : 'white',
                      border: message.type === 'ai' ? '2px solid #F0F0F0' : 'none',
                    }}
                  >
                    <Typography sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                      {message.text}
                    </Typography>
                  </Paper>
                </Box>
              ))}

              {/* Live Transcript while listening */}
              {transcript && conversationState === 'listening' && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Paper
                    elevation={3}
                    sx={{
                      maxWidth: '70%',
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: '#FFE5E0',
                      border: '2px dashed #FF6B4A',
                    }}
                  >
                    <Typography sx={{ fontSize: '1rem', color: '#1A1A1A', fontStyle: 'italic' }}>
                      {transcript}
                    </Typography>
                  </Paper>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Status Bar */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                p: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '2px solid #F0F0F0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ color: '#999', fontSize: '0.85rem', fontWeight: '600' }}>
                  Question {currentStepIndex + 1} of {CONVERSATION_STEPS.length}
                </Typography>
                <Box
                  sx={{
                    width: 200,
                    height: 6,
                    bgcolor: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${((currentStepIndex + 1) / CONVERSATION_STEPS.length) * 100}% `,
                      height: '100%',
                      bgcolor: '#FF6B4A',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </Box>
              </Box>

              {/* Status Indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {conversationState === 'speaking' && (
                  <>
                    <CircularProgress size={32} sx={{ color: '#FF6B4A' }} />
                    <Typography sx={{ color: '#1A1A1A', fontSize: '1.1rem', fontWeight: '600' }}>
                      🔊 AI is speaking...
                    </Typography>
                  </>
                )}

                {conversationState === 'listening' && (
                  <>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                          '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: 'white',
                        }}
                      />
                    </Box>
                    <Typography sx={{ color: '#1A1A1A', fontSize: '1.1rem', fontWeight: '600' }}>
                      🎙️ Listening... Speak now
                    </Typography>
                  </>
                )}

                {conversationState === 'processing' && (
                  <>
                    <CircularProgress size={32} sx={{ color: '#7c3aed' }} />
                    <Typography sx={{ color: '#1A1A1A', fontSize: '1.1rem', fontWeight: '600' }}>
                      ⚙️ Processing your response...
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

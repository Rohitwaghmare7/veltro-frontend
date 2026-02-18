"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import api from "@/lib/api";

interface VoiceStepConfig {
  stepId: string;
  prompt: string;
  field: string;
  isFinal?: boolean;
}

export interface UseVoiceOnboardingReturn {
  status: "idle" | "listening" | "processing" | "done" | "error" | "speaking";
  transcript: string;
  extractedData: Record<string, any>;
  error: string | null;
  isSupported: boolean;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  startInteraction: () => void;
}

export function useVoiceOnboarding(
  stepConfig: VoiceStepConfig,
  onDataExtracted: (data: any) => void
): UseVoiceOnboardingReturn {
  const [status, setStatus] = useState<
    "idle" | "listening" | "processing" | "done" | "error" | "speaking"
  >("idle");
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Use react-speech-recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mountedRef = useRef(true);

  // Initialize Speech Synthesis and set mountedRef
  useEffect(() => {
    mountedRef.current = true;
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      mountedRef.current = false;
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      SpeechRecognition.stopListening(); // Ensure recognition is stopped on unmount
    };
  }, []);

  // Sync internal status with hook's listening state
  useEffect(() => {
    if (listening && status !== 'listening' && status !== 'speaking') { // Don't change status if speaking
      setStatus('listening');
    } else if (!listening && status === 'listening') {
      // Listening stopped externally or naturally
      if (transcript) {
        handleProcessing(transcript);
      } else {
        // If stopped without transcript, maybe user cancelled or silence?
        // For now, if no transcript, go to idle.
        setStatus('idle');
      }
    }
  }, [listening, transcript, status]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current) {
      console.error("Speech synthesis not supported");
      onEnd?.();
      return;
    }

    // Cancel any existing speech
    synthRef.current.cancel();
    setIsSpeaking(true);
    setStatus("speaking");

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // Prevent GC

    // Attempt to select a good voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google')) ||
      voices.find(v => v.lang.startsWith('en-'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      if (mountedRef.current) {
        setIsSpeaking(true);
        setStatus("speaking");
      }
    };

    utterance.onend = () => {
      if (mountedRef.current) {
        setIsSpeaking(false);
        utteranceRef.current = null;
        // If status was speaking, revert to idle or previous state if not listening
        if (status === 'speaking') {
          setStatus('idle');
        }
        onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      if (mountedRef.current) {
        setIsSpeaking(false);
        utteranceRef.current = null;
        if (status === 'speaking') {
          setStatus('idle');
        }
        onEnd?.(); // Proceed anyway
      }
    };

    synthRef.current.speak(utterance);
  }, [status]); // Include status in dependency array to correctly check it in onend/onerror

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      if (mountedRef.current) {
        setIsSpeaking(false);
        if (status === 'speaking') {
          setStatus('idle');
        }
      }
    }
  }, [status]);

  const startListening = useCallback(() => {
    setError(null);
    resetTranscript();

    // Start listening via library
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
    // Status will be updated by the useEffect watching `listening`
  }, [resetTranscript]);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
    // Status update handled in effect via listening state
  }, []);

  const startInteraction = useCallback(() => {
    setError(null);
    // Speak prompt, then listen
    speak(stepConfig.prompt, () => {
      // Start listening after speech ends
      // Add small delay to ensure audio context is clear
      setTimeout(() => {
        if (mountedRef.current) {
          startListening();
        }
      }, 300);
    });
  }, [speak, stepConfig.prompt, startListening]);

  const handleProcessing = async (text: string) => {
    if (!text.trim()) {
      setStatus("idle"); // If no text, just go back to idle
      return;
    }

    setStatus("processing");
    stopListening(); // Ensure we stop listening while processing

    try {
      console.log("Sending to backend:", { transcript: text, stepId: stepConfig.stepId, field: stepConfig.field });

      const response = await api.post("/onboarding/extract", {
        transcript: text,
        stepId: stepConfig.stepId,
        fields: [stepConfig.field],
      });

      console.log("Backend response:", response.data);

      if (response.data.success && response.data.data.extracted) {
        setExtractedData(response.data.data.extracted);
        setStatus("done");

        // Provide audio feedback
        speak("Got it. Please review the details.", () => {
          onDataExtracted && onDataExtracted(response.data.data.extracted);
        });

      } else {
        throw new Error(response.data.error || "Could not understand the response");
      }
    } catch (err: any) {
      console.error("Voice extraction error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to extract data";
      console.error("Error details:", err.response?.data);
      setError(errorMessage);
      setStatus("error");
      speak("Sorry, I had trouble understanding that. Please try again.");
    }
  };

  const reset = useCallback(() => {
    stopSpeaking();
    setStatus("idle");
    resetTranscript();
    setExtractedData({});
    setError(null);
    SpeechRecognition.stopListening();
  }, [stopSpeaking, resetTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      SpeechRecognition.stopListening();
    };
  }, [stopSpeaking]);

  return {
    status,
    transcript,
    extractedData,
    error,
    isSupported: browserSupportsSpeechRecognition,
    isSpeaking,
    startListening,
    stopListening,
    reset,
    speak,
    stopSpeaking,
    startInteraction
  };
}

"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

export default function TestAudioPage() {
  const [playing, setPlaying] = useState(false);
  const [testResult, setTestResult] = useState<string>("");

  const playTestSound = () => {
    setPlaying(true);
    setTestResult("Playing test sound...");

    // Create an audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator (generates a tone)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure the sound
    oscillator.frequency.value = 440; // A4 note
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3; // Volume
    
    // Play for 1 second
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
      setPlaying(false);
      setTestResult("✅ If you heard a beep, your speakers are working!");
    }, 1000);
  };

  const testSpeechSynthesis = () => {
    setTestResult("Testing browser speech synthesis...");
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Hello! This is a test of your browser's text to speech. Can you hear me?");
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setTestResult("✅ If you heard the voice, your speakers are working!");
      };
      
      utterance.onerror = (e) => {
        setTestResult(`❌ Speech synthesis error: ${e.error}`);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      setTestResult("❌ Speech synthesis not supported in this browser");
    }
  };

  const testAudioElement = () => {
    setTestResult("Testing HTML5 audio...");
    
    // Create a simple audio element with a data URL (440Hz sine wave)
    const audio = new Audio();
    
    // Generate a simple beep using Web Audio API and convert to blob
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const dest = audioContext.createMediaStreamDestination();
    
    oscillator.connect(gainNode);
    gainNode.connect(dest);
    
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    const mediaRecorder = new MediaRecorder(dest.stream);
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      audio.src = url;
      audio.play();
      setTestResult("✅ If you heard a sound, HTML5 audio is working!");
    };
    
    mediaRecorder.start();
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
      mediaRecorder.stop();
    }, 1000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          width: "100%",
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          🔊 Audio Test Page
        </Typography>

        <Typography sx={{ mb: 3, color: "#666" }}>
          Test your browser's audio output to make sure speakers are working before trying voice onboarding.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={playTestSound}
            disabled={playing}
            sx={{
              bgcolor: "#FF6B4A",
              "&:hover": { bgcolor: "#ff5533" },
              py: 1.5,
            }}
          >
            Test 1: Play Beep Sound
          </Button>

          <Button
            variant="contained"
            onClick={testSpeechSynthesis}
            sx={{
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#6d28d9" },
              py: 1.5,
            }}
          >
            Test 2: Browser Text-to-Speech
          </Button>

          <Button
            variant="contained"
            onClick={testAudioElement}
            sx={{
              bgcolor: "#22c55e",
              "&:hover": { bgcolor: "#16a34a" },
              py: 1.5,
            }}
          >
            Test 3: HTML5 Audio
          </Button>
        </Box>

        {testResult && (
          <Paper
            sx={{
              p: 2,
              bgcolor: testResult.includes("✅") ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${testResult.includes("✅") ? "#22c55e" : "#ef4444"}`,
            }}
          >
            <Typography sx={{ fontSize: "0.95rem" }}>
              {testResult}
            </Typography>
          </Paper>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: "#f9fafb", borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
            <strong>Troubleshooting:</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", fontSize: "0.85rem" }}>
            • Make sure your volume is turned up<br />
            • Check that your browser has permission to play audio<br />
            • Try using headphones if laptop speakers aren't working<br />
            • Check browser console for any errors (F12)
          </Typography>
        </Box>

        <Button
          variant="outlined"
          href="/onboarding"
          sx={{
            mt: 3,
            width: "100%",
            borderColor: "#FF6B4A",
            color: "#FF6B4A",
            "&:hover": {
              borderColor: "#ff5533",
              bgcolor: "rgba(255, 107, 74, 0.04)",
            },
          }}
        >
          ← Back to Onboarding
        </Button>
      </Paper>
    </Box>
  );
}

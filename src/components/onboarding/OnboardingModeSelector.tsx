"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MicIcon from "@mui/icons-material/Mic";
import EditIcon from "@mui/icons-material/Edit";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TuneIcon from "@mui/icons-material/Tune";
import PublicIcon from "@mui/icons-material/Public";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface OnboardingModeSelectorProps {
  onSelectMode: (mode: "manual" | "voice") => void;
}

const voiceFeatures = [
  { icon: <BoltIcon sx={{ fontSize: 14, color: "#FF6B4A" }} />, label: "3x faster than typing" },
  { icon: <RecordVoiceOverIcon sx={{ fontSize: 14, color: "#FF6B4A" }} />, label: "AI understands natural speech" },
  { icon: <CheckCircleIcon sx={{ fontSize: 14, color: "#FF6B4A" }} />, label: "Review and edit before saving" },
];

const manualFeatures = [
  { icon: <TuneIcon sx={{ fontSize: 14, color: "#888" }} />, label: "Complete control over input" },
  { icon: <PublicIcon sx={{ fontSize: 14, color: "#888" }} />, label: "Works in all browsers" },
  { icon: <AccessTimeIcon sx={{ fontSize: 14, color: "#888" }} />, label: "Takes about 5 minutes" },
];

export default function OnboardingModeSelector({ onSelectMode }: OnboardingModeSelectorProps) {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const handleVoiceMode = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice mode is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());

      if (!window.speechSynthesis) {
        alert("Text-to-speech is not supported in this browser.");
        return;
      }

      onSelectMode("voice");
    } catch (error) {
      console.error("Microphone permission error:", error);
      alert(
        "Microphone access is required for voice mode. Please allow microphone access in your browser settings and try again."
      );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        px: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            color: "#1A1A1A",
            fontWeight: "800",
            fontSize: { xs: "2rem", sm: "2.5rem" },
            mb: 2,
            letterSpacing: "-0.5px",
          }}
        >
          Welcome to Veltro
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "#666",
            fontWeight: "400",
            fontSize: { xs: "1rem", sm: "1.1rem" },
            maxWidth: "500px",
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          Let's set up your business workspace. Choose how you'd like to get started:
        </Typography>
      </Box>

      {/* Mode Cards */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{
          width: "90%",
          mb: 4,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Voice Mode Card */}
        <Box
          onClick={() => isSupported && handleVoiceMode()}
          sx={{
            flex: 1,
            p: 6,
            minWidth: "400px",
            borderRadius: 1,
            bgcolor: isSupported ? "white" : "#F5F5F5",
            border: isSupported ? "2px solid #FF6B4A" : "2px solid #E0E0E0",
            cursor: isSupported ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
            opacity: isSupported ? 1 : 0.6,
            "&:hover": isSupported
              ? {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(255, 107, 74, 0.2)",
                  borderColor: "#FF8A4D",
                }
              : {},
          }}
        >
          {/* Badge */}
          {isSupported && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                bgcolor: "rgba(255, 107, 74, 0.1)",
                color: "#FF6B4A",
                px: 2,
                py: 0.5,
                borderRadius: 10,
                fontSize: "0.7rem",
                fontWeight: "700",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: "0.9rem" }} />
              AI Powered
            </Box>
          )}

          {/* Icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: isSupported ? "rgba(255, 107, 74, 0.1)" : "rgba(0, 0, 0, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              mx: "auto",
            }}
          >
            <MicIcon sx={{ fontSize: 32, color: isSupported ? "#FF6B4A" : "#999" }} />
          </Box>

          {/* Content */}
          <Typography
            variant="h5"
            sx={{
              color: isSupported ? "#1A1A1A" : "#999",
              fontWeight: "700",
              mb: 1.5,
              fontSize: "1.4rem",
            }}
          >
            Voice Assistant
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: isSupported ? "#666" : "#999",
              lineHeight: 1.6,
              mb: 3,
              fontSize: "0.95rem",
            }}
          >
            Speak naturally and let AI fill in your business details. Fast, easy, and hands-free.
          </Typography>

          {/* Features */}
          <Stack spacing={1} sx={{ textAlign: "left", mb: 3 }}>
            {voiceFeatures.map((feature, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "6px",
                    bgcolor: "rgba(255, 107, 74, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: isSupported ? "#888" : "#999",
                    fontSize: "0.85rem",
                  }}
                >
                  {feature.label}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Button */}
          <Button
            fullWidth
            variant="contained"
            disabled={!isSupported}
            sx={{
              background: isSupported
                ? "linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)"
                : "#E0E0E0",
              color: "white",
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "600",
              textTransform: "none",
              borderRadius: 1,
              boxShadow: isSupported ? "0 4px 12px rgba(255, 107, 74, 0.3)" : "none",
              "&:hover": isSupported
                ? {
                    background: "linear-gradient(135deg, #FF8A4D 0%, #FF6B4A 100%)",
                    boxShadow: "0 6px 16px rgba(255, 107, 74, 0.4)",
                  }
                : {},
            }}
          >
            {isSupported ? "Start with Voice" : "Not Supported"}
          </Button>

          {!isSupported && (
            <Typography
              variant="caption"
              sx={{ color: "#999", fontSize: "0.75rem", mt: 1, display: "block" }}
            >
              Voice mode requires Chrome or Edge browser
            </Typography>
          )}
        </Box>

        {/* Manual Mode Card */}
        <Box
          onClick={() => onSelectMode("manual")}
          sx={{
            flex: 1,
            p: 6.73,
            minWidth: "400px",
            borderRadius: 1,
            bgcolor: "white",
            border: "2px solid #E0E0E0",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
              borderColor: "#BDBDBD",
            },
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "rgba(0, 0, 0, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              mx: "auto",
            }}
          >
            <EditIcon sx={{ fontSize: 32, color: "#666" }} />
          </Box>

          {/* Content */}
          <Typography
            variant="h5"
            sx={{ color: "#1A1A1A", fontWeight: "700", mb: 1.5, fontSize: "1.4rem" }}
          >
            Manual Entry
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#666", lineHeight: 1.6, mb: 3, fontSize: "0.95rem" }}
          >
            Fill out the forms step-by-step at your own pace. Traditional and reliable.
          </Typography>

          {/* Features */}
          <Stack spacing={1} sx={{ textAlign: "left", mb: 3 }}>
            {manualFeatures.map((feature, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "6px",
                    bgcolor: "rgba(0, 0, 0, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="caption" sx={{ color: "#888", fontSize: "0.85rem" }}>
                  {feature.label}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Button */}
          <Button
            fullWidth
            variant="outlined"
            sx={{
              borderColor: "#E0E0E0",
              color: "#666",
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "600",
              textTransform: "none",
              borderRadius: 1,
              "&:hover": {
                borderColor: "#BDBDBD",
                bgcolor: "rgba(0, 0, 0, 0.02)",
              },
            }}
          >
            Continue Manually
          </Button>
        </Box>
      </Stack>

      {/* Footer note */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <InfoOutlinedIcon sx={{ fontSize: 16, color: "#BDBDBD" }} />
        <Typography variant="caption" sx={{ color: "#999", fontSize: "0.85rem" }}>
          You can switch between modes at any time during onboarding
        </Typography>
      </Box>
    </Box>
  );
}
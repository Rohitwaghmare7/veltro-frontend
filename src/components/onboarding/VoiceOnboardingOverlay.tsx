"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useVoiceOnboarding } from "@/hooks/useVoiceOnboarding";

interface VoiceOnboardingOverlayProps {
  stepConfig: {
    stepId: string;
    prompt: string;
    hint: string;
    fields: string[];
  };
  onDataExtracted: (data: any) => void;
  onClose: () => void;
  onSkip: () => void;
}

export default function VoiceOnboardingOverlay({
  stepConfig,
  onDataExtracted,
  onClose,
  onSkip,
}: VoiceOnboardingOverlayProps) {
  const { status, transcript, extractedData, error, isSupported, isSpeaking, startListening, stopListening, reset, startInteraction, stopSpeaking } =
    useVoiceOnboarding(stepConfig, onDataExtracted);

  // Auto-start interaction when the overlay opens or step changes
  useEffect(() => {
    // Only start if supported and idle
    if (isSupported && status === "idle") {
      // Small delay to allow valid user interaction context if possible, 
      // though typically browser blocks auto-play without prior interaction.
      // We'll rely on the user clicking the mic for the very first time if blocked,
      // but try to auto-start for subsequent steps if the interaction chain is maintained.
      startInteraction();
    }
    // Cleanup handled in hook
  }, [stepConfig.stepId, isSupported, startInteraction]);

  const handleConfirm = () => {
    stopSpeaking();
    onClose();
  };

  const handleRetry = () => {
    reset();
    startInteraction();
  };

  const handleClose = () => {
    stopSpeaking();
    onClose();
  };

  const handleSkip = () => {
    stopSpeaking();
    onSkip();
  };

  const toggleListening = () => {
    if (status === "listening") {
      stopListening();
    } else if (status === "speaking") {
      stopSpeaking();
      startListening(); // Interrupt speech and start listening
    } else {
      startInteraction();
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        animation: "fadeIn 0.3s ease",
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      {/* Voice Card */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 4,
          p: 4,
          maxWidth: 600,
          width: "100%",
          position: "relative",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.3s ease",
          "@keyframes slideUp": {
            from: { opacity: 0, transform: "translateY(20px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "#999",
            "&:hover": { color: "#666", bgcolor: "rgba(0, 0, 0, 0.05)" },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              color: "#1A1A1A",
              fontWeight: "700",
              mb: 1.5,
              fontSize: "1.5rem",
            }}
          >
            🎤 Voice Assistant
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              lineHeight: 1.6,
              fontSize: "1rem",
            }}
          >
            {stepConfig.prompt}
          </Typography>
        </Box>

        {/* Mic Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box sx={{ position: "relative" }}>
            {/* Ripple effect when listening or speaking */}
            {(status === "listening" || status === "speaking") && (
              <>
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 100 + i * 30,
                      height: 100 + i * 30,
                      borderRadius: "50%",
                      border: `2px solid ${status === "speaking" ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 107, 74, 0.3)"}`,
                      animation: `ripple 1.8s ease-out infinite`,
                      animationDelay: `${i * 0.4}s`,
                      "@keyframes ripple": {
                        "0%": { transform: "translate(-50%, -50%) scale(0.9)", opacity: 0.6 },
                        "100%": { transform: "translate(-50%, -50%) scale(1.4)", opacity: 0 },
                      },
                    }}
                  />
                ))}
              </>
            )}

            {/* Mic button */}
            <IconButton
              onClick={toggleListening}
              disabled={status === "processing" || !isSupported}
              sx={{
                width: 100,
                height: 100,
                bgcolor:
                  status === "listening"
                    ? "#ef4444"
                    : status === "speaking"
                      ? "#3b82f6"
                      : status === "processing"
                        ? "#7c3aed"
                        : "linear-gradient(135deg, #1e3a5f, #1a2744)",
                color: "white",
                "&:hover": {
                  bgcolor:
                    status === "listening"
                      ? "#dc2626"
                      : status === "speaking"
                        ? "#2563eb"
                        : status === "processing"
                          ? "#6d28d9"
                          : "#2a4a6f",
                },
                "&:disabled": {
                  bgcolor: "#E0E0E0",
                  color: "#999",
                },
                boxShadow:
                  (status === "listening" || status === "speaking")
                    ? `0 8px 24px ${status === "speaking" ? "rgba(59, 130, 246, 0.4)" : "rgba(239, 68, 68, 0.4)"}`
                    : "0 8px 24px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease",
              }}
            >
              {status === "processing" ? (
                <CircularProgress size={40} sx={{ color: "white" }} />
              ) : status === "listening" ? (
                <StopIcon sx={{ fontSize: 40 }} />
              ) : status === "speaking" ? (
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                  {[1, 2, 3, 4].map(i => (
                    <Box
                      key={i}
                      sx={{
                        width: 4,
                        height: 16,
                        bgcolor: 'white',
                        borderRadius: 2,
                        animation: 'soundWave 1s ease infinite',
                        animationDelay: `${i * 0.1}s`,
                        "@keyframes soundWave": {
                          "0%, 100%": { height: 16 },
                          "50%": { height: 32 }
                        }
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <MicIcon sx={{ fontSize: 40 }} />
              )}
            </IconButton>
          </Box>
        </Box>

        {/* Status text */}
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            color: "#666",
            mb: 3,
            fontSize: "0.95rem",
            fontWeight: "500",
          }}
        >
          {status === "idle" && "Tap to start conversation"}
          {status === "speaking" && "🔊 AI is speaking..."}
          {status === "listening" && "🎙️ Listening... tap to stop"}
          {status === "processing" && "⚙️ Processing your answer..."}
          {status === "done" && "✓ Got it! Review below"}
          {status === "error" && "⚠️ Something went wrong"}
        </Typography>

        {/* Live transcript */}
        {transcript && status === "listening" && (
          <Box
            sx={{
              bgcolor: "rgba(59, 130, 246, 0.06)",
              border: "1px solid rgba(59, 130, 246, 0.15)",
              borderRadius: 2,
              p: 2,
              mb: 3,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#3b82f6",
                fontWeight: "600",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                mb: 1,
              }}
            >
              Hearing:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              "{transcript}"
            </Typography>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Box
            sx={{
              bgcolor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: 2,
              p: 2,
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: "#ef4444", fontSize: "0.9rem" }}>
              ⚠️ {error}
            </Typography>
            <Button
              size="small"
              onClick={handleRetry}
              sx={{
                color: "#3b82f6",
                textTransform: "none",
                fontSize: "0.85rem",
                fontWeight: "600",
              }}
            >
              Retry
            </Button>
          </Box>
        )}

        {/* Extracted data */}
        {extractedData && status === "done" && (
          <Box
            sx={{
              bgcolor: "rgba(34, 197, 94, 0.06)",
              border: "1px solid rgba(34, 197, 94, 0.15)",
              borderRadius: 2,
              p: 2.5,
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CheckCircleIcon sx={{ color: "#22c55e", fontSize: 20 }} />
              <Typography
                variant="caption"
                sx={{
                  color: "#22c55e",
                  fontWeight: "600",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Captured Information
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {Object.entries(extractedData).map(([key, value]) => (
                <Box
                  key={key}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 2,
                    pb: 1,
                    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                    "&:last-child": { borderBottom: "none", pb: 0 },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#888",
                      fontSize: "0.8rem",
                      textTransform: "capitalize",
                      flexShrink: 0,
                    }}
                  >
                    {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#1A1A1A",
                      fontWeight: "500",
                      fontSize: "0.9rem",
                      textAlign: "right",
                    }}
                  >
                    {value !== null && value !== undefined ? (
                      typeof value === "object" ? (
                        JSON.stringify(value)
                      ) : (
                        String(value)
                      )
                    ) : (
                      <em style={{ color: "#BDBDBD" }}>not mentioned</em>
                    )}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Hint */}
        {status === "idle" && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              color: "#999",
              fontSize: "0.85rem",
              mb: 3,
              lineHeight: 1.5,
            }}
          >
            💡 {stepConfig.hint}
          </Typography>
        )}

        {/* Action buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={handleSkip}
            sx={{
              borderColor: "#E0E0E0",
              color: "#666",
              textTransform: "none",
              fontWeight: "600",
              "&:hover": {
                borderColor: "#BDBDBD",
                bgcolor: "rgba(0, 0, 0, 0.02)",
              },
            }}
          >
            Skip
          </Button>

          {status === "done" && (
            <>
              <Button
                variant="outlined"
                onClick={handleRetry}
                sx={{
                  borderColor: "#E0E0E0",
                  color: "#666",
                  textTransform: "none",
                  fontWeight: "600",
                  "&:hover": {
                    borderColor: "#BDBDBD",
                    bgcolor: "rgba(0, 0, 0, 0.02)",
                  },
                }}
              >
                Re-record
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                sx={{
                  background: "linear-gradient(135deg, #FF6B4A 0%, #FF8A4D 100%)",
                  color: "white",
                  textTransform: "none",
                  fontWeight: "600",
                  boxShadow: "0 4px 12px rgba(255, 107, 74, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #FF8A4D 0%, #FF6B4A 100%)",
                    boxShadow: "0 6px 16px rgba(255, 107, 74, 0.4)",
                  },
                }}
              >
                Confirm & Continue
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

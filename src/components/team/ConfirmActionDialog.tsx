'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    useTheme,
    CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';

interface ConfirmActionDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    type?: 'warning' | 'danger';
    processing?: boolean;
}

export default function ConfirmActionDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    type = 'warning',
    processing = false,
}: ConfirmActionDialogProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const bgColor = isDark ? '#1a1d29' : '#ffffff';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

    const iconConfig = type === 'danger'
        ? {
            icon: ErrorIcon,
            color: '#ef4444',
            bgColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
            buttonColor: '#ef4444',
            buttonHoverColor: '#dc2626',
        }
        : {
            icon: WarningAmberIcon,
            color: '#f59e0b',
            bgColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
            buttonColor: '#f59e0b',
            buttonHoverColor: '#d97706',
        };

    const Icon = iconConfig.icon;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '24px',
                        bgcolor: bgColor,
                        boxShadow: isDark ? '0px 20px 60px rgba(0,0,0,0.5)' : '0px 20px 60px rgba(0,0,0,0.15)',
                    }
                }
            }}
        >
            <DialogTitle sx={{ pb: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            bgcolor: iconConfig.bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon sx={{ color: iconConfig.color, fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} color={textPrimary}>
                            {title}
                        </Typography>
                        <Typography variant="caption" color={textSecondary}>
                            Please confirm this action
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" color={textPrimary}>
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={processing}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                        color: textPrimary,
                        '&:hover': {
                            borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#cbd5e1',
                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    disabled={processing}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        bgcolor: iconConfig.buttonColor,
                        color: 'white',
                        boxShadow: `0 4px 14px 0 ${iconConfig.buttonColor}66`,
                        '&:hover': {
                            bgcolor: iconConfig.buttonHoverColor,
                            boxShadow: `0 6px 20px ${iconConfig.buttonColor}80`,
                        }
                    }}
                >
                    {processing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

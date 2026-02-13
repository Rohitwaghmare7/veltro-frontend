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
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface ConfirmDeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export default function ConfirmDeleteDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
}: ConfirmDeleteDialogProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const bgColor = isDark ? '#1a1d29' : '#ffffff';
    const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : '#1e293b';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';

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
                            bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <DeleteOutlineIcon sx={{ color: '#ef4444', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} color={textPrimary}>
                            {title}
                        </Typography>
                        <Typography variant="caption" color={textSecondary}>
                            This action cannot be undone
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
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        bgcolor: '#ef4444',
                        color: 'white',
                        boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
                        '&:hover': {
                            bgcolor: '#dc2626',
                            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
                        }
                    }}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}

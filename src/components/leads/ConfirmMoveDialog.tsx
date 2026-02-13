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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ConfirmMoveDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    count: number;
    fromColumn: string;
    toColumn: string;
}

export default function ConfirmMoveDialog({
    open,
    onClose,
    onConfirm,
    count,
    fromColumn,
    toColumn,
}: ConfirmMoveDialogProps) {
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
                            bgcolor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <WarningAmberIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} color={textPrimary}>
                            Confirm Bulk Move
                        </Typography>
                        <Typography variant="caption" color={textSecondary}>
                            This action will move multiple leads
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" color={textPrimary} sx={{ mb: 2 }}>
                    Are you sure you want to move <strong>{count}</strong> {count === 1 ? 'lead' : 'leads'} from{' '}
                    <strong>{fromColumn}</strong> to <strong>{toColumn}</strong>?
                </Typography>
                <Box
                    sx={{
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        borderRadius: '12px',
                        p: 2,
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                    }}
                >
                    <Typography variant="caption" color={textSecondary} sx={{ display: 'block', mb: 0.5 }}>
                        This will:
                    </Typography>
                    <Typography variant="body2" color={textPrimary}>
                        • Update the status of all {count} leads
                    </Typography>
                    <Typography variant="body2" color={textPrimary}>
                        • Move them to the {toColumn} column
                    </Typography>
                    <Typography variant="body2" color={textPrimary}>
                        • This action can be undone by moving them back
                    </Typography>
                </Box>
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
                        bgcolor: '#f59e0b',
                        color: 'white',
                        boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.39)',
                        '&:hover': {
                            bgcolor: '#d97706',
                            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.5)',
                        }
                    }}
                >
                    Move {count} {count === 1 ? 'Lead' : 'Leads'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

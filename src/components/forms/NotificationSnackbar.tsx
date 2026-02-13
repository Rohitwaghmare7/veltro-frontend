'use client';

import { Snackbar, Alert, AlertColor, useTheme } from '@mui/material';

interface NotificationSnackbarProps {
    open: boolean;
    onClose: () => void;
    message: string;
    severity?: AlertColor;
}

export default function NotificationSnackbar({
    open,
    onClose,
    message,
    severity = 'success',
}: NotificationSnackbarProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Snackbar
            open={open}
            autoHideDuration={4000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{
                    borderRadius: '12px',
                    fontWeight: 600,
                    boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.15)',
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}

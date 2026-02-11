'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo,
        });

        // Log to error reporting service (e.g., Sentry)
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        window.location.href = '/dashboard';
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="100vh"
                    p={3}
                    bgcolor="background.default"
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            maxWidth: 600,
                            width: '100%',
                            textAlign: 'center',
                        }}
                    >
                        <ErrorOutlineIcon
                            sx={{
                                fontSize: 80,
                                color: 'error.main',
                                mb: 2,
                            }}
                        />
                        
                        <Typography variant="h4" gutterBottom fontWeight="bold">
                            Oops! Something went wrong
                        </Typography>
                        
                        <Typography variant="body1" color="textSecondary" paragraph>
                            We're sorry for the inconvenience. An unexpected error occurred.
                        </Typography>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <Alert severity="error" sx={{ mt: 2, mb: 2, textAlign: 'left' }}>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Error Details (Development Only):
                                </Typography>
                                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {this.state.error.toString()}
                                </Typography>
                                {this.state.errorInfo && (
                                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 1 }}>
                                        {this.state.errorInfo.componentStack}
                                    </Typography>
                                )}
                            </Alert>
                        )}

                        <Box display="flex" gap={2} justifyContent="center" mt={3}>
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                onClick={this.handleReload}
                            >
                                Reload Page
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={this.handleReset}
                            >
                                Go to Dashboard
                            </Button>
                        </Box>

                        <Typography variant="caption" color="textSecondary" display="block" mt={3}>
                            If this problem persists, please contact support.
                        </Typography>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

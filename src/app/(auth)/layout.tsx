'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 3,
            }}
        >
            <Container maxWidth="sm">
                {children}
            </Container>
        </Box>
    );
}

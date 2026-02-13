'use client';

import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'; // Using thumb up as placeholder for interaction

interface SmallStatCardProps {
    title: string;
    value: string;
    color: string; // Progress bar color
}

export default function SmallStatCard({ title, value, color }: SmallStatCardProps) {
    return (
        <Paper sx={{
            p: 2.5,
            borderRadius: '20px',
            bgcolor: (theme) => theme.palette.mode === 'light' ? '#fff' : '#1a1d29',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {value}
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {title}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <ThumbUpOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <LinearProgress
                    variant="determinate"
                    value={70}
                    sx={{
                        flexGrow: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: (theme) => theme.palette.mode === 'light' ? '#f0f0f0' : 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: color,
                            borderRadius: 3
                        }
                    }}
                />
            </Box>
        </Paper>
    );
}

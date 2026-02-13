'use client';

import { Box, Paper, Typography, IconButton, Divider } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface TotalLikesCardProps {
    title?: string;
    total?: string | number;
    breakdown?: {
        label: string;
        value: string | number;
        color?: string;
    }[];
    color?: string;
}

export default function TotalLikesCard({
    title = "Total Likes",
    total = "23.000k",
    breakdown = [
        { label: 'Female', value: '%20', color: '#FFD700' },
        { label: 'Male', value: '%50' },
        { label: 'Other', value: '%30' }
    ],
    color = "#FF6B4A"
}: TotalLikesCardProps) {
    return (
        <Paper sx={{
            height: '100%',
            p: 3,
            borderRadius: '24px',
            bgcolor: color,
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 10px 30px ${color}4D`
        }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem', mb: 0.5 }}>
                        {title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '2.5rem' }}>
                        {total}
                    </Typography>
                </Box>
                <IconButton sx={{ color: 'rgba(255,255,255,0.8)', p: 0 }}>

                </IconButton>
            </Box>

            {/* Bottom Section - Demographics */}
            <Box sx={{ display: 'flex', gap: 0, mt: 4 }}>
                {breakdown.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            flex: 1,
                            px: index === 0 ? 0 : 2,
                            pl: index === breakdown.length - 1 && breakdown.length > 1 ? 2 : undefined,
                            pr: index === 0 && breakdown.length > 1 ? 2 : undefined,
                            borderRight: index < breakdown.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {item.color && (
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: item.color }} />
                            )}
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{item.label}</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                    </Box>
                ))}
            </Box>

        </Paper>
    );
}

'use client';

import { Box, Paper, Typography, IconButton, Avatar, Chip } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const posts = [
    { id: 1, title: 'How to sell products online?', subtitle: 'Post Number 1', tag: 'Blog', stats: '3.k', growth: 5, color: '#FF6B4A' },
    { id: 2, title: 'What is the value for your company', subtitle: 'Post Number 2', tag: 'Company', stats: '3.k', growth: -4, color: '#FCD34D' },
    { id: 3, title: 'New Product', subtitle: 'Post Number 3', tag: 'Product', stats: '3.k', growth: 6, color: '#4ADE80' },
    { id: 4, title: 'What do you do today?', subtitle: 'Post Number 4', tag: 'Persona', stats: '3.k', growth: 8, color: '#FF6B4A' },
];

export default function PostActivityList() {
    return (
        <Paper sx={{
            p: 3,
            borderRadius: '24px',
            bgcolor: (theme) => theme.palette.mode === 'light' ? '#fff' : '#1a1d29',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            height: '100%'
        }}>
            <Box sx={{ display: 'flex', gap: 3, mb: 3, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, borderBottom: '2px solid', borderColor: 'text.primary', pb: 1, mb: -1.1 }}>
                    Post Activity
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', pb: 1 }}>
                    User
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {posts.map((post) => (
                    <Box key={post.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Left: Image & Text */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 2 }}>
                            <Avatar
                                variant="rounded"
                                src={`https://source.unsplash.com/random/100x100?sig=${post.id}`}
                                sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: post.color }}
                            >
                                {post.title[0]}
                            </Avatar>
                            <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                    {post.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {post.subtitle}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Middle: Tag */}
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {post.tag}
                            </Typography>
                        </Box>

                        {/* Right: Stats */}
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {post.stats}
                            </Typography>
                            <Chip
                                icon={post.growth > 0 ? <ArrowUpwardIcon sx={{ width: 14 }} /> : <ArrowDownwardIcon sx={{ width: 14 }} />}
                                label={`${Math.abs(post.growth)}%`}
                                size="small"
                                sx={{
                                    height: 24,
                                    bgcolor: post.growth > 0 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: post.growth > 0 ? '#4ADE80' : '#ef4444',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    '& .MuiChip-icon': {
                                        color: 'inherit'
                                    }
                                }}
                            />
                            <IconButton size="small">
                                <MoreHorizIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}

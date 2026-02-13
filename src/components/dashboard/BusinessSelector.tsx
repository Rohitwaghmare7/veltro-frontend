'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import BusinessIcon from '@mui/icons-material/Business';
import api from '@/lib/api';

interface BusinessContext {
    _id: string;
    name: string;
    role: 'owner' | 'staff';
}

export default function BusinessSelector() {
    const [businesses, setBusinesses] = useState<BusinessContext[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const res = await api.get('/staff/businesses');
                if (res.data.success) {
                    setBusinesses(res.data.data);

                    // Initialize selection from localStorage or default to first one
                    const stored = localStorage.getItem('selectedBusinessId');
                    if (stored && res.data.data.some((b: any) => b._id === stored)) {
                        setSelectedId(stored);
                    } else if (res.data.data.length > 0) {
                        const firstId = res.data.data[0]._id;
                        setSelectedId(firstId);
                        localStorage.setItem('selectedBusinessId', firstId);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch businesses', err);
            }
        };

        fetchBusinesses();
    }, []);

    const handleChange = (event: SelectChangeEvent) => {
        const businessId = event.target.value;
        setSelectedId(businessId);
        localStorage.setItem('selectedBusinessId', businessId);

        // Refresh the page to update all data based on new context
        window.location.reload();
    };

    if (businesses.length === 0) return null;

    return (
        <Box sx={{ minWidth: 180 }}>
            <FormControl fullWidth size="small">
                <Select
                    value={selectedId}
                    onChange={handleChange}
                    displayEmpty
                    variant="standard"
                    disableUnderline
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1a1d29' : '#ffffff',
                                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                borderRadius: 2,
                                mt: 1,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                '& .MuiMenuItem-root': {
                                    color: (theme) => theme.palette.mode === 'dark' ? 'white' : '#1a1d29',
                                    fontSize: '0.875rem',
                                    py: 1,
                                    '&:hover': {
                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.15) !important' : 'rgba(102, 126, 234, 0.1) !important',
                                        color: (theme) => theme.palette.mode === 'dark' ? 'white' : '#1a1d29'
                                    }
                                }
                            }
                        }
                    }}
                    sx={{
                        borderRadius: 2,
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                        color: (theme) => theme.palette.mode === 'dark' ? 'white' : '#1a1d29',
                        px: 1.5,
                        py: 0.75,
                        transition: 'all 0.2s',
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                        },
                        '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: '0 !important',
                            pr: '24px !important',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        },
                        '& .MuiSvgIcon-root': {
                            color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                        }
                    }}
                >
                    {businesses.map((biz) => (
                        <MenuItem key={biz._id} value={biz._id}>
                            <BusinessIcon sx={{ fontSize: 16, color: 'inherit', mr: 1, opacity: 0.7 }} />
                            <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 'inherit' }}>
                                {biz.name}
                            </Typography>
                            <Chip
                                label={biz.role === 'owner' ? 'OWNER' : 'STAFF'}
                                size="small"
                                sx={{
                                    height: 16,
                                    fontSize: '0.6rem',
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    border: 'none',
                                    ml: 1
                                }}
                            />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

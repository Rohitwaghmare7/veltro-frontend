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
        <Box sx={{ minWidth: 200 }}>
            <FormControl fullWidth size="small">
                <Select
                    value={selectedId}
                    onChange={handleChange}
                    displayEmpty
                    sx={{
                        borderRadius: 2,
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 0.5
                        }
                    }}
                >
                    {businesses.map((biz) => (
                        <MenuItem key={biz._id} value={biz._id}>
                            <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" fontWeight="medium">
                                    {biz.name}
                                </Typography>
                            </Box>
                            <Chip
                                label={biz.role.toUpperCase()}
                                size="small"
                                color={biz.role === 'owner' ? 'primary' : 'default'}
                                variant="outlined"
                                sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

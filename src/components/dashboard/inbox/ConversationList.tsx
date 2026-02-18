'use client';

import {
    Box,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    TextField,
    InputAdornment,
    ToggleButtonGroup,
    ToggleButton,
    Badge,
    Chip,
    Checkbox,
    IconButton,
    Button,
    Stack,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ChecklistIcon from '@mui/icons-material/Checklist';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // Using as a placeholder for resolve if needed, but CheckCircle is better
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';
import { Conversation } from '@/lib/services/inbox.service';
import { useState } from 'react';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId?: string;
    onSelect: (conversation: Conversation) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    statusFilter: 'all' | 'open' | 'resolved';
    onFilterChange: (filter: 'all' | 'open' | 'resolved') => void;
    onBulkResolve: (ids: string[]) => Promise<void>;
    onBulkReopen: (ids: string[]) => Promise<void>;
    onBulkDelete: (ids: string[]) => Promise<void>;
    onNewConversation?: () => void;
    onSyncGmail?: () => void;
    syncing?: boolean;
}

export default function ConversationList({
    conversations,
    selectedId,
    onSelect,
    searchQuery,
    onSearchChange,
    statusFilter,
    onFilterChange,
    onBulkResolve,
    onBulkReopen,
    onBulkDelete,
    onNewConversation,
    onSyncGmail,
    syncing = false
}: ConversationListProps) {
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);

    const handleSelectAll = () => {
        if (selectedIds.length === conversations.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(conversations.map(c => c._id));
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkAction = async (action: 'resolve' | 'reopen' | 'delete') => {
        if (selectedIds.length === 0) return;
        setIsExecuting(true);
        try {
            if (action === 'resolve') {
                await onBulkResolve(selectedIds);
            } else if (action === 'reopen') {
                await onBulkReopen(selectedIds);
            } else if (action === 'delete') {
                await onBulkDelete(selectedIds);
            }
            // Reset selection mode after successful action
            setIsSelectionMode(false);
            setSelectedIds([]);
        } catch (error) {
            console.error('Bulk action failed:', error);
        } finally {
            setIsExecuting(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <Paper sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1a1d29' : '#fff',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
            <Box p={2.5} pb={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'var(--font-poppins)' }}>
                        {isSelectionMode ? `${selectedIds.length} Selected` : 'Messages'}
                    </Typography>
                    <Box display="flex" gap={1}>
                        {!isSelectionMode && onNewConversation && (
                            <Tooltip title="New Conversation">
                                <IconButton 
                                    size="small" 
                                    onClick={onNewConversation}
                                    sx={{
                                        bgcolor: '#ff6b6b',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: '#ff5252'
                                        }
                                    }}
                                >
                                    <AddIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {!isSelectionMode && onSyncGmail && (
                            <Tooltip title="Sync Gmail">
                                <IconButton 
                                    size="small" 
                                    onClick={onSyncGmail}
                                    disabled={syncing}
                                    sx={{
                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                        '&:hover': {
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
                                        },
                                        '&.Mui-disabled': {
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                        }
                                    }}
                                >
                                    <SyncIcon sx={{ 
                                        fontSize: 16,
                                        animation: syncing ? 'spin 1s linear infinite' : 'none',
                                        '@keyframes spin': {
                                            '0%': { transform: 'rotate(0deg)' },
                                            '100%': { transform: 'rotate(360deg)' }
                                        }
                                    }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {isSelectionMode ? (
                            <IconButton size="small" onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }}>
                                <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        ) : (
                            <Tooltip title="Select Messages">
                                <IconButton size="small" onClick={() => setIsSelectionMode(true)}>
                                    <ChecklistIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                {isSelectionMode ? (
                    <Stack spacing={1} mb={2}>
                        <Box display="flex" gap={1}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleSelectAll}
                                fullWidth
                                sx={{ 
                                    borderRadius: '8px', 
                                    textTransform: 'none',
                                    borderColor: '#ff6b6b',
                                    color: '#ff6b6b',
                                    '&:hover': {
                                        borderColor: '#ff5252',
                                        bgcolor: 'rgba(255, 107, 107, 0.05)'
                                    }
                                }}
                            >
                                {selectedIds.length === conversations.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </Box>
                        <Box display="flex" gap={1}>
                            {statusFilter !== 'resolved' && (
                                <Box
                                    onClick={selectedIds.length > 0 && !isExecuting ? () => handleBulkAction('resolve') : undefined}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                        bgcolor: selectedIds.length === 0 || isExecuting ? '#d1d5db' : '#ff6b6b',
                                        color: selectedIds.length === 0 || isExecuting ? '#9ca3af' : '#ffffff',
                                        px: 2,
                                        py: 1,
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        cursor: selectedIds.length === 0 || isExecuting ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: selectedIds.length === 0 || isExecuting ? 0.6 : 1,
                                        flex: 1,
                                        textTransform: 'none',
                                        '&:hover': {
                                            bgcolor: selectedIds.length === 0 || isExecuting ? '#d1d5db' : '#ff5252',
                                            transform: selectedIds.length === 0 || isExecuting ? 'none' : 'translateY(-1px)',
                                            boxShadow: selectedIds.length === 0 || isExecuting ? 'none' : '0 4px 12px rgba(255, 107, 107, 0.3)'
                                        }
                                    }}
                                >
                                    <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                                    Resolve
                                </Box>
                            )}
                            {statusFilter !== 'open' && (
                                <Box
                                    onClick={selectedIds.length > 0 && !isExecuting ? () => handleBulkAction('reopen') : undefined}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                        bgcolor: selectedIds.length === 0 || isExecuting ? '#d1d5db' : '#ff6b6b',
                                        color: selectedIds.length === 0 || isExecuting ? '#9ca3af' : '#ffffff',
                                        px: 2,
                                        py: 1,
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        cursor: selectedIds.length === 0 || isExecuting ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: selectedIds.length === 0 || isExecuting ? 0.6 : 1,
                                        flex: 1,
                                        textTransform: 'none',
                                        '&:hover': {
                                            bgcolor: selectedIds.length === 0 || isExecuting ? '#d1d5db' : '#ff5252',
                                            transform: selectedIds.length === 0 || isExecuting ? 'none' : 'translateY(-1px)',
                                            boxShadow: selectedIds.length === 0 || isExecuting ? 'none' : '0 4px 12px rgba(255, 107, 107, 0.3)'
                                        }
                                    }}
                                >
                                    <RestoreIcon sx={{ fontSize: 18 }} />
                                    Reopen
                                </Box>
                            )}
                        </Box>
                        <Box
                            onClick={selectedIds.length > 0 && !isExecuting ? () => handleBulkAction('delete') : undefined}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                                bgcolor: selectedIds.length === 0 || isExecuting ? '#d1d5db' : '#ff6b6b',
                                color: selectedIds.length === 0 || isExecuting ? '#9ca3af' : '#ffffff',
                                px: 2,
                                py: 1,
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: selectedIds.length === 0 || isExecuting ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: selectedIds.length === 0 || isExecuting ? 0.6 : 1,
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: selectedIds.length === 0 || isExecuting ? '#d1d5db' : '#ff5252',
                                    transform: selectedIds.length === 0 || isExecuting ? 'none' : 'translateY(-1px)',
                                    boxShadow: selectedIds.length === 0 || isExecuting ? 'none' : '0 4px 12px rgba(255, 107, 107, 0.3)'
                                }
                            }}
                        >
                            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                            Delete
                        </Box>
                    </Stack>
                ) : (
                    <>
                        {/* Search */}
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#000000', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: '1px solid', borderColor: 'primary.main' }
                                }
                            }}
                        />

                        {/* Filter Tabs */}
                        <ToggleButtonGroup
                            value={statusFilter}
                            exclusive
                            onChange={(e, newFilter) => newFilter && onFilterChange(newFilter)}
                            size="small"
                            fullWidth
                            sx={{
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                p: 0.5,
                                borderRadius: '12px',
                                '& .MuiToggleButton-root': {
                                    border: 'none',
                                    borderRadius: '10px',
                                    py: 0.75,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    color: '#9ca3af',
                                    '&.Mui-selected': {
                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2c3e50' : '#fff',
                                        color: 'text.primary',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        '&:hover': {
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#3e5060' : '#f5f5f5',
                                        }
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="all">All</ToggleButton>
                            <ToggleButton value="open">Open</ToggleButton>
                            <ToggleButton value="resolved">Resolved</ToggleButton>
                        </ToggleButtonGroup>
                    </>
                )}
            </Box>

            <List sx={{ flexGrow: 1, overflow: 'auto', px: 1.5 }}>
                {conversations.length === 0 ? (
                    <Box p={4} textAlign="center">
                        <InboxOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                            No conversations found
                        </Typography>
                    </Box>
                ) : (
                    conversations.map((conv) => (
                        <ListItem
                            key={conv._id}
                            disablePadding
                            sx={{ mb: 0.5 }}
                            secondaryAction={
                                isSelectionMode && (
                                    <Checkbox
                                        edge="end"
                                        checked={selectedIds.includes(conv._id)}
                                        onChange={() => toggleSelection(conv._id)}
                                        sx={{
                                            color: 'text.disabled',
                                            '&.Mui-checked': { color: 'primary.main' }
                                        }}
                                    />
                                )
                            }
                        >
                            <ListItemButton
                                selected={selectedId === conv._id && !isSelectionMode}
                                onClick={() => isSelectionMode ? toggleSelection(conv._id) : onSelect(conv)}
                                sx={{
                                    borderRadius: '16px',
                                    py: 1.5,
                                    px: 2,
                                    transition: 'all 0.2s',
                                    '&.Mui-selected': {
                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 107, 107, 0.15)' : 'rgba(255, 107, 107, 0.08)',
                                        '&:hover': {
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 107, 107, 0.25)' : 'rgba(255, 107, 107, 0.12)',
                                        }
                                    },
                                    '&:hover': {
                                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                                    },
                                    pr: isSelectionMode ? 6 : 2 // Add padding for checkbox
                                }}
                            >
                                <ListItemAvatar>
                                    <Badge
                                        badgeContent={conv.unreadCount}
                                        color="error"
                                        invisible={conv.unreadCount === 0 || isSelectionMode}
                                        sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: selectedId === conv._id && !isSelectionMode ? '#ff6b6b' : (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                color: selectedId === conv._id && !isSelectionMode ? '#fff' : 'text.primary',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                border: '2px solid',
                                                borderColor: (theme) => theme.palette.background.paper
                                            }}
                                        >
                                            {conv.contactId?.name?.charAt(0).toUpperCase() || '?'}
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                            <Typography
                                                variant="body2"
                                                fontWeight={conv.unreadCount > 0 ? 700 : 600}
                                                noWrap
                                                sx={{ maxWidth: '65%' }}
                                            >
                                                {conv.contactId?.name || 'Unknown Contact'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#ff6b6b' }}>
                                                {formatTime(conv.lastMessageAt)}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color={conv.unreadCount > 0 ? "text.primary" : "#9ca3af"}
                                                noWrap
                                                fontSize="0.8rem"
                                                fontWeight={conv.unreadCount > 0 ? 500 : 400}
                                                sx={{ mb: 0.5 }}
                                            >
                                                {conv.lastMessage?.content || 'No messages'}
                                            </Typography>

                                            <Box display="flex" gap={0.5} flexWrap="wrap">
                                                {conv.metadata?.gmailThreadId && (
                                                    <Chip
                                                        icon={<EmailOutlinedIcon sx={{ fontSize: 12 }} />}
                                                        label="Gmail"
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}
                                                    />
                                                )}
                                                {conv.status === 'resolved' && (
                                                    <Chip
                                                        icon={<CheckCircleOutlineIcon sx={{ fontSize: 12 }} />}
                                                        label="Resolved"
                                                        size="small"
                                                        color="success"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem', borderRadius: '6px' }}
                                                    />
                                                )}
                                                {conv.automationPaused && (
                                                    <Chip
                                                        icon={<PauseCircleOutlineIcon sx={{ fontSize: 12 }} />}
                                                        label="Paused"
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem', borderRadius: '6px' }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    ))
                )}
            </List>
        </Paper>
    );
}

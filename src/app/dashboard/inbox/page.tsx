'use client';

import { useState } from 'react';
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
    Divider,
    TextField,
    IconButton,
    Chip,
    Stack,
    Grid
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchIcon from '@mui/icons-material/Search';

// Dummy Data
const conversations = [
    { id: 1, name: 'Alice Smith', message: 'Hi, I need to reschedule...', time: '10:30 AM', unread: 2, avatar: '' },
    { id: 2, name: 'Bob Johnson', message: 'Thanks for the appointment!', time: 'Yesterday', unread: 0, avatar: '' },
    { id: 3, name: 'Carol Williams', message: 'Is parking available?', time: 'Mon', unread: 0, avatar: '' },
];

const messages = [
    { id: 1, text: 'Hi Alice, how can I help you today?', sender: 'me', time: '10:00 AM' },
    { id: 2, text: 'Hi, I need to reschedule my appointment for tomorrow.', sender: 'them', time: '10:15 AM' },
    { id: 3, text: 'Sure, let me check our availability.', sender: 'me', time: '10:16 AM' },
];

import RBACGuard from '@/components/dashboard/RBACGuard';

export default function InboxPage() {
    const [selectedId, setSelectedId] = useState(1);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        // Logic to send message would go here
        setInput('');
    };

    return (
        <RBACGuard permission="canViewInbox">
            <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>
                {/* Conversation List Panel */}
                <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%' }}>
                    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box p={2}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search messages..."
                                InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
                            />
                        </Box>
                        <Divider />
                        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                            {conversations.map((conv) => (
                                <ListItem key={conv.id} disablePadding>
                                    <ListItemButton
                                        selected={selectedId === conv.id}
                                        onClick={() => setSelectedId(conv.id)}
                                    >
                                        <ListItemAvatar>
                                            <Avatar alt={conv.name} src={conv.avatar} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography variant="subtitle2" fontWeight={conv.unread ? 'bold' : 'normal'}>
                                                        {conv.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {conv.time}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="body2"
                                                    color="textSecondary"
                                                    noWrap
                                                    fontWeight={conv.unread ? 'bold' : 'normal'}
                                                >
                                                    {conv.message}
                                                </Typography>
                                            }
                                        />
                                        {conv.unread > 0 && (
                                            <Chip label={conv.unread} color="primary" size="small" sx={{ ml: 1, height: 20, minWidth: 20 }} />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Chat Window Panel */}
                <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
                    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Chat Header */}
                        <Box p={2} display="flex" justifyContent="space-between" alignItems="center" borderBottom={1} borderColor="divider">
                            <Box display="flex" alignItems="center" gap={1}>
                                <Avatar src={conversations.find(c => c.id === selectedId)?.avatar} />
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {conversations.find(c => c.id === selectedId)?.name}
                                </Typography>
                            </Box>
                            <IconButton>
                                <MoreVertIcon />
                            </IconButton>
                        </Box>

                        {/* Messages Area */}
                        <Box flexGrow={1} p={2} sx={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {messages.map((msg) => (
                                <Box
                                    key={msg.id}
                                    alignSelf={msg.sender === 'me' ? 'flex-end' : 'flex-start'}
                                    maxWidth="70%"
                                >
                                    <Paper
                                        sx={{
                                            p: 1.5,
                                            bgcolor: msg.sender === 'me' ? 'primary.main' : 'grey.100',
                                            color: msg.sender === 'me' ? 'white' : 'text.primary',
                                            borderRadius: 2
                                        }}
                                    >
                                        <Typography variant="body1">{msg.text}</Typography>
                                    </Paper>
                                    <Typography variant="caption" color="textSecondary" ml={1}>
                                        {msg.time}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Input Area */}
                        <Box p={2} borderTop={1} borderColor="divider">
                            <Stack direction="row" spacing={1}>
                                <IconButton>
                                    <AttachFileIcon />
                                </IconButton>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <IconButton color="primary" onClick={handleSend}>
                                    <SendIcon />
                                </IconButton>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>

                {/* Contact Details Panel */}
                <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%', display: { xs: 'none', md: 'block' } }}>
                    <Paper sx={{ height: '100%', p: 2 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                            <Avatar
                                src={conversations.find(c => c.id === selectedId)?.avatar}
                                sx={{ width: 80, height: 80, mb: 1 }}
                            />
                            <Typography variant="h6">{conversations.find(c => c.id === selectedId)?.name}</Typography>
                            <Typography variant="body2" color="textSecondary">alice@example.com</Typography>
                            <Typography variant="body2" color="textSecondary">+1 (555) 123-4567</Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                        <Stack direction="row" spacing={1} mb={3}>
                            <Chip label="New Client" size="small" color="success" variant="outlined" />
                            <Chip label="High Value" size="small" color="warning" variant="outlined" />
                        </Stack>

                        <Typography variant="subtitle2" gutterBottom>Notes</Typography>
                        <TextField
                            multiline
                            rows={4}
                            fullWidth
                            size="small"
                            placeholder="Add notes..."
                            defaultValue="Prefers morning appointments. Allergic to latex."
                        />
                    </Paper>
                </Grid>
            </Grid>
        </RBACGuard>
    );
}

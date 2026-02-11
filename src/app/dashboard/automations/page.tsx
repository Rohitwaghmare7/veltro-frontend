'use client';

import {
    Box,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
    Divider,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';

const automations = [
    { id: 1, name: 'Welcome Message', trigger: 'New Lead Created', action: 'Send Email', active: true },
    { id: 2, name: 'Booking Confirmation', trigger: 'Booking Created', action: 'Send SMS & Email', active: true },
    { id: 3, name: 'Appointment Reminder', trigger: '24h Before Booking', action: 'Send SMS', active: true },
    { id: 4, name: 'Low Stock Alert', trigger: 'Inventory < Threshold', action: 'Notify Owner', active: false },
];

import RBACGuard from '@/components/dashboard/RBACGuard';

export default function AutomationsPage() {
    return (
        <RBACGuard permission="canManageAutomations">
            <Box maxWidth="800px">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" fontWeight="bold">Automations</Typography>
                    <Button variant="contained" startIcon={<AddIcon />}>
                        New Rule
                    </Button>
                </Box>

                <Paper>
                    <List>
                        {automations.map((rule, index) => (
                            <div key={rule.id}>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6">{rule.name}</Typography>
                                        }
                                        secondary={
                                            <Typography component="span" variant="body2" color="textSecondary">
                                                If <b>{rule.trigger}</b> then <b>{rule.action}</b>
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Switch checked={rule.active} color="primary" />
                                        <IconButton edge="end">
                                            <SettingsIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < automations.length - 1 && <Divider />}
                            </div>
                        ))}
                    </List>
                </Paper>
            </Box>
        </RBACGuard>
    );
}

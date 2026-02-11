'use client';

import { Box, Typography, Button, Card } from '@mui/material';
import { motion } from 'framer-motion';
import InboxIcon from '@mui/icons-material/Inbox';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ContactsIcon from '@mui/icons-material/Contacts';
import DescriptionIcon from '@mui/icons-material/Description';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';

interface EmptyStateProps {
    icon?: 'inbox' | 'calendar' | 'contacts' | 'forms' | 'inventory' | 'team' | 'search';
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

const iconMap = {
    inbox: InboxIcon,
    calendar: CalendarTodayIcon,
    contacts: ContactsIcon,
    forms: DescriptionIcon,
    inventory: InventoryIcon,
    team: PeopleIcon,
    search: SearchIcon,
};

export default function EmptyState({
    icon = 'inbox',
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    const IconComponent = iconMap[icon];

    return (
        <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
                p: 6,
                textAlign: 'center',
                backgroundColor: 'background.paper',
            }}
        >
            <Box
                component={motion.div}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                sx={{
                    display: 'inline-flex',
                    p: 3,
                    borderRadius: '50%',
                    backgroundColor: 'primary.light',
                    color: 'primary.main',
                    mb: 3,
                }}
            >
                <IconComponent sx={{ fontSize: 48 }} />
            </Box>

            <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: 600, color: 'text.primary' }}
            >
                {title}
            </Typography>

            <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}
            >
                {description}
            </Typography>

            {actionLabel && onAction && (
                <Button
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    variant="contained"
                    size="large"
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            )}
        </Card>
    );
}

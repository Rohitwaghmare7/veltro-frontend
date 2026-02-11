'use client';

import { ReactNode } from 'react';
import { Drawer, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedDrawerProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    anchor?: 'left' | 'right' | 'top' | 'bottom';
    width?: number | string;
}

const drawerVariants = {
    right: {
        hidden: { x: '100%' },
        visible: { x: 0 },
        exit: { x: '100%' },
    },
    left: {
        hidden: { x: '-100%' },
        visible: { x: 0 },
        exit: { x: '-100%' },
    },
    top: {
        hidden: { y: '-100%' },
        visible: { y: 0 },
        exit: { y: '-100%' },
    },
    bottom: {
        hidden: { y: '100%' },
        visible: { y: 0 },
        exit: { y: '100%' },
    },
};

export default function AnimatedDrawer({
    open,
    onClose,
    title,
    children,
    anchor = 'right',
    width = 400,
}: AnimatedDrawerProps) {
    return (
        <Drawer
            anchor={anchor}
            open={open}
            onClose={onClose}
            PaperProps={{
                component: motion.div,
                variants: drawerVariants[anchor],
                initial: 'hidden',
                animate: 'visible',
                exit: 'exit',
                transition: { type: 'spring', stiffness: 300, damping: 30 },
                sx: {
                    width: ['top', 'bottom'].includes(anchor) ? '100%' : width,
                    height: ['top', 'bottom'].includes(anchor) ? width : '100%',
                },
            }}
        >
            <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {title && (
                    <Box sx={{ mb: 3, pr: 4 }}>
                        <Typography variant="h6" component="h2" fontWeight={600}>
                            {title}
                        </Typography>
                    </Box>
                )}
                
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {children}
                </Box>
            </Box>
        </Drawer>
    );
}

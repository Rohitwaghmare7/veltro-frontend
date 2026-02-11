'use client';

import { ReactNode } from 'react';
import { Modal, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: 50,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 50,
        transition: {
            duration: 0.2,
        },
    },
};

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const maxWidthMap = {
    xs: 400,
    sm: 600,
    md: 800,
    lg: 1000,
    xl: 1200,
};

export default function AnimatedModal({
    open,
    onClose,
    title,
    children,
    maxWidth = 'sm',
}: AnimatedModalProps) {
    return (
        <AnimatePresence>
            {open && (
                <Modal
                    open={open}
                    onClose={onClose}
                    closeAfterTransition
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    BackdropComponent={motion.div}
                    BackdropProps={{
                        variants: backdropVariants,
                        initial: 'hidden',
                        animate: 'visible',
                        exit: 'exit',
                        style: {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    } as any}
                >
                    <Box
                        component={motion.div}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 24,
                            p: 4,
                            maxWidth: maxWidthMap[maxWidth],
                            width: '90%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            position: 'relative',
                        }}
                    >
                        {title && (
                            <Box sx={{ mb: 3, pr: 4 }}>
                                <Typography variant="h5" component="h2" fontWeight={600}>
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

                        {children}
                    </Box>
                </Modal>
            )}
        </AnimatePresence>
    );
}

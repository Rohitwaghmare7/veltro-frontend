import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import BusinessSelector from './BusinessSelector';
import NotificationMenu from './NotificationMenu';
import ProfileMenu from './ProfileMenu';

interface HeaderProps {
    onDrawerToggle: () => void;
    isCollapsed: boolean;
    sidebarWidth: number;
}

export default function Header({ onDrawerToggle, isCollapsed, sidebarWidth }: HeaderProps) {
    return (
        <AppBar
            position="fixed"
            sx={{
                width: { sm: `calc(100% - ${sidebarWidth}px)` },
                ml: { sm: `${sidebarWidth}px` },
                backgroundColor: '#050505', // Dark background
                color: 'white',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: 'none',
                transition: 'width 0.3s ease, margin 0.3s ease',
            }}
        >
            <Toolbar sx={{ minHeight: '56px !important', px: 2 }}>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' }, color: 'white' }}
                >
                    <MenuIcon />
                </IconButton>

                <BusinessSelector />

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationMenu />

                    <ProfileMenu />
                </Box>
            </Toolbar>
        </AppBar>
    );
}

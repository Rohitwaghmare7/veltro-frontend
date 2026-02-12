import Box from '@mui/material/Box';

interface SplineBackgroundProps {
    scale?: number | string | { xs?: string | number; md?: string | number };
    opacity?: number;
}

const SplineBackground = ({ scale, opacity = 1 }: SplineBackgroundProps) => {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                zIndex: 0,
                opacity: opacity,
                pointerEvents: 'none', // Prevent background from intercepting clicks
            }}
        >
            <Box
                component="iframe"
                src="https://my.spline.design/particles-TFxwERY8AFn6wvIibIFHORf7/"
                frameBorder="0"
                title="Spline 3D Background"
                sx={{
                    border: 'none',
                    width: scale || { xs: '160%', md: '120%' },
                    height: scale ? (typeof scale === 'object' ? '120%' : scale) : '120%',
                    position: 'relative',
                    pointerEvents: 'auto', // Restore mouse reaction (hover effect)
                    userSelect: 'none', // Prevent text/element selection
                    WebkitUserSelect: 'none',
                    msUserSelect: 'none',
                }}
            />
        </Box>
    );
};

export default SplineBackground;

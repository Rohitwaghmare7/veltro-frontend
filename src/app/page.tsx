import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

export default function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
          Next.js + Material UI
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          A clean, light-themed authentication UI using Next.js 15 and Material UI v6.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Link href="/login" passHref>
            <Button variant="contained" size="large">
              Go to Login
            </Button>
          </Link>
          <Link href="/register" passHref>
            <Button variant="outlined" size="large">
              Go to Register
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, CircularProgress, useTheme, useMediaQuery, Typography } from '@mui/material';

export default function AuthLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: '1 1 auto',
          py: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 4 },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: { xs: 3, sm: 4 },
            color: 'primary.main',
            textAlign: 'center',
            fontWeight: 700,
          }}
        >
          Hệ thống quản lý trang phục
        </Typography>

        <Box
          sx={{
            width: '100%',
            maxWidth: isMobile ? '100%' : 480,
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: { xs: 3, sm: 4 },
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Suspense
            fallback={
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 300,
                }}
              >
                <CircularProgress />
              </Box>
            }
          >
            <Outlet />
          </Suspense>
        </Box>
      </Container>
    </Box>
  );
} 
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Grid,
  Stack,
  alpha,
  Link,
  Divider,
} from '@mui/material';
import {
  Checkroom as CheckroomIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  MobileFriendly as MobileFriendlyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Features for the sidebar
  const features = [
    {
      icon: <CheckroomIcon color="primary" fontSize="large" />,
      title: 'Quản lý trang phục',
      description: 'Theo dõi tất cả trang phục cho thuê và tình trạng'
    },
    {
      icon: <SecurityIcon color="info" fontSize="large" />,
      title: 'Bảo mật cao cấp',
      description: 'Bảo vệ dữ liệu khách hàng và thông tin kinh doanh'
    },
    {
      icon: <SpeedIcon color="success" fontSize="large" />,
      title: 'Hiệu suất thời gian thực',
      description: 'Phân tích kinh doanh nhanh chóng và chính xác'
    },
    {
      icon: <MobileFriendlyIcon color="warning" fontSize="large" />,
      title: 'Tương thích di động',
      description: 'Truy cập từ mọi thiết bị, bất kỳ đâu'
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
      }}
    >
      {/* Background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.4,
          backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.3)} 2px, transparent 2px)`,
          backgroundSize: '30px 30px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Logo and top bar */}
      <Box
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <CheckroomIcon
          sx={{
            mr: 1,
            fontSize: 32,
            color: theme.palette.primary.main,
          }}
        />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px',
          }}
        >
          CONSOLE ERP
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3} alignItems="center" justifyContent="center">
          {/* Left side - for non-mobile view */}
          {!isMobile && (
            <Grid item xs={12} md={6} lg={7} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
              <Box sx={{ pr: isTablet ? 2 : 8 }}>
                <motion.div variants={itemVariants}>
                  <Typography
                    variant="h4"
                    gutterBottom
                    fontWeight="bold"
                    sx={{
                      mb: 3,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Hệ Thống Quản Lý Cho Thuê Trang Phục
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 4,
                      color: theme.palette.text.secondary,
                      maxWidth: '90%',
                    }}
                  >
                    Giải pháp ERP chuyên nghiệp cho doanh nghiệp cho thuê trang phục, giúp bạn theo dõi hàng tồn kho, quản lý đơn hàng và tối ưu hóa vận hành kinh doanh.
                  </Typography>
                </motion.div>

                <Stack spacing={3} component={motion.div} variants={containerVariants}>
                  {features.map((feature, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          p: 1.5,
                          borderRadius: 2,
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            transform: 'translateX(5px)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                          }
                        }}
                      >
                        <Box sx={{ mr: 2 }}>{feature.icon}</Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              </Box>
            </Grid>
          )}

          {/* Right side - Auth form */}
          <Grid item xs={12} md={6} lg={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: isMobile ? 0 : 0.4 }}
            >
              <Paper
                elevation={12}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  background: alpha(theme.palette.background.paper, 0.8),
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Decorative element */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                />

                <Box
                  textAlign="center"
                  mb={4}
                  component={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {window.location.pathname.includes('/login') ? 'Đăng Nhập' :
                      window.location.pathname.includes('/register') ? 'Đăng Ký' : 'Xác Thực'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {window.location.pathname.includes('/login') ? 'Đăng nhập để quản lý hệ thống' :
                      window.location.pathname.includes('/register') ? 'Tạo tài khoản mới' :
                        'Hoàn thành xác thực để tiếp tục'}
                  </Typography>
                </Box>

                {children}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        sx={{
          py: 2,
          px: 3,
          mt: 4,
          textAlign: 'center',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          &copy; {new Date().getFullYear()} Costume ERP. Hệ thống quản lý cho thuê trang phục |
          <Link href="#" underline="hover" sx={{ ml: 1 }}>Điều khoản sử dụng</Link> |
          <Link href="#" underline="hover" sx={{ ml: 1 }}>Chính sách bảo mật</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLayout; 
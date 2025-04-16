import React from 'react';
import {
  Box,
  Card,
  Stack,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { showToast } from '@/components/common/Toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';

interface LoginFormInputs {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
}).required();

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: LoginFormInputs) => {
    // TODO: Replace with actual API call
    // Simulating successful login
    localStorage.setItem('token', 'dummy-token');
    showToast.success('Đăng nhập thành công!');
    navigate('/dashboard');
  };

  // If already logged in, redirect to dashboard
  if (localStorage.getItem('token')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(45deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )}, ${alpha(theme.palette.primary.light, 0.1)})`,
        p: 3,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        <Card
          sx={{
            p: 4,
            backdropFilter: 'blur(6px)',
            bgcolor: alpha(theme.palette.background.paper, 0.9),
          }}
        >
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Chào mừng trở lại!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đăng nhập để tiếp tục quản lý hệ thống
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
                  height: 48,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 20px ${alpha(
                      theme.palette.primary.main,
                      0.28
                    )}`,
                  },
                }}
              >
                Đăng nhập
              </Button>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ my: 2 }}
              >
                <Link
                  to="/auth/forgot-password"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                  }}
                >
                  <Typography variant="body2">Quên mật khẩu?</Typography>
                </Link>
                <Link
                  to="/auth/register"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                  }}
                >
                  <Typography variant="body2">Tạo tài khoản mới</Typography>
                </Link>
              </Stack>
            </Stack>
          </form>
        </Card>
      </motion.div>
    </Box>
  );
};

export default LoginPage; 
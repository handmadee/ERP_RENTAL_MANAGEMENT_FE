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
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { showToast } from '@/components/common/Toast';
import { Link, useNavigate } from 'react-router-dom';

interface RegisterFormInputs {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const schema = yup.object({
  fullName: yup
    .string()
    .required('Họ tên là bắt buộc')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: yup
    .string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp'),
}).required();

const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: RegisterFormInputs) => {
    console.log(data);
    showToast.success('Đăng ký thành công!');
    navigate('/dashboard');
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

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
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
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
              Tạo tài khoản mới
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đăng ký để trải nghiệm dịch vụ của chúng tôi
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Họ tên"
                {...register('fullName')}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
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

              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                Đăng ký
              </Button>

              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ my: 2 }}
              >
                <Divider sx={{ flex: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  HOẶC
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Stack>

              <Link
                to="/auth/login"
                style={{
                  textDecoration: 'none',
                  alignSelf: 'center',
                }}
              >
                <Button
                  startIcon={<ArrowBack />}
                  sx={{
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  Quay lại đăng nhập
                </Button>
              </Link>
            </Stack>
          </form>
        </Card>
      </motion.div>
    </Box>
  );
};

export default RegisterPage; 
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Link,
  Stack,
  Divider,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, Google } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';

interface LoginFormInputs {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setError('');
    try {
      // TODO: Implement login logic here
      console.log(data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 4, textAlign: 'center' }}>
        Đăng nhập
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email')}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            fullWidth
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
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
                borderRadius: 2,
              },
            }}
          />

          <Box sx={{ textAlign: 'right' }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              color="primary"
              underline="hover"
            >
              Quên mật khẩu?
            </Link>
          </Box>

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isLoading}
            sx={{
              mt: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Đăng nhập
          </LoadingButton>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              HOẶC
            </Typography>
          </Divider>

          <Button
            fullWidth
            size="large"
            variant="outlined"
            startIcon={<Google />}
            sx={{
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'background.default',
              },
            }}
          >
            Đăng nhập với Google
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Chưa có tài khoản?{' '}
            <Link
              component={RouterLink}
              to="/register"
              variant="subtitle2"
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              Đăng ký ngay
            </Link>
          </Typography>
        </Stack>
      </form>
    </Box>
  );
};

export default LoginPage; 
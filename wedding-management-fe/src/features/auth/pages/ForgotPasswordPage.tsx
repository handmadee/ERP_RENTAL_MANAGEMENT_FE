import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Link,
  Stack,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';

interface ForgotPasswordFormInputs {
  email: string;
}


const schema = yup.object().shape({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
});

const ForgotPasswordPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    setIsLoading(true);
    try {
      // TODO: Implement forgot password logic here
      console.log(data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setIsSuccess(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        p: isMobile ? 2 : 3,
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 1,
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Quên mật khẩu?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nhập email của bạn để đặt lại mật khẩu
        </Typography>
      </Box>

      {isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
          Vui lòng kiểm tra hộp thư đến.
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

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isLoading}
            sx={{
              borderRadius: 2,
              py: 1.2,
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Gửi yêu cầu
          </LoadingButton>

          <Typography variant="body2" align="center">
            Nhớ mật khẩu?{' '}
            <Link
              component={RouterLink}
              to="/login"
              variant="subtitle2"
              underline="hover"
            >
              Quay lại đăng nhập
            </Link>
          </Typography>
        </Stack>
      </form>
    </Box>
  );
};

export default ForgotPasswordPage; 
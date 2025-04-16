import React from 'react';
import {
  Box,
  Card,
  Stack,
  TextField,
  Button,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { showToast } from '@/components/common/Toast';
import { Link } from 'react-router-dom';
import { ArrowBack, Email } from '@mui/icons-material';

interface ForgotPasswordFormInputs {
  email: string;
}

const schema = yup.object({
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
}).required();

const ForgotPasswordPage: React.FC = () => {
  const theme = useTheme();
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormInputs>({
    resolver: yupResolver(schema),
  });

  const email = watch('email');

  const onSubmit = (data: ForgotPasswordFormInputs) => {
    console.log(data);
    setSubmitted(true);
    showToast.success('Đã gửi email khôi phục mật khẩu!');
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
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box textAlign="center" sx={{ py: 4 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <Email
                    sx={{
                      fontSize: 64,
                      color: theme.palette.primary.main,
                      mb: 2,
                    }}
                  />
                </motion.div>
                <Typography variant="h5" gutterBottom>
                  Kiểm tra email của bạn
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Chúng tôi đã gửi liên kết khôi phục mật khẩu đến
                  <br />
                  <strong>{email}</strong>
                </Typography>
                <Link
                  to="/auth/login"
                  style={{
                    textDecoration: 'none',
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
              </Box>
            </motion.div>
          ) : (
            <>
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
                  Quên mật khẩu?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nhập email của bạn và chúng tôi sẽ gửi liên kết khôi phục mật khẩu
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

                  <Button
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    sx={{
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                      boxShadow: `0 8px 16px ${alpha(
                        theme.palette.primary.main,
                        0.24
                      )}`,
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
                    Gửi liên kết khôi phục
                  </Button>

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
            </>
          )}
        </Card>
      </motion.div>
    </Box>
  );
};

export default ForgotPasswordPage; 
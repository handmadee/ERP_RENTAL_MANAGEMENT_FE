import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  AlertTitle,
  Collapse,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  MailOutline,
  ErrorOutline,
  InfoOutlined,
  SecurityOutlined,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { showToast } from '@/components/common/Toast';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';

const MAX_LOGIN_ATTEMPTS = 5;
// Lockout duration in milliseconds (2 minutes)
const LOCKOUT_DURATION = 2 * 60 * 1000;

interface LoginFormInputs {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup
    .string()
    .required('Email/username là bắt buộc')
    .trim(),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
}).required();

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    getValues,
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  // Instead of early return with Navigate, use state to control redirection
  useEffect(() => {
    if (authService.isAuthenticated(true)) {
      setShouldRedirect(true);
    }
  }, []);

  // Check for redirect message from other pages
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get('message');

    if (message) {
      setSecurityMessage(message);

      // Clear any existing login attempts after logout
      if (message.includes('đăng xuất')) {
        setLoginAttempts(0);
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutUntil');
      }

      // Remove the message from URL without refreshing
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  useEffect(() => {
    if (!lockoutUntil) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now >= lockoutUntil) {
        setLockoutUntil(null);
        setLoginAttempts(0);
        clearInterval(intervalId);
      } else {
        setTimeRemaining(Math.ceil((lockoutUntil - now) / 1000));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lockoutUntil]);

  // Load previous login attempts from localStorage
  useEffect(() => {
    const storedAttempts = localStorage.getItem('loginAttempts');
    const storedLockout = localStorage.getItem('lockoutUntil');

    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10));
    }

    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout, 10);
      if (Date.now() < lockoutTime) {
        setLockoutUntil(lockoutTime);
      } else {
        // Reset if lockout has expired
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutUntil');
      }
    }
  }, []);

  // If authenticated but not admin, show error and logout
  useEffect(() => {
    if (authService.isAuthenticated() && !authService.isAdmin()) {
      // Logout with reason, which will clean all tokens and data
      authService.logout('unauthorized_role_access');

      // Show explanatory message to the user
      setSecurityMessage('Chỉ tài khoản quản trị viên mới có thể truy cập hệ thống này. Bạn đã được đăng xuất.');
    }
  }, []);

  // Update the onSubmit function to handle 401 errors properly
  const onSubmit = async (data: LoginFormInputs) => {
    // Check if account is locked
    if (lockoutUntil && Date.now() < lockoutUntil) {
      return;
    }

    setLoginError(null);

    try {
      setIsLoading(true);

      // Trim input values
      const email = data.email.trim();
      const password = data.password;

      const response = await authService.login(email, password);

      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }

      // Check user role - only allow "admin" role
      if (response.user.role !== 'admin') {
        // Clear the password but keep the email for user convenience
        reset({ ...data, password: '' });

        // Show detailed error with user's name
        setLoginError(`Tài khoản "${response.user.fullName}" không có quyền truy cập vào hệ thống quản trị. Chỉ quản trị viên mới có thể đăng nhập.`);

        // Properly clean all tokens and session data
        authService.clearAllUserData();

        // Log the denied access attempt
        console.warn(`Access denied: User ${response.user.email} (${response.user.role}) attempted to access admin area`);

        // Increment login attempts on permission failure
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());

        // Check if account should be locked
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_DURATION;
          setLockoutUntil(lockTime);
          localStorage.setItem('lockoutUntil', lockTime.toString());
        }

        return;
      }

      // Save auth data and redirect
      authService.saveTokens(response.accessToken, response.refreshToken);
      authService.saveUser(response.user);

      // Also store the last login time - fix Date type error
      const lastLoginTime = response.user.lastLogin
        ? (typeof response.user.lastLogin === 'string'
          ? response.user.lastLogin
          : new Date(response.user.lastLogin).toISOString())
        : new Date().toISOString();

      localStorage.setItem('lastLoginTime', lastLoginTime);

      // Reset login attempts on successful login
      setLoginAttempts(0);
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('lockoutUntil');

      showToast.success(`Xin chào, ${response.user.fullName}! Đăng nhập thành công.`);
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Login error:', error);

      // Extract error message from response
      const errorResponse = error?.response?.data;
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại sau.';

      // Save error details for display
      setErrorDetails(errorResponse);

      // Increment login attempts count for security
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // Use the enhanced method to handle failed login and clean up tokens
      authService.handleFailedLogin(errorResponse, newAttempts);

      // Handle different error types with detailed error messages
      if (error?.response?.status === 401) {
        // Use the server's message if available
        errorMessage = errorResponse?.message || 'Email hoặc mật khẩu không chính xác';
        setLoginError(errorMessage);
        setError('password', { message: 'Mật khẩu không chính xác' });
      } else if (error?.response?.status === 403) {
        errorMessage = errorResponse?.message || 'Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập';
        setLoginError(errorMessage);
      } else {
        // For other errors, try to extract as much information as possible
        if (errorResponse) {
          errorMessage = errorResponse.message || errorResponse.error || errorMessage;

          // If there's additional context in the error response, add it
          if (errorResponse.error && errorResponse.message && errorResponse.error !== errorResponse.message) {
            errorMessage = `${errorResponse.message} (${errorResponse.error})`;
          }
        }
        setLoginError(errorMessage);
      }

      // Check if account should be locked
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockTime = Date.now() + LOCKOUT_DURATION;
        setLockoutUntil(lockTime);
        localStorage.setItem('lockoutUntil', lockTime.toString());
      }

      // Reset only password field
      reset({ ...getValues(), password: '' });

    } finally {
      setIsLoading(false);
    }
  };

  // Handle redirecting to dashboard if already authenticated
  if (shouldRedirect) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(45deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )}, ${alpha(theme.palette.primary.light, 0.1)})`,
        p: 3,
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          opacity: 0.4,
          backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.15)} 2px, transparent 2px)`,
          backgroundSize: '30px 30px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
      >
        <Card
          elevation={24}
          sx={{
            p: { xs: 3, sm: 4 },
            backdropFilter: 'blur(6px)',
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            borderRadius: 2,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
            overflow: 'hidden',
          }}
        >
          {isLoading && (
            <LinearProgress
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                zIndex: 10,
              }}
            />
          )}
          <Box textAlign="center" mb={4}>
            {/* ... existing header content ... */}
          </Box>

          {securityMessage && (
            <Collapse in={!!securityMessage}>
              <Alert
                severity={
                  securityMessage.includes('thành công') ? 'success' :
                    securityMessage.includes('lỗi') ? 'warning' : 'info'
                }
                sx={{ mb: 3 }}
                onClose={() => setSecurityMessage(null)}
              >
                <AlertTitle>
                  {securityMessage.includes('thành công') ? 'Thành công' :
                    securityMessage.includes('lỗi') ? 'Cảnh báo' : 'Thông báo'}
                </AlertTitle>
                {securityMessage}
              </Alert>
            </Collapse>
          )}

          {loginError && (
            <Collapse in={!!loginError}>
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => {
                  setLoginError(null);
                  setErrorDetails(null);
                }}
              >
                <AlertTitle>Lỗi đăng nhập</AlertTitle>
                <Box sx={{ fontSize: '0.875rem' }}>
                  {loginError}

                  {/* Display error timestamp if available */}
                  {errorDetails?.timestamp && (
                    <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
                      Thời gian: {new Date(errorDetails.timestamp).toLocaleString('vi-VN')}
                    </Typography>
                  )}

                  {/* Display correlation ID for debugging if available */}
                  {errorDetails?.correlationId && (
                    <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                      Mã tham chiếu: {errorDetails.correlationId}
                    </Typography>
                  )}
                </Box>
              </Alert>
            </Collapse>
          )}

          {/* Show lockout warning */}
          {loginAttempts > 0 && loginAttempts < MAX_LOGIN_ATTEMPTS && (
            <Alert
              severity="warning"
              icon={<InfoOutlined />}
              sx={{ mb: 3 }}
            >
              <AlertTitle>Cảnh báo bảo mật</AlertTitle>
              Bạn đã thử đăng nhập không thành công {loginAttempts} lần. Tài khoản sẽ tạm thời bị khóa sau {MAX_LOGIN_ATTEMPTS} lần thử thất bại.
            </Alert>
          )}

          {/* Account locked information */}
          {lockoutUntil && Date.now() < lockoutUntil && (
            <Alert
              severity="error"
              icon={<SecurityOutlined />}
              sx={{ mb: 3 }}
            >
              <AlertTitle>Tài khoản tạm khóa</AlertTitle>
              Tài khoản đã tạm thời bị khóa do nhiều lần đăng nhập thất bại. Vui lòng thử lại sau {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}.
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email / Tên đăng nhập"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isLoading || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={isLoading || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
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
                disabled={isLoading || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
                  height: 48,
                  borderRadius: 1.5,
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
                {isLoading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} color="inherit" />
                    <span>Đang xử lý...</span>
                  </Stack>
                ) : lockoutUntil && Date.now() < lockoutUntil ? (
                  'Tài khoản đang bị khóa'
                ) : (
                  'Đăng Nhập'
                )}
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  hoặc
                </Typography>
              </Divider>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 1 }}
              >
                <Link
                  to="/auth/forgot-password"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: theme.palette.primary.dark,
                      }
                    }}
                  >
                    <ErrorOutline fontSize="small" />
                    Quên mật khẩu?
                  </Typography>
                </Link>

                <Link
                  to="/auth/register"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: theme.palette.primary.dark,
                      }
                    }}
                  >
                    Tạo tài khoản mới
                  </Typography>
                </Link>
              </Stack>
            </Stack>
          </form>

          <Paper
            elevation={0}
            sx={{
              mt: 4,
              p: 2,
              bgcolor: alpha(theme.palette.info.main, 0.08),
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              <InfoOutlined sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
              Đây là trang đăng nhập dành riêng cho quản trị viên. Nếu bạn là khách hàng,
              vui lòng truy cập <Link to="/" style={{ color: theme.palette.primary.main }}>trang chủ</Link>.
            </Typography>
          </Paper>
        </Card>
      </motion.div>
    </Box>
  );
};

export default LoginPage; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  Typography,
  Tab,
  Tabs,
  Switch,
  Divider,
  Avatar,
  styled,
  useTheme,
  alpha,
  CircularProgress,
  MenuItem,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Facebook,
  Instagram,
  YouTube,
  Twitter,
  LinkedIn,
  AccountBalance,
  Notifications,
  Security,
  Language,
  PhotoCamera,
  ContentCopy,
  Edit,
  Add,
  Save,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showToast } from '@/components/common/Toast';
import { authService, Settings, NotificationSettings } from '@/services/authService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ProfileFormValues {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}

interface CompanyFormValues {
  companyName: string;
  currency: string;
  language: string;
  registrationSecret: string;
}

const profileValidationSchema = Yup.object({
  fullName: Yup.string().required('Họ tên là bắt buộc'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  phone: Yup.string().required('Số điện thoại là bắt buộc'),
  address: Yup.string().required('Địa chỉ là bắt buộc'),
});

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string().required('Mật khẩu hiện tại là bắt buộc'),
  newPassword: Yup.string()
    .required('Mật khẩu mới là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: Yup.string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([Yup.ref('newPassword')], 'Mật khẩu không khớp'),
});

const companyValidationSchema = Yup.object({
  companyName: Yup.string().required('Tên công ty là bắt buộc'),
  currency: Yup.string().required('Tiền tệ là bắt buộc'),
  language: Yup.string().required('Ngôn ngữ là bắt buộc'),
  registrationSecret: Yup.string().required('Mã bảo mật là bắt buộc'),
});

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [lastLoginTime, setLastLoginTime] = useState<Date | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileFormik = useFormik<ProfileFormValues>({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      avatar: '',
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        await authService.updateProfile({
          fullName: values.fullName,
          phone: values.phone,
          address: values.address,
        });
        showToast.success('Cập nhật thông tin thành công!');
      } catch (error: any) {
        showToast.error(error?.response?.data?.message || 'Cập nhật thất bại');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsPasswordLoading(true);
        await authService.updatePasswordInSettings({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        showToast.success('Đổi mật khẩu thành công!');
        passwordFormik.resetForm();
      } catch (error: any) {
        showToast.error(error?.response?.data?.message || 'Đổi mật khẩu thất bại');
      } finally {
        setIsPasswordLoading(false);
      }
    },
  });

  const companyFormik = useFormik<CompanyFormValues>({
    initialValues: {
      companyName: '',
      currency: 'VND',
      language: 'vi',
      registrationSecret: '',
    },
    validationSchema: companyValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const updatedSettings = await authService.updateSettings({
          ...values,
          email: profileFormik.values.email,
          phone: profileFormik.values.phone || '',
          address: profileFormik.values.address || '',
          twoFactorEnabled: settings?.security?.twoFactorEnabled || false,
          notifications: notifications
        });
        setSettings(updatedSettings);
        showToast.success('Cập nhật thông tin công ty thành công!');
      } catch (error: any) {
        showToast.error(error?.response?.data?.message || 'Cập nhật thất bại');
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsData, profile] = await Promise.all([
          authService.getSettings(),
          authService.getProfile(),
        ]);

        setSettings(settingsData);
        setNotifications(settingsData.notifications);
        if (profile.lastLogin) {
          const lastLoginDate = new Date(profile.lastLogin);
          if (!isNaN(lastLoginDate.getTime())) {
            setLastLoginTime(lastLoginDate);
          }
        }

        // Set company form values
        companyFormik.setValues({
          companyName: settingsData.companyName || '',
          currency: settingsData.currency || 'VND',
          language: settingsData.language || 'vi',
          registrationSecret: settingsData.registrationSecret || '',
        });

        // Set profile form values
        profileFormik.setValues({
          fullName: profile.fullName || '',
          email: settingsData.email || profile.email || '',
          phone: settingsData.phone || profile.phone || '',
          address: settingsData.address || profile.address || '',
          avatar: profile.avatar || '',
        });

      } catch (error) {
        console.error('Failed to load data:', error);
        showToast.error('Không thể tải thông tin cài đặt');
      }
    };
    loadData();
  }, []);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setAvatarLoading(true);
      const result = await authService.uploadAvatar(file);
      await authService.updateProfile({
        fullName: profileFormik.values.fullName,
        phone: profileFormik.values.phone,
        address: profileFormik.values.address,
        avatar: result.avatarUrl,
      });
      profileFormik.setFieldValue('avatar', result.avatarUrl);
      showToast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error: any) {
      showToast.error(error?.response?.data?.message || 'Cập nhật ảnh đại diện thất bại');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleNotificationChange = async (type: keyof NotificationSettings) => {
    try {
      const newNotifications = {
        ...notifications,
        [type]: !notifications[type],
      };
      setNotifications(newNotifications);

      // Include all required fields when updating settings
      await authService.updateSettings({
        companyName: companyFormik.values.companyName,
        email: profileFormik.values.email,
        phone: profileFormik.values.phone || '',
        address: profileFormik.values.address || '',
        currency: companyFormik.values.currency,
        language: companyFormik.values.language,
        registrationSecret: companyFormik.values.registrationSecret,
        twoFactorEnabled: settings?.twoFactorEnabled || false,
        notifications: newNotifications
      });
    } catch (error: any) {
      showToast.error('Không thể cập nhật cài đặt thông báo');
      // Revert the change on error
      setNotifications(notifications);
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
            Cài đặt hệ thống
          </Typography>
          {lastLoginTime && (
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
              Đăng nhập lần cuối: {format(lastLoginTime, 'HH:mm - dd/MM/yyyy', { locale: vi })}
            </Typography>
          )}
        </Box>

        <Card sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              px: 3,
              pt: 2,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
              },
            }}
          >
            <Tab
              icon={<AccountBalance sx={{ fontSize: '1.25rem' }} />}
              iconPosition="start"
              label="Thông tin ứng dụng"
            />
            <Tab
              icon={<Security sx={{ fontSize: '1.25rem' }} />}
              iconPosition="start"
              label="Bảo mật"
            />
            <Tab
              icon={<Notifications sx={{ fontSize: '1.25rem' }} />}
              iconPosition="start"
              label="Thông báo"
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box
              component="form"
              onSubmit={companyFormik.handleSubmit}
              sx={{ p: 3 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tên ứng dụng"
                    name="companyName"
                    value={companyFormik.values.companyName}
                    onChange={companyFormik.handleChange}
                    error={companyFormik.touched.companyName && Boolean(companyFormik.errors.companyName)}
                    helperText={companyFormik.touched.companyName && companyFormik.errors.companyName}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email hệ thống"
                    name="email"
                    value={profileFormik.values.email}
                    onChange={(e) => {
                      profileFormik.setFieldValue('email', e.target.value);
                    }}
                    error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                    helperText={profileFormik.touched.email && profileFormik.errors.email}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại hệ thống"
                    name="phone"
                    value={profileFormik.values.phone}
                    onChange={(e) => {
                      profileFormik.setFieldValue('phone', e.target.value);
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Địa chỉ hệ thống"
                    name="address"
                    value={profileFormik.values.address}
                    onChange={(e) => {
                      profileFormik.setFieldValue('address', e.target.value);
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mã bảo mật đăng ký"
                    name="registrationSecret"
                    value={companyFormik.values.registrationSecret}
                    onChange={companyFormik.handleChange}
                    error={companyFormik.touched.registrationSecret && Boolean(companyFormik.errors.registrationSecret)}
                    helperText={
                      (companyFormik.touched.registrationSecret && companyFormik.errors.registrationSecret) ||
                      'Mã này sẽ được yêu cầu khi đăng ký tài khoản mới'
                    }
                    InputProps={{
                      endAdornment: (
                        <Button
                          size="small"
                          onClick={() => {
                            const newSecret = Math.random().toString(36).substring(2, 15).toUpperCase();
                            companyFormik.setFieldValue('registrationSecret', newSecret);
                          }}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          Tạo mã mới
                        </Button>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Tiền tệ"
                    name="currency"
                    value={companyFormik.values.currency}
                    onChange={companyFormik.handleChange}
                  >
                    <MenuItem value="VND">VND - Việt Nam Đồng</MenuItem>
                    <MenuItem value="USD">USD - US Dollar</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Ngôn ngữ"
                    name="language"
                    value={companyFormik.values.language}
                    onChange={companyFormik.handleChange}
                  >
                    <MenuItem value="vi">Tiếng Việt</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                  disabled={isLoading}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
                  }}
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box
              component="form"
              onSubmit={passwordFormik.handleSubmit}
              sx={{ p: 3 }}
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Cài đặt bảo mật
              </Typography>

              <Card
                sx={{
                  p: 2,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="subtitle1">Xác thực hai yếu tố</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bật xác thực hai yếu tố để tăng cường bảo mật
                  </Typography>
                </Box>
                <Switch
                  checked={settings?.twoFactorEnabled || false}
                  onChange={(e) => {
                    if (settings) {
                      const newTwoFactorEnabled = e.target.checked;
                      setSettings({ ...settings, twoFactorEnabled: newTwoFactorEnabled });

                      // Include all required fields when updating settings
                      authService.updateSettings({
                        companyName: companyFormik.values.companyName,
                        email: profileFormik.values.email,
                        phone: profileFormik.values.phone || '',
                        address: profileFormik.values.address || '',
                        currency: companyFormik.values.currency,
                        language: companyFormik.values.language,
                        registrationSecret: companyFormik.values.registrationSecret,
                        twoFactorEnabled: newTwoFactorEnabled,
                        notifications: notifications
                      });
                    }
                  }}
                />
              </Card>

              <Typography variant="h6" sx={{ mb: 3, mt: 4 }}>
                Đổi mật khẩu
              </Typography>

              <Card sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mật khẩu hiện tại"
                      name="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordFormik.values.currentPassword}
                      onChange={passwordFormik.handleChange}
                      error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                      helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              edge="end"
                            >
                              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mật khẩu mới"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordFormik.values.newPassword}
                      onChange={passwordFormik.handleChange}
                      error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                      helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nhập lại mật khẩu mới"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                      helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>

                <Box mt={3} display="flex" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isPasswordLoading ? <CircularProgress size={20} /> : <Save />}
                    disabled={isPasswordLoading}
                    sx={{
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                      boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
                    }}
                  >
                    {isPasswordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </Button>
                </Box>
              </Card>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Cài đặt thông báo
              </Typography>

              <Stack spacing={2}>
                <Card
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">Thông báo Email</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nhận thông báo qua email
                    </Typography>
                  </Box>
                  <Switch
                    checked={notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                </Card>

                <Card
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">Thông báo đẩy</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nhận thông báo trên trình duyệt
                    </Typography>
                  </Box>
                  <Switch
                    checked={notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                </Card>

                <Card
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">Thông báo SMS</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Nhận thông báo qua tin nhắn
                    </Typography>
                  </Box>
                  <Switch
                    checked={notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                </Card>
              </Stack>
            </Box>
          </TabPanel>
        </Card>
      </motion.div>
    </Box>
  );
};

export default SettingsPage; 
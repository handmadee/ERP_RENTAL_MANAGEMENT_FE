import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';

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

const validationSchema = Yup.object({
  companyName: Yup.string().required('Tên công ty là bắt buộc'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  phone: Yup.string().required('Số điện thoại là bắt buộc'),
  address: Yup.string().required('Địa chỉ là bắt buộc'),
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
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  const formik = useFormik({
    initialValues: {
      companyName: 'Wedding Management',
      email: 'contact@weddingmanagement.com',
      phone: '+84 123 456 789',
      address: '123 Wedding Street, City, Country',
      currency: 'VND',
      language: 'vi',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
      // Handle form submission
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ mb: 4, color: theme.palette.text.primary }}>
          Cài đặt hệ thống
        </Typography>

        <Card sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
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
              label="Thông tin doanh nghiệp"
            />
            <Tab
              icon={<Notifications sx={{ fontSize: '1.25rem' }} />}
              iconPosition="start"
              label="Thông báo"
            />
            <Tab
              icon={<Security sx={{ fontSize: '1.25rem' }} />}
              iconPosition="start"
              label="Bảo mật"
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              sx={{ p: 3 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src="/path/to/logo.png"
                      sx={{ width: 64, height: 64 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Logo công ty
                      </Typography>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<PhotoCamera />}
                        size="small"
                      >
                        Tải lên
                        <VisuallyHiddenInput type="file" />
                      </Button>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tên công ty"
                    name="companyName"
                    value={formik.values.companyName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.companyName &&
                      Boolean(formik.errors.companyName)
                    }
                    helperText={
                      formik.touched.companyName && formik.errors.companyName
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Tiền tệ"
                    name="currency"
                    value={formik.values.currency}
                    onChange={formik.handleChange}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="VND">VND - Việt Nam Đồng</option>
                    <option value="USD">USD - US Dollar</option>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Ngôn ngữ"
                    name="language"
                    value={formik.values.language}
                    onChange={formik.handleChange}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </TextField>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
                  }}
                >
                  Lưu thay đổi
                </Button>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
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
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        email: e.target.checked,
                      })
                    }
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
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        push: e.target.checked,
                      })
                    }
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
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        sms: e.target.checked,
                      })
                    }
                  />
                </Card>
              </Stack>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Cài đặt bảo mật
              </Typography>

              <Stack spacing={3}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Đổi mật khẩu
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Mật khẩu mới"
                        name="newPassword"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                    >
                      Cập nhật mật khẩu
                    </Button>
                  </Box>
                </Card>

                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Xác thực hai yếu tố
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Bảo vệ tài khoản của bạn bằng xác thực hai yếu tố
                  </Typography>
                  <Button variant="outlined" color="primary">
                    Thiết lập 2FA
                  </Button>
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
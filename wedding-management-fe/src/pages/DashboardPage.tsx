import React from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  useTheme,
  alpha,
  Stack,
  LinearProgress,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Inventory,
  AttachMoney,
  MoreVert,
  ArrowForward,
  CalendarToday,
  ShoppingBag,
  Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: 'T1', value: 85 },
  { month: 'T2', value: 92 },
  { month: 'T3', value: 78 },
  { month: 'T4', value: 95 },
  { month: 'T5', value: 88 },
  { month: 'T6', value: 98 },
];

const DashboardPage: React.FC = () => {
  const theme = useTheme();

  const stats = [
    {
      title: 'Tổng doanh thu',
      value: '125.000.000 ₫',
      icon: <AttachMoney />,
      color: theme.palette.primary.main,
      trend: '+15%',
      trendUp: true,
      description: 'So với tháng trước',
    },
    {
      title: 'Đơn hàng mới',
      value: '48',
      icon: <ShoppingBag />,
      color: theme.palette.info.main,
      trend: '+12%',
      trendUp: true,
      description: '24 đơn chờ xử lý',
    },
    {
      title: 'Khách hàng',
      value: '2,149',
      icon: <People />,
      color: theme.palette.warning.main,
      trend: '+8%',
      trendUp: true,
      description: '149 khách mới',
    },
    {
      title: 'Trang phục có sẵn',
      value: '186',
      icon: <Inventory />,
      color: theme.palette.error.main,
      trend: '-2%',
      trendUp: false,
      description: '12 đang được thuê',
    },
  ];

  const recentOrders = [
    {
      id: 'ORD-2023001',
      customer: 'Nguyễn Văn A',
      date: '01/12/2023',
      amount: '4.990.000 ₫',
      status: 'Hoàn thành',
    },
    {
      id: 'ORD-2023002',
      customer: 'Trần Thị B',
      date: '02/12/2023',
      amount: '2.990.000 ₫',
      status: 'Đang xử lý',
    },
    {
      id: 'ORD-2023003',
      customer: 'Lê Văn C',
      date: '03/12/2023',
      amount: '3.490.000 ₫',
      status: 'Chờ thanh toán',
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Tiệc cưới Anh Tuấn & Ngọc Anh',
      date: '15/12/2023',
      time: '18:00',
      location: 'White Palace Convention Center',
    },
    {
      id: 2,
      title: 'Chụp ảnh cưới Minh Khang & Thùy Linh',
      date: '18/12/2023',
      time: '08:00',
      location: 'Studio ABC',
    },
  ];

  return (
    <Box sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ mb: 4, color: theme.palette.text.primary }}>
          Tổng quan
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(stat.color, 0.2)}`,
                    },
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: `linear-gradient(45deg, transparent, ${alpha(
                        stat.color,
                        0.1
                      )})`,
                      borderRadius: '0 0 0 100%',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      mb: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>

                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {stat.title}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="h4">{stat.value}</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: alpha(
                          stat.trendUp
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                          0.1
                        ),
                        color: stat.trendUp
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                      }}
                    >
                      {stat.trend}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {stat.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 3 }}
                >
                  <Box>
                    <Typography variant="h6">Biểu đồ doanh thu</Typography>
                    <Typography variant="body2" color="text.secondary">
                      6 tháng gần nhất
                    </Typography>
                  </Box>
                  <Button
                    endIcon={<Assessment />}
                    sx={{ textTransform: 'none' }}
                  >
                    Xem báo cáo
                  </Button>
                </Stack>

                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill={theme.palette.primary.main}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card sx={{ mt: 3 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ p: 3, pb: 1 }}
                >
                  <Typography variant="h6">Đơn hàng gần đây</Typography>
                  <Button
                    endIcon={<ArrowForward />}
                    sx={{ textTransform: 'none' }}
                  >
                    Xem tất cả
                  </Button>
                </Stack>

                <Box>
                  {recentOrders.map((order, index) => (
                    <Stack
                      key={order.id}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        px: 3,
                        py: 2,
                        ...(index !== recentOrders.length - 1 && {
                          borderBottom: 1,
                          borderColor: 'divider',
                        }),
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                        cursor: 'pointer',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" noWrap>
                          {order.customer}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                          noWrap
                        >
                          {order.id}
                        </Typography>
                      </Box>

                      <Typography variant="subtitle2">{order.date}</Typography>

                      <Typography
                        variant="subtitle2"
                        sx={{ color: 'text.secondary' }}
                      >
                        {order.status}
                      </Typography>

                      <Typography variant="subtitle2">{order.amount}</Typography>

                      <IconButton size="small">
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Box>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6">Sự kiện sắp tới</Typography>
                  <IconButton size="small">
                    <CalendarToday fontSize="small" />
                  </IconButton>
                </Stack>

                <Stack spacing={2}>
                  {upcomingEvents.map((event) => (
                    <Card
                      key={event.id}
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {event.title}
                      </Typography>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Typography variant="caption">
                          <CalendarToday
                            fontSize="inherit"
                            sx={{ mr: 0.5, verticalAlign: 'text-bottom' }}
                          />
                          {event.date} {event.time}
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                        <Typography variant="caption" noWrap>
                          {event.location}
                        </Typography>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Hiệu suất tháng này
                </Typography>

                <Stack spacing={3}>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="subtitle2">Doanh thu</Typography>
                      <Typography variant="subtitle2">78%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={78}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        height: 8,
                        borderRadius: 2,
                      }}
                    />
                  </Stack>

                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="subtitle2">Đơn hàng mới</Typography>
                      <Typography variant="subtitle2">65%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={65}
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        height: 8,
                        borderRadius: 2,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.info.main,
                        },
                      }}
                    />
                  </Stack>

                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="subtitle2">Khách hàng mới</Typography>
                      <Typography variant="subtitle2">85%</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={85}
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        height: 8,
                        borderRadius: 2,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.success.main,
                        },
                      }}
                    />
                  </Stack>
                </Stack>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default DashboardPage; 
import React, { useState } from 'react';
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
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
  AvatarGroup,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
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
  FilterList,
  Download,
  Print,
  Share,
  Visibility,
  CheckCircle,
  Warning,
  ErrorOutline,
  ShowChart,
  BarChart,
  Timeline,
  Edit,
  Delete,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart as RechartsAreaChart,
  Area,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// Dữ liệu chi tiết hơn cho biểu đồ
const revenueData = [
  { month: 'T1', doanhThu: 85, donHang: 45, khachHang: 32 },
  { month: 'T2', doanhThu: 92, donHang: 55, khachHang: 38 },
  { month: 'T3', doanhThu: 78, donHang: 38, khachHang: 25 },
  { month: 'T4', doanhThu: 95, donHang: 62, khachHang: 42 },
  { month: 'T5', doanhThu: 88, donHang: 48, khachHang: 35 },
  { month: 'T6', doanhThu: 98, donHang: 65, khachHang: 45 },
];

const categoryData = [
  { name: 'Váy cưới', value: 45, color: '#FF6B6B' },
  { name: 'Áo dài', value: 25, color: '#4ECDC4' },
  { name: 'Vest', value: 15, color: '#45B7D1' },
  { name: 'Phụ kiện', value: 15, color: '#96CEB4' },
];

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7days');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedChart, setSelectedChart] = useState<'bar' | 'line' | 'area'>('bar');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [orderActionAnchor, setOrderActionAnchor] = useState<{
    element: HTMLElement | null;
    orderId: string | null;
  }>({ element: null, orderId: null });

  const handleFeatureNotSupported = (featureName: string) => {
    setSnackbar({
      open: true,
      message: `Tính năng ${featureName} sẽ được hỗ trợ trong phiên bản tiếp theo`,
      severity: 'info',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const stats = [
    {
      title: 'Tổng doanh thu',
      value: '125.000.000 ₫',
      icon: <AttachMoney />,
      color: theme.palette.primary.main,
      trend: '+15%',
      trendUp: true,
      description: 'So với tháng trước',
      chartData: [65, 72, 68, 75, 80, 85, 88],
    },
    {
      title: 'Đơn hàng mới',
      value: '48',
      icon: <ShoppingBag />,
      color: theme.palette.info.main,
      trend: '+12%',
      trendUp: true,
      description: '24 đơn chờ xử lý',
      chartData: [25, 30, 28, 32, 35, 38, 42],
    },
    {
      title: 'Khách hàng',
      value: '2,149',
      icon: <People />,
      color: theme.palette.warning.main,
      trend: '+8%',
      trendUp: true,
      description: '149 khách mới',
      chartData: [120, 125, 122, 130, 135, 140, 145],
    },
    {
      title: 'Trang phục có sẵn',
      value: '186',
      icon: <Inventory />,
      color: theme.palette.error.main,
      trend: '-2%',
      trendUp: false,
      description: '12 đang được thuê',
      chartData: [190, 188, 185, 182, 180, 183, 186],
    },
  ];

  const recentOrders = [
    {
      id: 'ORD-2023001',
      customer: 'Nguyễn Văn A',
      avatar: 'A',
      date: '01/12/2023',
      amount: '4.990.000 ₫',
      status: 'completed',
      items: ['Váy cưới công chúa', 'Áo dài cưới'],
    },
    {
      id: 'ORD-2023002',
      customer: 'Trần Thị B',
      avatar: 'B',
      date: '02/12/2023',
      amount: '2.990.000 ₫',
      status: 'processing',
      items: ['Vest cưới', 'Phụ kiện'],
    },
    {
      id: 'ORD-2023003',
      customer: 'Lê Văn C',
      avatar: 'C',
      date: '03/12/2023',
      amount: '3.490.000 ₫',
      status: 'pending',
      items: ['Váy phụ dâu'],
    },
    {
      id: 'ORD-2023004',
      customer: 'Phạm Thị D',
      avatar: 'D',
      date: '04/12/2023',
      amount: '5.990.000 ₫',
      status: 'completed',
      items: ['Váy cưới đuôi cá', 'Vương miện'],
    },
    {
      id: 'ORD-2023020',
      customer: 'Hoàng Văn Z',
      avatar: 'Z',
      date: '20/12/2023',
      amount: '3.290.000 ₫',
      status: 'pending',
      items: ['Vest chú rể'],
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Tiệc cưới Anh Tuấn & Ngọc Anh',
      date: '15/12/2023',
      time: '18:00',
      location: 'White Palace Convention Center',
      status: 'confirmed',
      participants: ['T', 'N', 'H', 'M'],
    },
    {
      id: 2,
      title: 'Chụp ảnh cưới Minh Khang & Thùy Linh',
      date: '18/12/2023',
      time: '08:00',
      location: 'Studio ABC',
      status: 'pending',
      participants: ['K', 'L', 'P'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.palette.success;
      case 'processing':
        return theme.palette.info;
      case 'pending':
        return theme.palette.warning;
      default:
        return theme.palette.grey;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle fontSize="small" />;
      case 'processing':
        return <Visibility fontSize="small" />;
      case 'pending':
        return <Warning fontSize="small" />;
      default:
        return <ErrorOutline fontSize="small" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'processing':
        return 'Đang xử lý';
      case 'pending':
        return 'Chờ thanh toán';
      default:
        return 'Không xác định';
    }
  };

  const handleOrderAction = (action: string, orderId: string) => {
    setOrderActionAnchor({ element: null, orderId: null });
    
    switch (action) {
      case 'view':
        handleFeatureNotSupported('xem chi tiết đơn hàng');
        break;
      case 'edit':
        handleFeatureNotSupported('chỉnh sửa đơn hàng');
        break;
      case 'delete':
        handleFeatureNotSupported('xóa đơn hàng');
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 4 }}
        >
          <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
            Tổng quan
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              {timeRange === '7days' ? '7 ngày qua' : 
               timeRange === '30days' ? '30 ngày qua' : 
               timeRange === '90days' ? '90 ngày qua' : 'Tùy chọn'}
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={() => { setTimeRange('7days'); setMenuAnchor(null); }}>
                7 ngày qua
              </MenuItem>
              <MenuItem onClick={() => { setTimeRange('30days'); setMenuAnchor(null); }}>
                30 ngày qua
              </MenuItem>
              <MenuItem onClick={() => { setTimeRange('90days'); setMenuAnchor(null); }}>
                90 ngày qua
              </MenuItem>
            </Menu>
            
            <Tooltip title="Tải xuống báo cáo (Chưa hỗ trợ)">
              <IconButton onClick={() => handleFeatureNotSupported('tải xuống báo cáo')}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="In báo cáo (Chưa hỗ trợ)">
              <IconButton onClick={() => handleFeatureNotSupported('in báo cáo')}>
                <Print />
              </IconButton>
            </Tooltip>
            <Tooltip title="Chia sẻ (Chưa hỗ trợ)">
              <IconButton onClick={() => handleFeatureNotSupported('chia sẻ')}>
                <Share />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Stats Cards */}
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
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(stat.color, 0.2)}`,
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
                    <Chip
                      label={stat.trend}
                      size="small"
                      icon={<TrendingUp />}
                      color={stat.trendUp ? 'success' : 'error'}
                      sx={{
                        borderRadius: 1,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {stat.description}
                  </Typography>

                  {/* Sparkline Chart */}
                  <Box sx={{ height: 40 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stat.chartData.map((value, i) => ({ value }))}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={stat.color}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
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
                      Thống kê theo {timeRange === '7days' ? 'tuần' : 'tháng'}
                    </Typography>
                  </Box>
                  
                  <Stack direction="row" spacing={1}>
                    <ToggleButtonGroup
                      value={selectedChart}
                      exclusive
                      onChange={(_event: React.MouseEvent<HTMLElement>, newValue: 'bar' | 'line' | 'area' | null) => {
                        if (newValue) setSelectedChart(newValue);
                      }}
                      size="small"
                    >
                      <ToggleButton value="bar">
                        <Tooltip title="Biểu đồ cột">
                          <BarChart />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="line">
                        <Tooltip title="Biểu đồ đường">
                          <ShowChart />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="area">
                        <Tooltip title="Biểu đồ vùng">
                          <Timeline />
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Stack>
                </Stack>

                <Box sx={{ height: 350, width: '100%' }}>
                  <ResponsiveContainer>
                    {selectedChart === 'bar' ? (
                      <RechartsBarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="doanhThu" name="Doanh thu" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="donHang" name="Đơn hàng" fill={theme.palette.info.main} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="khachHang" name="Khách hàng" fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    ) : selectedChart === 'line' ? (
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="doanhThu" name="Doanh thu" stroke={theme.palette.primary.main} strokeWidth={2} />
                        <Line type="monotone" dataKey="donHang" name="Đơn hàng" stroke={theme.palette.info.main} strokeWidth={2} />
                        <Line type="monotone" dataKey="khachHang" name="Khách hàng" stroke={theme.palette.warning.main} strokeWidth={2} />
                      </LineChart>
                    ) : (
                      <RechartsAreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="doanhThu" name="Doanh thu" fill={alpha(theme.palette.primary.main, 0.2)} stroke={theme.palette.primary.main} />
                        <Area type="monotone" dataKey="donHang" name="Đơn hàng" fill={alpha(theme.palette.info.main, 0.2)} stroke={theme.palette.info.main} />
                        <Area type="monotone" dataKey="khachHang" name="Khách hàng" fill={alpha(theme.palette.warning.main, 0.2)} stroke={theme.palette.warning.main} />
                      </RechartsAreaChart>
                    )}
                  </ResponsiveContainer>
                </Box>
              </Card>
            </motion.div>

            {/* Recent Orders */}
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
                    onClick={() => navigate('/dashboard/orders')}
                  >
                    Xem tất cả
                  </Button>
                </Stack>

                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {recentOrders.map((order, index) => (
                    <Stack
                      key={order.id}
                      direction="row"
                      alignItems="center"
                      spacing={2}
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
                      }}
                    >
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {order.avatar}
                      </Avatar>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {order.customer}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            {order.id}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            •
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                            noWrap
                          >
                            {order.items.join(', ')}
                          </Typography>
                        </Stack>
                      </Box>

                      <Stack alignItems="flex-end">
                        <Typography variant="subtitle2">{order.amount}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {order.date}
                        </Typography>
                      </Stack>

                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={getStatusText(order.status)}
                        size="small"
                        color={
                          order.status === 'completed'
                            ? 'success'
                            : order.status === 'processing'
                            ? 'info'
                            : 'warning'
                        }
                        sx={{ minWidth: 100 }}
                      />

                      <IconButton 
                        size="small"
                        onClick={(event) => setOrderActionAnchor({ 
                          element: event.currentTarget,
                          orderId: order.id 
                        })}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Box>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Category Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Phân bố danh mục
                </Typography>

                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <RechartsBarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="value" fill={theme.palette.primary.main} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Box>

                <Stack spacing={2} sx={{ mt: 2 }}>
                  {categoryData.map((category) => (
                    <Stack
                      key={category.name}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: category.color,
                        }}
                      />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="subtitle2">{category.value}%</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card sx={{ p: 3, mt: 3 }}>
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
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography variant="subtitle2">{event.title}</Typography>
                          <Chip
                            label={event.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                            size="small"
                            color={event.status === 'confirmed' ? 'success' : 'warning'}
                          />
                        </Stack>

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

                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <AvatarGroup max={4}>
                            {event.participants.map((participant, index) => (
                              <Avatar
                                key={index}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  fontSize: '0.75rem',
                                  bgcolor: theme.palette.primary.main,
                                }}
                              >
                                {participant}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                          <IconButton size="small">
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>

      {/* Order Actions Menu */}
      <Menu
        anchorEl={orderActionAnchor.element}
        open={Boolean(orderActionAnchor.element)}
        onClose={() => setOrderActionAnchor({ element: null, orderId: null })}
      >
        <MenuItem 
          onClick={() => handleOrderAction('view', orderActionAnchor.orderId!)}
          sx={{ color: theme.palette.info.main }}
        >
          <Visibility sx={{ mr: 1, fontSize: '1.2rem' }} />
          Xem chi tiết
        </MenuItem>
        <MenuItem 
          onClick={() => handleOrderAction('edit', orderActionAnchor.orderId!)}
          sx={{ color: theme.palette.warning.main }}
        >
          <Edit sx={{ mr: 1, fontSize: '1.2rem' }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem 
          onClick={() => handleOrderAction('delete', orderActionAnchor.orderId!)}
          sx={{ color: theme.palette.error.main }}
        >
          <Delete sx={{ mr: 1, fontSize: '1.2rem' }} />
          Xóa
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DashboardPage; 
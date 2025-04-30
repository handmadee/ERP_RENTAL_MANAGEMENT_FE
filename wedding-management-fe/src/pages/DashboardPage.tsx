import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  AlertTitle,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
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
  Refresh,
  Today,
  DateRange,
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
import dashboardService, { DashboardData } from '../services/dashboardService';
import orderService from '../services/orderService';
import { ORDER_STATUS } from '../types/order';
import OrderDetailDialog from '../components/orders/OrderDetailDialog';

// Define types needed for order handling
interface ExtendedBackendOrderItem {
  costumeId: string;
  quantity: number;
  price: number;
  subtotal: number;
  name?: string;
  code?: string;
  size?: string;
  category?: string;
  imageUrl?: string;
  availability?: {
    total: number;
    rented: number;
    available: number;
    percentageRented: string;
  };
}

// Time Range enum for dashboard filtering
export enum TimeRange {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  DAYS_7 = '7days',
  DAYS_30 = '30days',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_YEAR = 'this_year',
  ALL_TIME = 'all_time'
}

// Get display text for time range
const getTimeRangeText = (timeRange: TimeRange): string => {
  switch (timeRange) {
    case TimeRange.TODAY:
      return 'Hôm nay';
    case TimeRange.YESTERDAY:
      return 'Hôm qua';
    case TimeRange.DAYS_7:
      return '7 ngày qua';
    case TimeRange.DAYS_30:
      return '30 ngày qua';
    case TimeRange.THIS_MONTH:
      return 'Tháng này';
    case TimeRange.LAST_MONTH:
      return 'Tháng trước';
    case TimeRange.THIS_YEAR:
      return 'Năm nay';
    case TimeRange.ALL_TIME:
      return 'Tất cả thời gian';
    default:
      return '7 ngày qua';
  }
};

// Get icon for time range
const getTimeRangeIcon = (timeRange: TimeRange) => {
  switch (timeRange) {
    case TimeRange.TODAY:
    case TimeRange.YESTERDAY:
      return <Today fontSize="small" />;
    case TimeRange.THIS_MONTH:
    case TimeRange.LAST_MONTH:
    case TimeRange.THIS_YEAR:
      return <DateRange fontSize="small" />;
    default:
      return <FilterList fontSize="small" />;
  }
};

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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.DAYS_7);
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<any | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboardData(timeRange);
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      setSnackbar({
        open: true,
        message: "Failed to load dashboard data. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrderDetail = async (orderId: string) => {
    setOrderDetailLoading(true);
    setSelectedOrder(orderId);
    try {
      const orderData: any = await orderService.getOrderById(orderId);
      const formattedOrderData = {
        _id: orderData.orderDetails._id,
        orderCode: orderData.orderDetails.orderCode,
        customerName: orderData.orderDetails.customerId.fullName,
        customerPhone: orderData.orderDetails.customerId.phone,
        address: orderData.orderDetails.customerId.address,
        orderDate: orderData.orderDetails.orderDate,
        returnDate: orderData.orderDetails.returnDate,
        items: orderData.orderDetails.items.map((item: any) => ({
          costumeId: item.costumeId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          name: item.costumeName || '',
          code: item.costumeCode || '',
          size: item.size || '',
          category: item.categoryName || '',
          imageUrl: item.imageUrl || '',
          availability: item.availability || null
        })),
        total: orderData.financialMetrics.total,
        deposit: orderData.financialMetrics.deposit,
        remainingAmount: orderData.financialMetrics.remainingAmount,
        status: orderData.orderDetails.status,
        note: orderData.orderDetails.note,
        timeline: orderData.timeline || [],
        rentalDuration: orderData.rentalMetrics.rentalDuration,
        daysUntilReturn: orderData.rentalMetrics.daysUntilReturn,
        isOverdue: orderData.rentalMetrics.isOverdue,
        paymentStatus: orderData.financialMetrics.paymentStatus,
        paymentPercentage: orderData.financialMetrics.paymentPercentage,
        createdBy: orderData.metadata?.createdBy?.fullName || '',
        customerHistory: orderData.customerHistory || {
          totalOrders: 0,
          isReturningCustomer: false,
          previousOrders: []
        },
        isNewCustomer: orderData.customerHistory?.totalOrders === 1,
        customerTotalOrders: orderData.customerHistory?.totalOrders || 0
      };

      setOrderDetail(formattedOrderData);
      setOrderDetailOpen(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.",
        severity: "error",
      });
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (status: string, data: any) => {
    if (!selectedOrder) return;

    try {
      await orderService.updateOrderStatus(selectedOrder, {
        status,
        ...data
      });

      // Refresh dashboard data after status update
      fetchDashboardData();

      setSnackbar({
        open: true,
        message: "Cập nhật trạng thái đơn hàng thành công",
        severity: "success",
      });

      // Close the order detail dialog
      setOrderDetailOpen(false);
      setOrderDetail(null);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      setSnackbar({
        open: true,
        message: "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.",
        severity: "error",
      });
    }
  };

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

  const stats = dashboardData ? [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(dashboardData.totalRevenue),
      icon: <AttachMoney />,
      color: theme.palette.primary.main,
      trend: `${dashboardData.revenuePercentChange > 0 ? '+' : ''}${dashboardData.revenuePercentChange}%`,
      trendUp: dashboardData.revenuePercentChange >= 0,
      description: 'So với kỳ trước',
      chartData: dashboardData.weeklyStatistics.map(stat => stat.revenue),
    },
    {
      title: 'Số đơn hàng',
      value: dashboardData.totalOrders.toString(),
      icon: <ShoppingBag />,
      color: theme.palette.info.main,
      trend: `${dashboardData.ordersPercentChange > 0 ? '+' : ''}${dashboardData.ordersPercentChange}%`,
      trendUp: dashboardData.ordersPercentChange >= 0,
      description: `${dashboardData.recentOrders.filter(o => o.status === ORDER_STATUS.PENDING).length} đơn chờ xử lý`,
      chartData: dashboardData.weeklyStatistics.map(stat => stat.orders),
    },
    {
      title: 'Khách hàng',
      value: dashboardData.totalCustomers.toString(),
      icon: <People />,
      color: theme.palette.warning.main,
      trend: `${dashboardData.customersPercentChange > 0 ? '+' : ''}${dashboardData.customersPercentChange}%`,
      trendUp: dashboardData.customersPercentChange >= 0,
      description: 'So với kỳ trước',
      chartData: dashboardData.weeklyStatistics.map(stat => stat.customers),
    },
    {
      title: 'Sản phẩm',
      value: dashboardData.totalCostumes.toString(),
      icon: <Inventory />,
      color: theme.palette.error.main,
      trend: "0%",
      trendUp: true,
      description: 'Số lượng sản phẩm',
      chartData: [dashboardData.totalCostumes, dashboardData.totalCostumes, dashboardData.totalCostumes, dashboardData.totalCostumes],
    },
  ] : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.COMPLETED:
        return theme.palette.success;
      case ORDER_STATUS.ACTIVE:
        return theme.palette.info;
      case ORDER_STATUS.PENDING:
        return theme.palette.warning;
      case ORDER_STATUS.CANCELLED:
        return theme.palette.error;
      default:
        return theme.palette.grey;
    }
  };

  // Get color string for avatar backgrounds based on status
  const getStatusColorString = (status: string): string => {
    switch (status) {
      case ORDER_STATUS.COMPLETED:
        return theme.palette.success.main;
      case ORDER_STATUS.ACTIVE:
        return theme.palette.info.main;
      case ORDER_STATUS.PENDING:
        return theme.palette.warning.main;
      case ORDER_STATUS.CANCELLED:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ORDER_STATUS.COMPLETED:
        return <CheckCircle fontSize="small" />;
      case ORDER_STATUS.ACTIVE:
        return <Visibility fontSize="small" />;
      case ORDER_STATUS.PENDING:
        return <Warning fontSize="small" />;
      case ORDER_STATUS.CANCELLED:
        return <ErrorOutline fontSize="small" />;
      default:
        return <ErrorOutline fontSize="small" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case ORDER_STATUS.COMPLETED:
        return 'Hoàn thành';
      case ORDER_STATUS.ACTIVE:
        return 'Đang xử lý';
      case ORDER_STATUS.PENDING:
        return 'Chờ thanh toán';
      case ORDER_STATUS.CANCELLED:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const handleOrderAction = (action: string, orderId: string) => {
    setOrderActionAnchor({ element: null, orderId: null });

    switch (action) {
      case 'view':
        handleViewOrderDetail(orderId);
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

  if (isLoading && !dashboardData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="subtitle1">Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
          <AlertTitle>Lỗi</AlertTitle>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

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
              startIcon={getTimeRangeIcon(timeRange)}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              {getTimeRangeText(timeRange)}
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={() => { setTimeRange(TimeRange.TODAY); setMenuAnchor(null); }}>
                <Today fontSize="small" sx={{ mr: 1 }} /> Hôm nay
              </MenuItem>
              <MenuItem onClick={() => { setTimeRange(TimeRange.YESTERDAY); setMenuAnchor(null); }}>
                <Today fontSize="small" sx={{ mr: 1 }} /> Hôm qua
              </MenuItem>
              <MenuItem onClick={() => { setTimeRange(TimeRange.DAYS_7); setMenuAnchor(null); }}>
                <FilterList fontSize="small" sx={{ mr: 1 }} /> 7 ngày qua
              </MenuItem>
              <MenuItem onClick={() => { setTimeRange(TimeRange.DAYS_30); setMenuAnchor(null); }}>
                <FilterList fontSize="small" sx={{ mr: 1 }} /> 30 ngày qua
              </MenuItem>
              <MenuItem onClick={() => { setTimeRange(TimeRange.THIS_MONTH); setMenuAnchor(null); }}>
                <DateRange fontSize="small" sx={{ mr: 1 }} /> Tháng này
              </MenuItem>
              <MenuItem onClick={() => { setTimeRange(TimeRange.LAST_MONTH); setMenuAnchor(null); }}>
                <DateRange fontSize="small" sx={{ mr: 1 }} /> Tháng trước
              </MenuItem>
              <MenuItem onClick={() => { setTimeRange(TimeRange.THIS_YEAR); setMenuAnchor(null); }}>
                <DateRange fontSize="small" sx={{ mr: 1 }} /> Năm nay
              </MenuItem>
              <MenuItem onClick={() => { setTimeRange(TimeRange.ALL_TIME); setMenuAnchor(null); }}>
                <FilterList fontSize="small" sx={{ mr: 1 }} /> Tất cả thời gian
              </MenuItem>
            </Menu>

            <Tooltip title="Tải xuống báo cáo">
              <IconButton onClick={() => handleFeatureNotSupported('tải xuống báo cáo')}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="In báo cáo">
              <IconButton onClick={() => handleFeatureNotSupported('in báo cáo')}>
                <Print />
              </IconButton>
            </Tooltip>
            <Tooltip title="Chia sẻ">
              <IconButton onClick={() => handleFeatureNotSupported('chia sẻ')}>
                <Share />
              </IconButton>
            </Tooltip>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton onClick={fetchDashboardData} color="primary">
                <Refresh />
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
                      icon={stat.trendUp ? <TrendingUp /> : <TrendingDown />}
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
                      Thống kê theo {timeRange === TimeRange.DAYS_7 ? 'tuần' : 'tháng'}
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
                  {dashboardData && (
                    <ResponsiveContainer>
                      {selectedChart === 'bar' ? (
                        <RechartsBarChart data={dashboardData.weeklyStatistics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip
                            formatter={(value: number) => formatCurrency(value)}
                          />
                          <Legend />
                          <Bar
                            dataKey="revenue"
                            name="Doanh thu"
                            fill={theme.palette.primary.main}
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="orders"
                            name="Đơn hàng"
                            fill={theme.palette.info.main}
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="customers"
                            name="Khách hàng"
                            fill={theme.palette.warning.main}
                            radius={[4, 4, 0, 0]}
                          />
                        </RechartsBarChart>
                      ) : selectedChart === 'line' ? (
                        <LineChart data={dashboardData.weeklyStatistics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip
                            formatter={(value: number, name: string) => {
                              if (name === "Doanh thu") return formatCurrency(value);
                              return value;
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Doanh thu"
                            stroke={theme.palette.primary.main}
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="orders"
                            name="Đơn hàng"
                            stroke={theme.palette.info.main}
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="customers"
                            name="Khách hàng"
                            stroke={theme.palette.warning.main}
                            strokeWidth={2}
                          />
                        </LineChart>
                      ) : (
                        <RechartsAreaChart data={dashboardData.weeklyStatistics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip
                            formatter={(value: number, name: string) => {
                              if (name === "Doanh thu") return formatCurrency(value);
                              return value;
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Doanh thu"
                            fill={alpha(theme.palette.primary.main, 0.2)}
                            stroke={theme.palette.primary.main}
                          />
                          <Area
                            type="monotone"
                            dataKey="orders"
                            name="Đơn hàng"
                            fill={alpha(theme.palette.info.main, 0.2)}
                            stroke={theme.palette.info.main}
                          />
                          <Area
                            type="monotone"
                            dataKey="customers"
                            name="Khách hàng"
                            fill={alpha(theme.palette.warning.main, 0.2)}
                            stroke={theme.palette.warning.main}
                          />
                        </RechartsAreaChart>
                      )}
                    </ResponsiveContainer>
                  )}
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
                  {dashboardData?.recentOrders.map((order, index) => (
                    <Stack
                      key={order._id}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{
                        px: 3,
                        py: 2,
                        ...(index !== (dashboardData?.recentOrders.length || 0) - 1 && {
                          borderBottom: 1,
                          borderColor: 'divider',
                        }),
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <Avatar sx={{ bgcolor: getStatusColorString(order.status) }}>
                        {order.customerName.charAt(0)}
                      </Avatar>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {order.customerName}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            {order.orderCode}
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
                            {formatDate(order.orderDate)}
                          </Typography>
                        </Stack>
                      </Box>

                      <Stack alignItems="flex-end">
                        <Typography variant="subtitle2">{formatCurrency(order.total)}</Typography>
                      </Stack>

                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={getStatusText(order.status)}
                        size="small"
                        color={
                          order.status === ORDER_STATUS.COMPLETED
                            ? 'success'
                            : order.status === ORDER_STATUS.ACTIVE
                              ? 'info'
                              : order.status === ORDER_STATUS.CANCELLED
                                ? 'error'
                                : 'warning'
                        }
                        sx={{ minWidth: 100 }}
                      />

                      <IconButton
                        size="small"
                        onClick={(event) => setOrderActionAnchor({
                          element: event.currentTarget,
                          orderId: order._id
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
                  {dashboardData && (
                    <ResponsiveContainer>
                      <RechartsBarChart data={dashboardData.categoryDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar
                          dataKey="productCount"
                          name="Số lượng sản phẩm"
                          fill={theme.palette.primary.main}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  )}
                </Box>

                <Stack spacing={2} sx={{ mt: 2 }}>
                  {dashboardData?.categoryDistribution.map((category) => (
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
                      <Typography variant="subtitle2">{category.percentage}%</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </motion.div>

            {/* Revenue Forecast */}
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
                  <Typography variant="h6">Dự báo doanh thu</Typography>
                  <Tooltip title="Dự báo 7 ngày tới">
                    <IconButton size="small">
                      <CalendarToday fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Box sx={{ height: 200, width: '100%' }}>
                  {dashboardData && (
                    <ResponsiveContainer>
                      <LineChart data={dashboardData.revenueForecast}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          name="Doanh thu dự kiến"
                          stroke={theme.palette.success.main}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </Box>

                <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.08), borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="success.main">
                    Dự báo doanh thu 7 ngày tới
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Dựa trên dữ liệu đơn hàng và dự đoán xu hướng
                  </Typography>
                </Box>
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

      {/* Order Detail Dialog */}
      {orderDetail && (
        <OrderDetailDialog
          open={orderDetailOpen}
          onClose={() => {
            setOrderDetailOpen(false);
            setOrderDetail(null);
            setSelectedOrder(null);
          }}
          order={orderDetail}
          onStatusUpdate={handleOrderStatusUpdate}
          loading={orderDetailLoading}
        />
      )}
    </Box>
  );
};

export default DashboardPage; 
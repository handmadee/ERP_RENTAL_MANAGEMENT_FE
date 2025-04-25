import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Stack,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Paper,
  Divider,
  FormHelperText,
  useTheme,
  Chip,
  Avatar,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  Delete as DeleteIcon,
  ContentCopy,
  Warning,
  CalendarToday,
  Save,
  Edit,
  AssignmentTurnedIn,
  LocalShipping,
  Verified,
  Cancel,
  MoreVert,
  AccessTime,
  People,
  Receipt,
  Info,
  Payment,
  Event
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showToast } from '../common/Toast';
import CustomerSearch from './CustomerSearch';
import ProductSearch from './ProductSearch';
import { ORDER_STATUS } from '@/types/order';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { alpha } from '@mui/material/styles';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { ThemeProvider } from '@mui/material/styles';
import { getStatusColor, getStatusLabel } from '@/theme/ThemeFallback';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  availableQuantity?: number;
  code?: string;
  size?: string;
  category?: string;
  imageUrl?: string;
  availability?: {
    total: number;
    available: number;
    rented: number;
    percentageRented: string;
  };
}

export interface Order {
  id?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  date: Date;
  returnDate: Date;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  total: number;
  items: OrderItem[];
  deposit: number;
  remainingAmount: number;
  note: string;
  timeline?: {
    time: string;
    status: string;
    description: string;
  }[];
  orderCode?: string;
  rentalDuration?: number;
  daysUntilReturn?: number;
  isOverdue?: boolean;
  paymentStatus?: string;
  paymentPercentage?: number;
  customerCode?: string;
  customerHistory?: {
    totalOrders: number;
    isReturningCustomer: boolean;
  };
  createdBy?: string;
}

interface OrderDialogProps {
  open: boolean;
  onClose: () => void;
  order?: Order;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (values: Order) => void;
}

const validationSchema = Yup.object({
  customerName: Yup.string().required('Tên khách hàng là bắt buộc'),
  customerPhone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ')
    .required('Số điện thoại là bắt buộc'),
  customerAddress: Yup.string().required('Địa chỉ là bắt buộc'),
  items: Yup.array()
    .of(
      Yup.object({
        id: Yup.string().required(),
        name: Yup.string().required(),
        price: Yup.number().min(0).required(),
        quantity: Yup.number().min(1).required(),
        subtotal: Yup.number().min(0).required(),
      })
    )
    .min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm'),
  deposit: Yup.number()
    .min(0, 'Tiền cọc không hợp lệ')
    .required('Tiền cọc là bắt buộc'),
  status: Yup.string().required('Trạng thái là bắt buộc'),
});

const statusLabels: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Chờ xử lý',
  [ORDER_STATUS.ACTIVE]: 'Đang thực hiện',
  [ORDER_STATUS.COMPLETED]: 'Hoàn thành',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
};

const OrderDialog: React.FC<OrderDialogProps> = ({
  open,
  onClose,
  order,
  mode,
  onSubmit,
}) => {
  const theme = useTheme();
  const isView = mode === 'view';
  const title = {
    create: 'Tạo đơn hàng mới',
    edit: 'Chỉnh sửa đơn hàng',
    view: 'Chi tiết đơn hàng',
  }[mode];

  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [orderTimeline, setOrderTimeline] = useState<any[]>([]);
  const [orderMetrics, setOrderMetrics] = useState<any>(null);

  useEffect(() => {
    if (order?.timeline) {
      setOrderTimeline(order.timeline);
    }
  }, [order]);

  const handleCopyOrderId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      showToast.success('Đã sao chép mã đơn hàng');
    }
  };

  const initialValues: Order = {
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerEmail: '',
    date: new Date(),
    returnDate: new Date(),
    status: 'pending',
    items: [],
    total: 0,
    deposit: 0,
    remainingAmount: 0,
    note: '',
    ...(order ? {
      ...order,
      items: order.items.map(item => ({
        ...item,
        subtotal: item.subtotal || item.price * item.quantity
      }))
    } : {})
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      // Ensure all items have a valid subtotal before submitting
      const validatedValues = {
        ...values,
        items: values.items.map(item => ({
          ...item,
          subtotal: Number(item.subtotal || (item.price * item.quantity))
        }))
      };
      console.log('Submitting order with values:', validatedValues);
      onSubmit(validatedValues);
      if (mode === 'create') {
        showToast.success('Tạo đơn hàng thành công!');
      } else {
        showToast.success('Cập nhật đơn hàng thành công!');
      }
      onClose();
    },
  });

  const handleCustomerSelect = (customer: any) => {
    if (customer) {
      formik.setValues({
        ...formik.values,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        customerEmail: customer.email || '',
        customerAddress: customer.address || '',
      });
    }
  };

  const handleProductSelect = (product: any) => {
    if (product) {
      console.log('Selected product:', product);
      const existingItemIndex = formik.values.items.findIndex(item => item.id === product._id);
      if (existingItemIndex !== -1) {
        const newItems = [...formik.values.items];
        const currentItem = newItems[existingItemIndex];
        // Kiểm tra số lượng sản phẩm, sử dụng mặc định là 0 nếu không xác định
        const availableQuantity = typeof product.quantity === 'number' && typeof product.quantityRented === 'number'
          ? product.quantity - product.quantityRented
          : 0;
        if (currentItem.quantity < availableQuantity) {
          currentItem.quantity += 1;
          // Ensure subtotal is calculated as a number
          currentItem.subtotal = Number(currentItem.quantity * currentItem.price);
          formik.setFieldValue('items', newItems);
          const total = newItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
          formik.setFieldValue('total', total);
        } else {
          showToast.error('Số lượng sản phẩm trong kho không đủ');
        }
      } else {
        // Đảm bảo quantityAvailable luôn là số
        const availableQuantity = typeof product.quantityAvailable === 'number' && !isNaN(product.quantityAvailable)
          ? product.quantityAvailable
          : 0;
        console.log('Available quantity:', availableQuantity, 'from', product.quantityAvailable);

        if (availableQuantity > 0) {
          const newItem: OrderItem = {
            id: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            // Ensure subtotal is calculated as a number
            subtotal: Number(product.price),
            availableQuantity,
          };
          const newItems = [...formik.values.items, newItem];
          formik.setFieldValue('items', newItems);
          const total = newItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
          formik.setFieldValue('total', total);
        } else {
          showToast.error('Sản phẩm đã hết hàng V1');
        }
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formik.values.items];
    newItems.splice(index, 1);
    formik.setFieldValue('items', newItems);

    // Update total
    const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);
    formik.setFieldValue('total', total);
  };

  const handleQuantityChange = (index: number, value: number) => {
    const newItems = [...formik.values.items];
    const item = newItems[index];

    // Đảm bảo availableQuantity luôn là số hợp lệ
    const availableQty =
      typeof item.availableQuantity === 'number' && !isNaN(item.availableQuantity)
        ? item.availableQuantity
        : 0;

    if (value > availableQty) {
      showToast.error('Số lượng sản phẩm trong kho không đủ');
      return;
    }

    item.quantity = value;
    // Calculate subtotal as a number
    item.subtotal = Number(item.quantity * item.price) || 0;
    formik.setFieldValue('items', newItems);

    // Update total using Number to ensure it's a numeric value
    const total = newItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
    formik.setFieldValue('total', total);
  };

  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setStatusMenuAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order?.id) return;

    setStatusLoading(true);
    try {
      // Call API to update status
      const response = await fetch(`http://localhost:3001/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const result = await response.json();

      // Update order status
      formik.setFieldValue('status', newStatus);

      // Update timeline
      if (result.data.timeline) {
        setOrderTimeline(result.data.timeline);
      }

      showToast.success(`Trạng thái đơn hàng đã được cập nhật thành ${getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error('Error updating status:', error);
      showToast.error('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setStatusLoading(false);
      handleStatusMenuClose();
    }
  };

  // Định nghĩa màu mặc định cho các trạng thái
  const defaultColors = {
    pending: '#ff9800',    // warning
    active: '#03a9f4',     // info
    completed: '#2e7d32',  // success
    cancelled: '#d32f2f',  // error
    default: '#64748b'     // grey
  };

  const getStatusColor = (status: string): string => {
    try {
      // Nếu theme tồn tại, sử dụng màu từ theme
      switch (status) {
        case 'pending': return theme?.palette?.warning?.main || defaultColors.pending;
        case 'active': return theme?.palette?.info?.main || defaultColors.active;
        case 'completed': return theme?.palette?.success?.main || defaultColors.completed;
        case 'cancelled': return theme?.palette?.error?.main || defaultColors.cancelled;
        default: return theme?.palette?.grey?.[500] || defaultColors.default;
      }
    } catch (error) {
      // Fallback nếu có lỗi khi truy cập theme
      console.warn('Theme error:', error);
      return defaultColors[status as keyof typeof defaultColors] || defaultColors.default;
    }
  };

  // Đảm bảo theme được đóng gói trước khi sử dụng
  const safeTheme = theme || {
    palette: {
      primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
      warning: { main: '#ff9800' },
      error: { main: '#f44336', dark: '#d32f2f' },
      success: { main: '#4caf50', dark: '#388e3c' },
      info: { main: '#03a9f4' },
      grey: { 500: '#9e9e9e' },
      text: { primary: '#212121', secondary: '#757575' },
      divider: '#e0e0e0',
      action: { hover: 'rgba(0, 0, 0, 0.04)' }
    }
  };

  // Sử dụng hàm helper từ ThemeFallback
  const renderStatusColor = (status: string) => getStatusColor(status);
  const renderStatusLabel = (status: string) => getStatusLabel(status);

  return (
    <ThemeProvider theme={safeTheme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        TransitionProps={{ unmountOnExit: true }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h6">{title}</Typography>
              {order?.id && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCopyOrderId}
                  startIcon={<ContentCopy />}
                >
                  {order.id}
                </Button>
              )}
            </Stack>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* Rental Info - Show only in view mode */}
              {isView && order && (
                <Grid item xs={12}>
                  <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Mã đơn hàng
                        </Typography>
                        <Typography variant="h6">
                          {order.orderCode || `MG_${order.id?.substring(order.id.length - 6)}`}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Thời gian thuê
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body1" fontWeight="bold">
                            {order.rentalDuration || 0} ngày
                          </Typography>
                          {order.isOverdue && (
                            <Chip
                              label="Quá hạn"
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Tình trạng thanh toán
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {order.paymentStatus || 'Chưa thanh toán'}
                          {order.paymentPercentage && (
                            <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                              ({order.paymentPercentage}%)
                            </Typography>
                          )}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Người tạo đơn
                        </Typography>
                        <Typography variant="body1">
                          {order.createdBy || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              )}

              {/* Customer Info Section - Enhanced */}
              <Grid item xs={12}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: theme.palette.primary.main }}>
                      <People fontSize="small" />
                      <span>Thông tin khách hàng</span>
                      {order?.customerCode && (
                        <Chip
                          label={order.customerCode}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Typography>

                  <Stack spacing={2}>
                    {!isView && (
                      <CustomerSearch
                        onSelect={handleCustomerSelect}
                        disabled={isView}
                      />
                    )}

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="customerName"
                          label="Tên khách hàng"
                          value={formik.values.customerName}
                          onChange={formik.handleChange}
                          error={formik.touched.customerName && Boolean(formik.errors.customerName)}
                          helperText={formik.touched.customerName && formik.errors.customerName}
                          disabled={isView}
                          InputProps={{
                            startAdornment: isView ? (
                              <InputAdornment position="start">
                                <Avatar
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor: theme.palette.primary.main,
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {formik.values.customerName.charAt(0)}
                                </Avatar>
                              </InputAdornment>
                            ) : undefined
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="customerPhone"
                          label="Số điện thoại"
                          value={formik.values.customerPhone}
                          onChange={formik.handleChange}
                          error={formik.touched.customerPhone && Boolean(formik.errors.customerPhone)}
                          helperText={formik.touched.customerPhone && formik.errors.customerPhone}
                          disabled={isView}
                          InputProps={{
                            startAdornment: isView ? (
                              <InputAdornment position="start">
                                <AccessTime fontSize="small" color="action" />
                              </InputAdornment>
                            ) : undefined
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="customerAddress"
                          label="Địa chỉ"
                          value={formik.values.customerAddress}
                          onChange={formik.handleChange}
                          error={formik.touched.customerAddress && Boolean(formik.errors.customerAddress)}
                          helperText={formik.touched.customerAddress && formik.errors.customerAddress}
                          disabled={isView}
                        />
                      </Grid>
                    </Grid>

                    {/* Customer History - Show only in view mode with data */}
                    {isView && order?.customerHistory && order.customerHistory.totalOrders > 0 && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Lịch sử khách hàng
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              Tổng số đơn đã đặt: <strong>{order.customerHistory.totalOrders}</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              Khách hàng thân thiết:
                              <strong> {order.customerHistory.isReturningCustomer ? 'Có' : 'Không'}</strong>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              {/* Product Search Section */}
              {!isView && (
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Thêm sản phẩm
                      </Typography>
                      <ProductSearch
                        onSelect={handleProductSelect}
                        disabled={isView}
                      />
                    </Stack>
                  </Paper>
                </Grid>
              )}

              {/* Order Items */}
              <Grid item xs={12}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        Chi tiết đơn hàng
                      </Typography>
                      {isView && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleStatusMenuOpen}
                          startIcon={statusLoading ? <CircularProgress size={16} /> : null}
                          endIcon={<MoreVert />}
                          color={formik.values.status as 'warning' | 'info' | 'success' | 'error' | 'primary'}
                          disabled={statusLoading}
                        >
                          {renderStatusLabel(formik.values.status)}
                        </Button>
                      )}
                      <Menu
                        anchorEl={statusMenuAnchorEl}
                        open={Boolean(statusMenuAnchorEl)}
                        onClose={handleStatusMenuClose}
                      >
                        <MenuItem onClick={() => handleStatusChange('pending')} disabled={formik.values.status === 'pending'}>
                          <ListItemIcon>
                            <Info fontSize="small" sx={{ color: theme.palette.warning.main }} />
                          </ListItemIcon>
                          <ListItemText>Chờ xử lý</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusChange('active')} disabled={formik.values.status === 'active'}>
                          <ListItemIcon>
                            <LocalShipping fontSize="small" sx={{ color: theme.palette.info.main }} />
                          </ListItemIcon>
                          <ListItemText>Đang thuê</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusChange('completed')} disabled={formik.values.status === 'completed'}>
                          <ListItemIcon>
                            <AssignmentTurnedIn fontSize="small" sx={{ color: theme.palette.success.main }} />
                          </ListItemIcon>
                          <ListItemText>Hoàn thành</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusChange('cancelled')} disabled={formik.values.status === 'cancelled'}>
                          <ListItemIcon>
                            <Cancel fontSize="small" sx={{ color: theme.palette.error.main }} />
                          </ListItemIcon>
                          <ListItemText>Hủy đơn</ListItemText>
                        </MenuItem>
                      </Menu>
                    </Stack>

                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableCell>Mã sản phẩm</TableCell>
                            <TableCell>Sản phẩm</TableCell>
                            <TableCell align="center">Kích cỡ</TableCell>
                            <TableCell align="center">Loại</TableCell>
                            <TableCell align="right">Đơn giá</TableCell>
                            <TableCell align="right">Số lượng</TableCell>
                            <TableCell align="right">Thành tiền</TableCell>
                            {!isView && <TableCell align="right" />}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formik.values.items.map((item, index) => (
                            <TableRow key={item.id} sx={{
                              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                            }}>
                              <TableCell>
                                <Typography variant="body2" component="div" fontWeight="medium">
                                  {item.code || 'SP' + item.id.substring(item.id.length - 6)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {item.imageUrl && (
                                    <Avatar
                                      src={item.imageUrl}
                                      variant="rounded"
                                      sx={{ width: 40, height: 40 }}
                                    />
                                  )}
                                  <Typography>{item.name}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={item.size || 'N/A'}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={item.category || 'N/A'}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="right">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(item.price)}
                              </TableCell>
                              <TableCell align="right">
                                {isView ? (
                                  <Typography variant="body2">{item.quantity}</Typography>
                                ) : (
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                                    disabled={isView}
                                    InputProps={{
                                      inputProps: { min: 1, max: item.availableQuantity },
                                      sx: { width: 60 }
                                    }}
                                  />
                                )}
                                {!isView && item.availableQuantity && item.quantity >= item.availableQuantity && (
                                  <Typography variant="caption" color="error" display="block">
                                    Đã đạt giới hạn tồn kho
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                }).format(item.subtotal)}
                              </TableCell>
                              {!isView && (
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveItem(index)}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                          {formik.values.items.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={isView ? 7 : 8} align="center" sx={{ py: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Chưa có sản phẩm nào
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Stack>
                </Paper>
              </Grid>

              {/* Order Timeline - Only show in view mode */}
              {isView && orderTimeline.length > 0 && (
                <Grid item xs={12}>
                  <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Event />
                        <span>Lịch sử đơn hàng</span>
                      </Stack>
                    </Typography>
                    <Timeline position="right" sx={{
                      p: 0,
                      m: 0,
                      '& .MuiTimelineItem-root:before': {
                        content: 'none'
                      }
                    }}>
                      {orderTimeline.map((event, index) => (
                        <TimelineItem key={index}>
                          <TimelineSeparator>
                            <TimelineDot sx={{
                              bgcolor: renderStatusColor(event.status),
                              boxShadow: 'none',
                              p: 1
                            }}>
                              {event.status === 'pending' && <Info fontSize="small" />}
                              {event.status === 'active' && <LocalShipping fontSize="small" />}
                              {event.status === 'completed' && <AssignmentTurnedIn fontSize="small" />}
                              {event.status === 'cancelled' && <Cancel fontSize="small" />}
                            </TimelineDot>
                            {index < orderTimeline.length - 1 && <TimelineConnector />}
                          </TimelineSeparator>
                          <TimelineContent sx={{ py: 1, px: 2 }}>
                            <Stack spacing={0}>
                              <Typography variant="subtitle2" component="span">
                                {renderStatusLabel(event.status)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(event.date).toLocaleString('vi-VN')}
                              </Typography>
                              {event.note && (
                                <Typography variant="body2">
                                  {event.note}
                                </Typography>
                              )}
                            </Stack>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  </Paper>
                </Grid>
              )}

              {/* Payment Information */}
              <Grid item xs={12}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: theme.palette.primary.main }}>
                      <Payment fontSize="small" />
                      <span>Thông tin thanh toán</span>
                    </Stack>
                  </Typography>
                  <Grid container spacing={2}>
                    {/* Tổng tiền */}
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          Tổng cộng
                        </Typography>
                        <TextField
                          fullWidth
                          variant="outlined"
                          value={new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(formik.values.total)}
                          disabled
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                            sx: {
                              fontWeight: 'bold',
                              color: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                        />
                      </Stack>
                    </Grid>

                    {/* Tiền cọc */}
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          Tiền cọc
                        </Typography>
                        <TextField
                          fullWidth
                          name="deposit"
                          type="number"
                          value={formik.values.deposit}
                          onChange={(e) => {
                            formik.handleChange(e);
                            formik.setFieldValue(
                              'remainingAmount',
                              formik.values.total - Number(e.target.value)
                            );
                          }}
                          error={formik.touched.deposit && Boolean(formik.errors.deposit)}
                          helperText={formik.touched.deposit && formik.errors.deposit}
                          disabled={isView}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                          }}
                        />
                      </Stack>
                    </Grid>

                    {/* Còn lại */}
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          Còn lại
                        </Typography>
                        <TextField
                          fullWidth
                          value={new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(formik.values.remainingAmount)}
                          disabled
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                            sx: {
                              color: formik.values.remainingAmount > 0 ? theme.palette.warning.main : theme.palette.success.main,
                              bgcolor: formik.values.remainingAmount > 0
                                ? alpha(theme.palette.warning.main, 0.05)
                                : alpha(theme.palette.success.main, 0.05)
                            }
                          }}
                        />
                      </Stack>
                    </Grid>

                    {/* Payment Status - Only show in view mode */}
                    {isView && order?.paymentStatus && (
                      <Grid item xs={12}>
                        <Box sx={{
                          mt: 2,
                          p: 2,
                          borderRadius: 1,
                          bgcolor: alpha(
                            formik.values.remainingAmount > 0 ? theme.palette.warning.main : theme.palette.success.main,
                            0.05
                          )
                        }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">
                              {order.paymentStatus}
                            </Typography>
                            {order.paymentPercentage && (
                              <Chip
                                label={`${order.paymentPercentage}% đã thanh toán`}
                                color={formik.values.remainingAmount > 0 ? "warning" : "success"}
                                size="small"
                              />
                            )}
                          </Stack>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Order Dates */}
              <Grid item xs={12}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: theme.palette.primary.main }}>
                      <CalendarToday fontSize="small" />
                      <span>Thời gian thuê</span>
                      {order?.rentalDuration && (
                        <Chip
                          label={`${order.rentalDuration} ngày`}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Stack>
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Ngày bắt đầu thuê */}
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          Ngày đặt hàng
                        </Typography>
                        <Box sx={{
                          position: 'relative',
                          '& .react-datepicker-wrapper': {
                            width: '100%'
                          },
                          '& .react-datepicker': {
                            fontFamily: theme.typography.fontFamily,
                            borderRadius: '12px',
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          },
                          '& .react-datepicker__header': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            borderBottom: 'none',
                            borderRadius: '12px 12px 0 0',
                            padding: '16px',
                          },
                          '& .react-datepicker__current-month': {
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                          },
                          '& .react-datepicker__day': {
                            width: '36px',
                            height: '36px',
                            lineHeight: '36px',
                            margin: '2px',
                            borderRadius: '50%',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            },
                          },
                          '& .react-datepicker__day--selected': {
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                            '&:hover': {
                              backgroundColor: theme.palette.primary.dark,
                            },
                          },
                          '& .react-datepicker__day--keyboard-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            color: theme.palette.primary.main,
                          },
                          '& .react-datepicker__day-name': {
                            width: '36px',
                            height: '36px',
                            lineHeight: '36px',
                            margin: '2px',
                            color: theme.palette.text.secondary,
                          }
                        }}>
                          {isView ? (
                            <TextField
                              fullWidth
                              variant="outlined"
                              value={new Date(formik.values.date).toLocaleDateString('vi-VN')}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarToday sx={{ color: theme.palette.primary.main }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          ) : (
                            <DatePicker
                              selected={formik.values.date}
                              onChange={(newValue: Date | null) => {
                                if (newValue) {
                                  formik.setFieldValue('date', newValue);
                                  if (formik.values.returnDate < newValue) {
                                    formik.setFieldValue('returnDate', newValue);
                                  }
                                }
                              }}
                              dateFormat="dd/MM/yyyy"
                              minDate={new Date()}
                              placeholderText="Chọn ngày thuê"
                              disabled={isView}
                              customInput={
                                <TextField
                                  fullWidth
                                  label="Ngày bắt đầu thuê"
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <CalendarToday sx={{ color: theme.palette.primary.main }} />
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
                              }
                            />
                          )}
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Ngày trả */}
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          Ngày trả
                        </Typography>
                        <Box sx={{
                          position: 'relative',
                          '& .react-datepicker-wrapper': {
                            width: '100%'
                          },
                          '& .react-datepicker': {
                            fontFamily: theme.typography.fontFamily,
                            borderRadius: '12px',
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          },
                          '& .react-datepicker__header': {
                            backgroundColor: alpha(theme.palette.error.main, 0.08),
                            borderBottom: 'none',
                            borderRadius: '12px 12px 0 0',
                            padding: '16px',
                          },
                          '& .react-datepicker__current-month': {
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: theme.palette.error.main,
                          },
                          '& .react-datepicker__day': {
                            width: '36px',
                            height: '36px',
                            lineHeight: '36px',
                            margin: '2px',
                            borderRadius: '50%',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.08),
                            },
                          },
                          '& .react-datepicker__day--selected': {
                            backgroundColor: theme.palette.error.main,
                            color: 'white',
                            '&:hover': {
                              backgroundColor: theme.palette.error.dark,
                            },
                          },
                          '& .react-datepicker__day--keyboard-selected': {
                            backgroundColor: alpha(theme.palette.error.main, 0.2),
                            color: theme.palette.error.main,
                          },
                          '& .react-datepicker__day-name': {
                            width: '36px',
                            height: '36px',
                            lineHeight: '36px',
                            margin: '2px',
                            color: theme.palette.text.secondary,
                          }
                        }}>
                          {isView ? (
                            <TextField
                              fullWidth
                              variant="outlined"
                              value={new Date(formik.values.returnDate).toLocaleDateString('vi-VN')}
                              disabled
                              sx={{
                                '& .MuiInputBase-root': {
                                  bgcolor: order?.isOverdue ? alpha(theme.palette.error.main, 0.1) : undefined,
                                  borderColor: order?.isOverdue ? theme.palette.error.main : undefined,
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarToday sx={{ color: theme.palette.error.main }} />
                                  </InputAdornment>
                                ),
                                endAdornment: order?.isOverdue ? (
                                  <InputAdornment position="end">
                                    <Chip
                                      label="Quá hạn"
                                      color="error"
                                      size="small"
                                    />
                                  </InputAdornment>
                                ) : null
                              }}
                            />
                          ) : (
                            <DatePicker
                              selected={formik.values.returnDate}
                              onChange={(newValue: Date | null) => {
                                if (newValue) {
                                  formik.setFieldValue('returnDate', newValue);
                                }
                              }}
                              dateFormat="dd/MM/yyyy"
                              minDate={formik.values.date}
                              placeholderText="Chọn ngày trả"
                              disabled={isView}
                              customInput={
                                <TextField
                                  fullWidth
                                  label="Ngày trả"
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <CalendarToday sx={{ color: theme.palette.error.main }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      '&:hover fieldset': {
                                        borderColor: theme.palette.error.main,
                                      },
                                    },
                                  }}
                                />
                              }
                            />
                          )}
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Rental Duration Info */}
                    {isView && order?.rentalDuration && (
                      <Grid item xs={12}>
                        <Box sx={{
                          mt: 1,
                          p: 2,
                          borderRadius: 1,
                          bgcolor: alpha(
                            order.isOverdue ? theme.palette.error.main : theme.palette.info.main,
                            0.05
                          ),
                          borderLeft: `4px solid ${order.isOverdue ? theme.palette.error.main : theme.palette.info.main}`
                        }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <AccessTime fontSize="small" color={order.isOverdue ? "error" : "info"} />
                              <Typography variant="body2">
                                {order.isOverdue
                                  ? `Đã quá hạn trả ${Math.abs(order.daysUntilReturn || 0)} ngày`
                                  : `Còn ${order.daysUntilReturn || 0} ngày để trả`}
                              </Typography>
                            </Stack>
                            {order.isOverdue && (
                              <Chip
                                label="Cần trả gấp"
                                color="error"
                                size="small"
                              />
                            )}
                          </Stack>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="note"
                  label="Ghi chú"
                  value={formik.values.note}
                  onChange={formik.handleChange}
                  disabled={isView}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>
            {isView ? 'Đóng' : 'Hủy'}
          </Button>
          {!isView && (
            <Button
              type="submit"
              variant="contained"
              onClick={() => formik.handleSubmit()}
              disabled={formik.isSubmitting}
            >
              {mode === 'create' ? 'Tạo đơn hàng' : 'Cập nhật'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default OrderDialog; 
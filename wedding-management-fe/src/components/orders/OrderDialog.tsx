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
  LinearProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
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
  Event,
  Inventory,
  Category,
  Straighten,
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
import { getStatusColor, getStatusLabel, fallbackTheme } from '@/theme/ThemeFallback';
import { api } from '@/services/api';

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

interface OrderFormDialogProps {
  open: boolean;
  onClose: () => void;
  order?: Order;
  mode: 'create' | 'edit';
  onSubmit: (values: Order) => void;
  loading?: boolean;
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

const OrderFormDialog: React.FC<OrderFormDialogProps> = ({
  open,
  onClose,
  order,
  mode,
  onSubmit,
  loading,
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
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isFullyPaid, setIsFullyPaid] = useState(false);
  const [returnedOnTime, setReturnedOnTime] = useState(true);

  useEffect(() => {
    if (order?.id && isView) {
      fetchOrderDetails(order.id);
    } else if (order) {
      formik.setValues({
        ...initialValues,
        ...order,
        items: order.items.map(item => ({
          ...item,
          subtotal: item.subtotal || item.price * item.quantity
        }))
      });
      if (order.timeline) {
        setOrderTimeline(order.timeline);
      }
    }
  }, [order, isView]);

  const fetchOrderDetails = async (orderId: string) => {
    setLoadingDetails(true);
    try {
      const response = await api.get(`orders/${orderId}`);
      const result = response.data;
      setOrderData(result.data);
      if (result.data.timeline) {
        setOrderTimeline(result.data.timeline);
      }
      const orderDetails = result.data.orderDetails;
      const customerId = orderDetails.customerId || {};
      const financialMetrics = result.data.financialMetrics || {};
      formik.setValues({
        ...formik.values,
        id: orderDetails._id,
        customerName: customerId.fullName || '',
        customerPhone: customerId.phone || '',
        customerEmail: customerId.email || '',
        customerAddress: customerId.address || '',
        date: new Date(orderDetails.orderDate),
        returnDate: new Date(orderDetails.returnDate),
        status: orderDetails.status,
        items: orderDetails.items.map((item: any) => ({
          id: item.costumeId,
          name: item.costumeName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
          code: item.costumeCode,
          size: item.size,
          category: item.categoryName,
          imageUrl: item.imageUrl,
          availability: item.availability
        })),
        total: orderDetails.total,
        deposit: orderDetails.deposit,
        remainingAmount: orderDetails.remainingAmount,
        note: orderDetails.note,
        orderCode: orderDetails.orderCode,
        rentalDuration: result.data.rentalMetrics?.rentalDuration,
        daysUntilReturn: result.data.rentalMetrics?.daysUntilReturn,
        isOverdue: result.data.rentalMetrics?.isOverdue,
        paymentStatus: financialMetrics.paymentStatus,
        paymentPercentage: financialMetrics.paymentPercentage,
        customerCode: customerId.customerCode,
        customerHistory: result.data.customerHistory,
        createdBy: result.data.metadata?.createdBy?.fullName
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
      showToast.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCopyOrderId = () => {
    const idToCopy = orderData?.orderDetails?._id || order?.id;
    const codeToCopy = orderData?.orderDetails?.orderCode || order?.orderCode || '';

    if (idToCopy) {
      navigator.clipboard.writeText(codeToCopy || idToCopy);
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
            imageUrl: product.imageUrl || undefined,
            category: product.category?.name || undefined,
            code: product.code || undefined,
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

  const handleStatusSelect = (newStatus: string) => {
    setTargetStatus(newStatus);
    setIsStatusUpdateDialogOpen(true);
    handleStatusMenuClose();

    // Set appropriate defaults based on status
    if (newStatus === ORDER_STATUS.COMPLETED) {
      const hasRemainingAmount = formik.values.remainingAmount > 0;
      setIsFullyPaid(!hasRemainingAmount);
      const today = new Date();
      const returnDate = new Date(formik.values.returnDate);
      setReturnedOnTime(today <= returnDate);
    }
  };

  const handleStatusChangeConfirm = async (newStatus: string) => {
    const orderId = orderData?.orderDetails?._id || order?.id;
    if (!orderId) return;

    setStatusLoading(true);
    try {
      const statusPayload: any = {
        status: newStatus,
      };

      if (statusNote) {
        statusPayload.note = statusNote;
      }

      // Add additional fields for completed status
      if (newStatus === ORDER_STATUS.COMPLETED) {
        statusPayload.isFullyPaid = isFullyPaid;
        statusPayload.returnedOnTime = returnedOnTime;
      }

      // Call API to update status using the api service
      const response = await api.patch(`orders/${orderId}/status`, statusPayload);
      const result = response.data;

      // Update order status
      formik.setFieldValue('status', newStatus);

      // If isFullyPaid is true, update the deposit and remaining amount
      if (newStatus === ORDER_STATUS.COMPLETED && isFullyPaid) {
        formik.setFieldValue('deposit', formik.values.total);
        formik.setFieldValue('remainingAmount', 0);
      }

      // Update timeline
      if (result.data.timeline) {
        setOrderTimeline(result.data.timeline);
      }

      // Refetch the order details to get the updated data
      if (orderId) {
        fetchOrderDetails(orderId);
      }

      showToast.success(`Trạng thái đơn hàng đã được cập nhật thành ${getStatusLabel(newStatus)}`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setStatusLoading(false);
    }
  };

  // Đảm bảo theme được đóng gói trước khi sử dụng
  const safeTheme = theme || fallbackTheme;

  // After the fetchOrderDetails function, add a function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Add this component to display the previous orders section
  const PreviousOrdersList = ({ previousOrders }: { previousOrders: any[] }) => {
    if (!previousOrders || previousOrders.length === 0) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Đơn hàng trước đây:
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(safeTheme.palette.primary.main, 0.05) }}>
                <TableCell>Mã đơn hàng</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell align="right">Tổng tiền</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {previousOrders.map((order: any) => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderCode}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(order.status)}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(order.status, safeTheme), 0.1),
                        color: getStatusColor(order.status, safeTheme),
                        fontWeight: 'medium'
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Inside the component but outside any other functions, add this new status update dialog component
  const StatusUpdateDialog = () => {
    const handleClose = () => {
      setIsStatusUpdateDialogOpen(false);
      setStatusNote('');
    };

    const handleSubmit = () => {
      handleStatusChangeConfirm(targetStatus);
      handleClose();
    };

    const isCompleted = targetStatus === ORDER_STATUS.COMPLETED;

    return (
      <Dialog open={isStatusUpdateDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cập nhật trạng thái đơn hàng
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Alert severity="info">
              Bạn đang chuyển trạng thái đơn hàng sang <strong>{getStatusLabel(targetStatus)}</strong>
            </Alert>

            <TextField
              fullWidth
              label="Ghi chú"
              multiline
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Nhập ghi chú về việc thay đổi trạng thái (không bắt buộc)"
            />

            {isCompleted && (
              <>
                <FormControl component="fieldset">
                  <Typography variant="subtitle2" gutterBottom>
                    Thanh toán
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl>
                      <RadioGroup
                        row
                        value={isFullyPaid ? 'paid' : 'notPaid'}
                        onChange={(e) => setIsFullyPaid(e.target.value === 'paid')}
                      >
                        <FormControlLabel
                          value="paid"
                          control={<Radio />}
                          label="Đã thanh toán đủ"
                        />
                        <FormControlLabel
                          value="notPaid"
                          control={<Radio />}
                          label="Chưa thanh toán đủ"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Stack>
                </FormControl>

                <FormControl component="fieldset">
                  <Typography variant="subtitle2" gutterBottom>
                    Thời gian trả
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl>
                      <RadioGroup
                        row
                        value={returnedOnTime ? 'onTime' : 'late'}
                        onChange={(e) => setReturnedOnTime(e.target.value === 'onTime')}
                      >
                        <FormControlLabel
                          value="onTime"
                          control={<Radio />}
                          label="Trả đúng hạn"
                        />
                        <FormControlLabel
                          value="late"
                          control={<Radio />}
                          label="Trả trễ"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Stack>
                </FormControl>

                {isFullyPaid && (
                  <Alert severity="success">
                    Hệ thống sẽ tự động cập nhật số tiền còn lại về 0 và đánh dấu là đã thanh toán đủ.
                  </Alert>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={statusLoading ? <CircularProgress size={20} color="inherit" /> : null}
            disabled={statusLoading}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

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
              {(orderData?.orderDetails?._id || order?.id) && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCopyOrderId}
                  startIcon={<ContentCopy />}
                >
                  {orderData?.orderDetails?.orderCode || order?.orderCode || (orderData?.orderDetails?._id && `MG_${orderData.orderDetails._id.substring(orderData.orderDetails._id.length - 6)}`) || (order?.id && `MG_${order.id.substring(order.id.length - 6)}`)}
                </Button>
              )}
            </Stack>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          ) : loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                {/* Rental Info - Show only in view mode */}
                {isView && <StatusUpdateDialog />}

                {/* Customer Info Section - Enhanced */}
                <Grid item xs={12}>
                  <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: safeTheme.palette.primary.main }}>
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
                                      bgcolor: safeTheme.palette.primary.main,
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
                      {isView && orderData?.customerHistory && orderData.customerHistory.totalOrders > 0 && (
                        <Grid item xs={12}>
                          <Box sx={{ mt: 2, p: 2, bgcolor: alpha(safeTheme.palette.info.main, 0.05), borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <People fontSize="small" sx={{ mr: 1 }} />
                              Lịch sử khách hàng
                              {orderData.customerHistory.isReturningCustomer && (
                                <Chip
                                  label="Khách hàng thân thiết"
                                  size="small"
                                  color="primary"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 1 }}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Receipt fontSize="small" sx={{ mr: 0.5, opacity: 0.7, fontSize: '1rem' }} />
                                  Tổng số đơn đã đặt: <Box component="span" sx={{ fontWeight: 'bold', ml: 0.5 }}>{orderData.customerHistory.totalOrders}</Box>
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CalendarToday fontSize="small" sx={{ mr: 0.5, opacity: 0.7, fontSize: '1rem' }} />
                                  Trạng thái:
                                  <Box component="span" sx={{ fontWeight: 'bold', ml: 0.5, color: orderData.customerHistory.isReturningCustomer ? safeTheme.palette.success.main : 'inherit' }}>
                                    {orderData.customerHistory.isReturningCustomer ? 'Khách hàng thân thiết' : 'Khách hàng mới'}
                                  </Box>
                                </Typography>
                              </Grid>
                            </Grid>

                            {/* Previous orders list */}
                            {orderData.customerHistory.previousOrders && orderData.customerHistory.previousOrders.length > 0 && (
                              <PreviousOrdersList previousOrders={orderData.customerHistory.previousOrders} />
                            )}
                          </Box>
                        </Grid>
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

                {/* Bảng chi tiết sản phẩm - Hiển thị cho chế độ tạo mới và chỉnh sửa */}
                {!isView && formik.values.items.length > 0 && (
                  <Grid item xs={12}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: safeTheme.palette.primary.main, mb: 2 }}>
                          <Inventory fontSize="small" />
                          <span>Danh sách sản phẩm thuê</span>
                          <Chip
                            label={`${formik.values.items.length} sản phẩm`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>
                      </Typography>

                      <TableContainer>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: alpha(safeTheme.palette.primary.main, 0.05) }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }} align="center">Số lượng</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }} align="right">Đơn giá</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }} align="right">Thành tiền</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }} align="center">Thao tác</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {formik.values.items.map((item, index) => (
                              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: alpha(safeTheme.palette.grey[100], 0.4) } }}>
                                <TableCell>
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    {item.imageUrl ? (
                                      <Box
                                        component="img"
                                        src={item.imageUrl}
                                        alt={item.name}
                                        sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', border: `1px solid ${safeTheme.palette.divider}` }}
                                      />
                                    ) : (
                                      <Box
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          bgcolor: alpha(safeTheme.palette.primary.main, 0.08),
                                          color: safeTheme.palette.primary.main
                                        }}
                                      >
                                        <Category fontSize="small" />
                                      </Box>
                                    )}
                                    <Box>
                                      <Typography variant="body2" fontWeight="medium">
                                        {item.name}
                                      </Typography>
                                      {item.category && (
                                        <Typography variant="caption" color="text.secondary">
                                          {item.category}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Stack>
                                </TableCell>
                                <TableCell align="center">
                                  <TextField
                                    type="number"
                                    variant="outlined"
                                    size="small"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                    inputProps={{ min: 1, max: item.availableQuantity || 999 }}
                                    sx={{ width: '80px' }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2">
                                    {formatCurrency(item.price)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="medium" color="primary.main">
                                    {formatCurrency(item.subtotal)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveItem(index)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow sx={{ bgcolor: alpha(safeTheme.palette.primary.main, 0.02) }}>
                              <TableCell colSpan={3} />
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                Tổng tiền:
                              </TableCell>
                              <TableCell align="right" colSpan={2}>
                                <Typography variant="body2" fontWeight="bold" color="primary.main">
                                  {formatCurrency(formik.values.total)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                )}

                {/* Product Items - Show only in view mode */}
                {isView && ((orderData?.items && orderData.items.length > 0) || (order?.items && order.items.length > 0)) && (
                  <Grid item xs={12}>
                    <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: safeTheme.palette.primary.main, mb: 2 }}>
                          <Inventory fontSize="small" />
                          <span>Danh sách sản phẩm thuê</span>
                          <Chip
                            label={`${orderData?.items?.length || order?.items?.length || 0} sản phẩm`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>
                      </Typography>

                      <TableContainer>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: alpha(safeTheme.palette.primary.main, 0.05) }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Mã SP</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }} align="center">Số lượng</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }} align="right">Đơn giá</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }} align="right">Thành tiền</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(orderData?.items || order?.items || []).map((item: any, index: number) => (
                              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: alpha(safeTheme.palette.grey[100], 0.4) } }}>
                                <TableCell>
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    {item.imageUrl ? (
                                      <Box
                                        component="img"
                                        src={item.imageUrl}
                                        alt={item.name}
                                        sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', border: `1px solid ${safeTheme.palette.divider}` }}
                                      />
                                    ) : (
                                      <Box
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          bgcolor: alpha(safeTheme.palette.primary.main, 0.08),
                                          color: safeTheme.palette.primary.main
                                        }}
                                      >
                                        <Category fontSize="small" />
                                      </Box>
                                    )}
                                    <Box>
                                      <Typography variant="body2" fontWeight="medium">
                                        {item.name}
                                      </Typography>
                                      {item.category && (
                                        <Typography variant="caption" color="text.secondary">
                                          {item.category}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.productCode || item.code || `-`}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={item.quantity}
                                    size="small"
                                    sx={{
                                      minWidth: 30,
                                      fontWeight: 'medium'
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2">
                                    {formatCurrency(item.price)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="medium" color="primary.main">
                                    {formatCurrency(item.price * item.quantity)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow sx={{ bgcolor: alpha(safeTheme.palette.primary.main, 0.02) }}>
                              <TableCell colSpan={3} />
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                Tổng tiền:
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="bold" color="primary.main">
                                  {formatCurrency(orderData?.orderDetails?.total || order?.total || (orderData?.items || order?.items || []).reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0))}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                )}

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
                                bgcolor: getStatusColor(event.status, safeTheme),
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
                                  {getStatusLabel(event.status)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {event.formattedDate || new Date(event.date).toLocaleString('vi-VN')}
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
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: safeTheme.palette.primary.main }}>
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
                                color: safeTheme.palette.primary.main,
                                bgcolor: alpha(safeTheme.palette.primary.main, 0.05)
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
                                color: formik.values.remainingAmount > 0 ? safeTheme.palette.warning.main : safeTheme.palette.success.main,
                                bgcolor: formik.values.remainingAmount > 0
                                  ? alpha(safeTheme.palette.warning.main, 0.05)
                                  : alpha(safeTheme.palette.success.main, 0.05)
                              }
                            }}
                          />
                        </Stack>
                      </Grid>

                      {/* Payment Status - Only show in view mode */}
                      {isView && orderData?.paymentStatus && (
                        <Grid item xs={12}>
                          <Box sx={{
                            mt: 2,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: alpha(
                              formik.values.remainingAmount > 0 ? safeTheme.palette.warning.main : safeTheme.palette.success.main,
                              0.05
                            )
                          }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2">
                                {orderData.paymentStatus}
                              </Typography>
                              {orderData.paymentPercentage && (
                                <Chip
                                  label={`${orderData.paymentPercentage}% đã thanh toán`}
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
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ color: safeTheme.palette.primary.main }}>
                        <CalendarToday fontSize="small" />
                        <span>Thời gian thuê</span>
                        {orderData?.rentalDuration && (
                          <Chip
                            label={`${orderData.rentalDuration} ngày`}
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
                              fontFamily: safeTheme.typography.fontFamily,
                              borderRadius: '12px',
                              border: `1px solid ${safeTheme.palette.divider}`,
                              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                            },
                            '& .react-datepicker__header': {
                              bgcolor: alpha(safeTheme.palette.primary.main, 0.08),
                              borderBottom: 'none',
                              borderRadius: '12px 12px 0 0',
                              padding: '16px',
                            },
                            '& .react-datepicker__current-month': {
                              fontSize: '1rem',
                              fontWeight: 600,
                              color: safeTheme.palette.primary.main,
                            },
                            '& .react-datepicker__day': {
                              width: '36px',
                              height: '36px',
                              lineHeight: '36px',
                              margin: '2px',
                              borderRadius: '50%',
                              '&:hover': {
                                bgcolor: alpha(safeTheme.palette.primary.main, 0.08),
                              },
                            },
                            '& .react-datepicker__day--selected': {
                              bgcolor: safeTheme.palette.primary.main,
                              color: 'white',
                              '&:hover': {
                                bgcolor: safeTheme.palette.primary.dark,
                              },
                            },
                            '& .react-datepicker__day--keyboard-selected': {
                              bgcolor: alpha(safeTheme.palette.primary.main, 0.2),
                              color: safeTheme.palette.primary.main,
                            },
                            '& .react-datepicker__day-name': {
                              width: '36px',
                              height: '36px',
                              lineHeight: '36px',
                              margin: '2px',
                              color: safeTheme.palette.text.secondary,
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
                                      <CalendarToday sx={{ color: safeTheme.palette.primary.main }} />
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
                                          <CalendarToday sx={{ color: safeTheme.palette.primary.main }} />
                                        </InputAdornment>
                                      ),
                                    }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                          borderColor: safeTheme.palette.primary.main,
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
                              fontFamily: safeTheme.typography.fontFamily,
                              borderRadius: '12px',
                              border: `1px solid ${safeTheme.palette.divider}`,
                              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                            },
                            '& .react-datepicker__header': {
                              bgcolor: alpha(safeTheme.palette.error.main, 0.08),
                              borderBottom: 'none',
                              borderRadius: '12px 12px 0 0',
                              padding: '16px',
                            },
                            '& .react-datepicker__current-month': {
                              fontSize: '1rem',
                              fontWeight: 600,
                              color: safeTheme.palette.error.main,
                            },
                            '& .react-datepicker__day': {
                              width: '36px',
                              height: '36px',
                              lineHeight: '36px',
                              margin: '2px',
                              borderRadius: '50%',
                              '&:hover': {
                                bgcolor: alpha(safeTheme.palette.error.main, 0.08),
                              },
                            },
                            '& .react-datepicker__day--selected': {
                              bgcolor: safeTheme.palette.error.main,
                              color: 'white',
                              '&:hover': {
                                bgcolor: safeTheme.palette.error.dark,
                              },
                            },
                            '& .react-datepicker__day--keyboard-selected': {
                              bgcolor: alpha(safeTheme.palette.error.main, 0.2),
                              color: safeTheme.palette.error.main,
                            },
                            '& .react-datepicker__day-name': {
                              width: '36px',
                              height: '36px',
                              lineHeight: '36px',
                              margin: '2px',
                              color: safeTheme.palette.text.secondary,
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
                                    bgcolor: orderData?.isOverdue ? alpha(safeTheme.palette.error.main, 0.1) : undefined,
                                    borderColor: orderData?.isOverdue ? safeTheme.palette.error.main : undefined,
                                  }
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarToday sx={{ color: safeTheme.palette.error.main }} />
                                    </InputAdornment>
                                  ),
                                  endAdornment: orderData?.isOverdue ? (
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
                                          <CalendarToday sx={{ color: safeTheme.palette.error.main }} />
                                        </InputAdornment>
                                      ),
                                    }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                          borderColor: safeTheme.palette.error.main,
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
                      {isView && orderData?.rentalDuration && (
                        <Grid item xs={12}>
                          <Box sx={{
                            mt: 1,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: alpha(
                              orderData.isOverdue ? safeTheme.palette.error.main : safeTheme.palette.info.main,
                              0.05
                            ),
                            borderLeft: `4px solid ${orderData.isOverdue ? safeTheme.palette.error.main : safeTheme.palette.info.main}`
                          }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={1} alignItems="center">
                                <AccessTime fontSize="small" color={orderData.isOverdue ? "error" : "info"} />
                                <Typography variant="body2">
                                  {orderData.isOverdue
                                    ? `Đã quá hạn trả ${Math.abs(orderData.daysUntilReturn || 0)} ngày`
                                    : `Còn ${orderData.daysUntilReturn || 0} ngày để trả`}
                                </Typography>
                              </Stack>
                              {orderData.isOverdue && (
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
          )}
        </DialogContent>

        {/* Replace the dialog actions section if in view mode */}
        {isView ? (
          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {/* Only show status update options if the order is not in a final state */}
              {(orderData?.orderDetails?.status === ORDER_STATUS.PENDING ||
                orderData?.orderDetails?.status === ORDER_STATUS.ACTIVE ||
                order?.status === ORDER_STATUS.PENDING ||
                order?.status === ORDER_STATUS.ACTIVE) && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStatusMenuOpen}
                    startIcon={<Edit />}
                    disabled={statusLoading}
                  >
                    Cập nhật trạng thái
                  </Button>
                )}
              <Menu
                anchorEl={statusMenuAnchorEl}
                open={Boolean(statusMenuAnchorEl)}
                onClose={handleStatusMenuClose}
              >
                {/* Show transition options based on current status */}
                {(orderData?.orderDetails?.status === ORDER_STATUS.PENDING || order?.status === ORDER_STATUS.PENDING) && (
                  <>
                    <MenuItem onClick={() => handleStatusSelect(ORDER_STATUS.ACTIVE)}>
                      <ListItemIcon>
                        <LocalShipping fontSize="small" color="info" />
                      </ListItemIcon>
                      <ListItemText>Chuyển sang Đang thực hiện</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleStatusSelect(ORDER_STATUS.CANCELLED)}>
                      <ListItemIcon>
                        <Cancel fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText>Hủy đơn hàng</ListItemText>
                    </MenuItem>
                  </>
                )}
                {(orderData?.orderDetails?.status === ORDER_STATUS.ACTIVE || order?.status === ORDER_STATUS.ACTIVE) && (
                  <>
                    <MenuItem onClick={() => handleStatusSelect(ORDER_STATUS.COMPLETED)}>
                      <ListItemIcon>
                        <AssignmentTurnedIn fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText>Hoàn thành đơn hàng</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleStatusSelect(ORDER_STATUS.CANCELLED)}>
                      <ListItemIcon>
                        <Cancel fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText>Hủy đơn hàng</ListItemText>
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
            <Button onClick={onClose}>
              Đóng
            </Button>
          </DialogActions>
        ) : (
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              onClick={() => formik.handleSubmit()}
              disabled={loading || formik.isSubmitting}
            >
              {mode === 'create' ? 'Tạo đơn hàng' : 'Cập nhật'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </ThemeProvider>
  );
};

export default OrderFormDialog;
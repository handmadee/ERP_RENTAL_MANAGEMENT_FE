import React from 'react';
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
  FormHelperText,
  Box,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Close,
  Save,
  Delete,
  Add as AddIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showToast } from '../common/Toast';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
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
  customerEmail: Yup.string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
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

const OrderDialog: React.FC<OrderDialogProps> = ({
  open,
  onClose,
  order,
  mode,
  onSubmit,
}) => {
  const isView = mode === 'view';
  const title = {
    create: 'Tạo đơn hàng mới',
    edit: 'Chỉnh sửa đơn hàng',
    view: 'Chi tiết đơn hàng',
  }[mode];

  const initialValues: Order = {
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    date: new Date().toISOString(),
    status: 'pending',
    items: [],
    total: 0,
    deposit: 0,
    remainingAmount: 0,
    note: '',
    ...order,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      if (mode === 'create') {
        showToast.success('Tạo đơn hàng thành công!');
      } else {
        showToast.success('Cập nhật đơn hàng thành công!');
      }
      onClose();
    },
  });

  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: `ITEM${Date.now()}`,
      name: '',
      price: 0,
      quantity: 1,
      subtotal: 0,
    };
    formik.setFieldValue('items', [...formik.values.items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formik.values.items];
    newItems.splice(index, 1);
    formik.setFieldValue('items', newItems);
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...formik.values.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      subtotal: field === 'quantity' ? newItems[index].price * value : 
                field === 'price' ? value * newItems[index].quantity :
                newItems[index].subtotal,
    };
    formik.setFieldValue('items', newItems);
    
    // Update total
    const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);
    formik.setFieldValue('total', total);
    formik.setFieldValue('remainingAmount', total - formik.values.deposit);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionProps={{ unmountOnExit: true }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Customer Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin khách hàng
              </Typography>
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="customerEmail"
                    label="Email"
                    value={formik.values.customerEmail}
                    onChange={formik.handleChange}
                    error={formik.touched.customerEmail && Boolean(formik.errors.customerEmail)}
                    helperText={formik.touched.customerEmail && formik.errors.customerEmail}
                    disabled={isView}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Order Items */}
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Chi tiết đơn hàng
                </Typography>
                {!isView && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    size="small"
                  >
                    Thêm sản phẩm
                  </Button>
                )}
              </Stack>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell align="right">Đơn giá</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                      <TableCell align="right">Thành tiền</TableCell>
                      {!isView && <TableCell align="right">Thao tác</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formik.values.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            disabled={isView}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                            disabled={isView}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            disabled={isView}
                          />
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
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Payment Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin thanh toán
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="deposit"
                    label="Tiền cọc"
                    type="number"
                    value={formik.values.deposit}
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldValue('remainingAmount', formik.values.total - Number(e.target.value));
                    }}
                    error={formik.touched.deposit && Boolean(formik.errors.deposit)}
                    helperText={formik.touched.deposit && formik.errors.deposit}
                    disabled={isView}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Còn lại"
                    value={formik.values.remainingAmount}
                    disabled
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tổng cộng"
                    value={formik.values.total}
                    disabled
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Order Status */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Trạng thái đơn hàng
              </Typography>
              <FormControl fullWidth disabled={isView}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <MenuItem value="pending">Chờ xử lý</MenuItem>
                  <MenuItem value="active">Đang thuê</MenuItem>
                  <MenuItem value="completed">Hoàn thành</MenuItem>
                  <MenuItem value="cancelled">Đã hủy</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText error>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Order Timeline */}
            {mode === 'view' && order?.timeline && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Lịch sử đơn hàng
                </Typography>
                <Timeline>
                  {order.timeline.map((event, index) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent color="text.secondary">
                        {new Date(event.time).toLocaleString('vi-VN')}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color={
                          event.status === 'completed' ? 'success' :
                          event.status === 'cancelled' ? 'error' :
                          'primary'
                        } />
                        {index < order.timeline.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">{event.status}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.description}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Grid>
            )}

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

      {!isView && (
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() => formik.handleSubmit()}
            startIcon={<Save />}
          >
            {mode === 'create' ? 'Tạo đơn hàng' : 'Cập nhật'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default OrderDialog; 
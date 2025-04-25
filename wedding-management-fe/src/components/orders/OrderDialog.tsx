import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Close,
  Delete as DeleteIcon,
  ContentCopy,
  Warning,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showToast } from '../common/Toast';
import CustomerSearch from './CustomerSearch';
import ProductSearch from './ProductSearch';
import { ORDER_STATUS } from '@/types/order';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  availableQuantity?: number;
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
  const isView = mode === 'view';
  const title = {
    create: 'Tạo đơn hàng mới',
    edit: 'Chỉnh sửa đơn hàng',
    view: 'Chi tiết đơn hàng',
  }[mode];

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
      const existingItemIndex = formik.values.items.findIndex(item => item.id === product._id);
      if (existingItemIndex !== -1) {
        const newItems = [...formik.values.items];
        const currentItem = newItems[existingItemIndex];
        const availableQuantity = product.quantity - product.quantityRented;
        if (currentItem.quantity < availableQuantity) {
          currentItem.quantity += 1;
          currentItem.subtotal = currentItem.quantity * currentItem.price;
          formik.setFieldValue('items', newItems);
          const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);
          formik.setFieldValue('total', total);
        } else {
          showToast.error('Số lượng sản phẩm trong kho không đủ');
        }
      } else {
        const availableQuantity = product.quantityAvailable;
        if (availableQuantity > 0) {
          const newItem: OrderItem = {
            id: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            subtotal: product.price,
            availableQuantity,
          };
          const newItems = [...formik.values.items, newItem];
          formik.setFieldValue('items', newItems);
          const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);
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

    if (value > (item.availableQuantity || 0)) {
      showToast.error('Số lượng sản phẩm trong kho không đủ');
      return;
    }

    item.quantity = value;
    item.subtotal = item.quantity * item.price;
    formik.setFieldValue('items', newItems);

    // Update total
    const total = newItems.reduce((sum, item) => sum + item.subtotal, 0);
    formik.setFieldValue('total', total);
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
            {/* Customer Search Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin khách hàng
              </Typography>
              <Stack spacing={2}>
                <CustomerSearch
                  onSelect={handleCustomerSelect}
                  disabled={isView}
                />
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
              </Stack>
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
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Chi tiết đơn hàng
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell align="right">Đơn giá</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                      <TableCell align="right">Thành tiền</TableCell>
                      {!isView && <TableCell align="right" />}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formik.values.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(item.price)}
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                            disabled={isView}
                            InputProps={{
                              inputProps: { min: 1, max: item.availableQuantity },
                            }}
                          />
                          {item.availableQuantity && item.quantity >= item.availableQuantity && (
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
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">
                            Chưa có sản phẩm nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
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

            {/* Order Dates */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Thông tin thời gian
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    selected={formik.values.date}
                    onChange={(newValue) => {
                      formik.setFieldValue('date', newValue);
                      // Ensure return date is not before the rental date
                      if (formik.values.returnDate < newValue) {
                        formik.setFieldValue('returnDate', newValue);
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày thuê"
                    disabled={isView}
                    className="form-control"
                    popperPlacement="bottom"
                    popperModifiers={{
                      preventOverflow: {
                        enabled: true,
                        options: {
                          padding: 10,
                        },
                      },
                    }}
                  />
                  <FormHelperText>Ngày bắt đầu thuê</FormHelperText>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    selected={formik.values.returnDate}
                    onChange={(newValue) => {
                      formik.setFieldValue('returnDate', newValue);
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày trả"
                    disabled={isView}
                    className="form-control"
                    popperPlacement="bottom"
                    popperModifiers={{
                      preventOverflow: {
                        enabled: true,
                        options: {
                          padding: 10,
                        },
                      },
                    }}
                  />
                  <FormHelperText>Ngày trả hàng</FormHelperText>
                </Grid>
              </Grid>
            </Grid>

            {/* Status */}
            {(mode === 'edit' || mode === 'view') && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    disabled={isView}
                    label="Trạng thái"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
  );
};

export default OrderDialog; 
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Tooltip,
  alpha,
  useTheme,
  Grid,
  InputAdornment,
  MenuItem,
  Grow,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Notes as NotesIcon,
  AttachMoney as MoneyIcon,
  ShoppingBag as OrderIcon,
  CheckCircle as SuccessIcon,
  Cancel as CancelIcon,
  Sort as SortIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { showToast } from '@/components/common/Toast';
import { CopyToClipboard } from 'react-copy-to-clipboard';

// Định nghĩa kiểu dữ liệu cho khách hàng
interface Customer {
  id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  address: string;
  note: string;
  totalSpent: number;
  totalOrders: number;
  successfulOrders: number;
  canceledOrders: number;
}

// Schema validation cho form
const schema = yup.object({
  customerCode: yup.string().required('Mã khách hàng là bắt buộc'),
  fullName: yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
  address: yup.string().required('Địa chỉ là bắt buộc'),
  note: yup.string(),
  totalSpent: yup
    .number()
    .min(0, 'Số tiền không thể âm')
    .typeError('Vui lòng nhập số'),
  totalOrders: yup
    .number()
    .min(0, 'Số đơn hàng không thể âm')
    .integer('Số đơn hàng phải là số nguyên')
    .typeError('Vui lòng nhập số'),
  successfulOrders: yup
    .number()
    .min(0, 'Số đơn thành công không thể âm')
    .integer('Số đơn thành công phải là số nguyên')
    .typeError('Vui lòng nhập số'),
  canceledOrders: yup
    .number()
    .min(0, 'Số đơn hủy không thể âm')
    .integer('Số đơn hủy phải là số nguyên')
    .typeError('Vui lòng nhập số'),
}).required();

// Dữ liệu mẫu
const sampleCustomers: Customer[] = [
  {
    id: '1',
    customerCode: 'KH001',
    fullName: 'Nguyễn Văn A',
    phone: '0123456789',
    address: 'Hà Nội',
    note: 'Khách hàng VIP',
    totalSpent: 15000000,
    totalOrders: 5,
    successfulOrders: 4,
    canceledOrders: 1,
  },
  // Thêm dữ liệu mẫu khác nếu cần
];

const CustomersPage: React.FC = () => {
  const theme = useTheme();
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      customerCode: '',
      fullName: '',
      phone: '',
      address: '',
      note: '',
      totalSpent: 0,
      totalOrders: 0,
      successfulOrders: 0,
      canceledOrders: 0,
    },
  });

  // Lọc khách hàng theo tìm kiếm
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  // Định nghĩa cột cho DataGrid
  const columns: GridColDef[] = [
    {
      field: 'customerCode',
      headerName: 'Mã KH',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <CopyToClipboard 
            text={params.value}
            onCopy={() => showToast.success('Đã sao chép mã khách hàng')}
          >
            <IconButton size="small" sx={{ ml: 1 }}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </CopyToClipboard>
        </Box>
      ),
    },
    {
      field: 'fullName',
      headerName: 'Họ và tên',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'phone',
      headerName: 'Số điện thoại',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          icon={<PhoneIcon />}
          label={params.value}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: 'address',
      headerName: 'Địa chỉ',
      flex: 1.5,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon color="action" fontSize="small" />
            <Typography variant="body2" noWrap>
              {params.value}
            </Typography>
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'totalSpent',
      headerName: 'Tổng chi tiêu',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}
        >
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(params.value)}
        </Typography>
      ),
    },
    {
      field: 'orderStats',
      headerName: 'Thống kê đơn hàng',
      flex: 1.5,
      renderCell: (params: GridRenderCellParams<any, Customer>) => (
        <Stack direction="row" spacing={1}>
          <Chip
            label={`Tổng: ${params.row.totalOrders}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`TC: ${params.row.successfulOrders}`}
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip
            label={`Hủy: ${params.row.canceledOrders}`}
            size="small"
            color="error"
            variant="outlined"
          />
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      renderCell: (params: GridRenderCellParams<any, Customer>) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row)}
              sx={{
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    reset(customer);
    setOpenDialog(true);
  };

  const handleDelete = (customer: Customer) => {
    setEditingCustomer(customer);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
    reset();
  };

  const onSubmit = (data: any) => {
    if (editingCustomer) {
      // Cập nhật khách hàng
      setCustomers(
        customers.map((c) => (c.id === editingCustomer.id ? { ...data, id: c.id } : c))
      );
      showToast.success('Cập nhật khách hàng thành công!');
    } else {
      // Thêm khách hàng mới
      setCustomers([...customers, { ...data, id: Date.now().toString() }]);
      showToast.success('Thêm khách hàng thành công!');
    }
    handleCloseDialog();
  };

  const handleConfirmDelete = () => {
    if (editingCustomer) {
      setCustomers(customers.filter((c) => c.id !== editingCustomer.id));
      showToast.success('Xóa khách hàng thành công!');
      setDeleteConfirmOpen(false);
      setEditingCustomer(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Quản lý khách hàng
        </Typography>
        <Typography variant="body2">
          Quản lý thông tin và theo dõi lịch sử giao dịch của khách hàng
        </Typography>
      </Card>

      {/* Toolbar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <TextField
            placeholder="Tìm kiếm khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              },
            }}
          >
            Thêm khách hàng
          </Button>
        </Stack>
      </Card>

      {/* Data Grid */}
      <Card sx={{ height: 'calc(100vh - 300px)' }}>
        <DataGrid
          rows={filteredCustomers}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderColor: alpha(theme.palette.divider, 0.1),
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1,
            },
          }}
        />
      </Card>

      {/* Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Grow}
      >
        <DialogTitle>
          {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="customerCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mã khách hàng"
                      fullWidth
                      error={!!errors.customerCode}
                      helperText={errors.customerCode?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Họ và tên"
                      fullWidth
                      error={!!errors.fullName}
                      helperText={errors.fullName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Số điện thoại"
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Địa chỉ"
                      fullWidth
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ghi chú"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.note}
                      helperText={errors.note?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="totalSpent"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tổng chi tiêu"
                      fullWidth
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">₫</InputAdornment>
                        ),
                      }}
                      error={!!errors.totalSpent}
                      helperText={errors.totalSpent?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="totalOrders"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tổng số đơn"
                      fullWidth
                      type="number"
                      error={!!errors.totalOrders}
                      helperText={errors.totalOrders?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="successfulOrders"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Số đơn thành công"
                      fullWidth
                      type="number"
                      error={!!errors.successfulOrders}
                      helperText={errors.successfulOrders?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="canceledOrders"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Số đơn hủy"
                      fullWidth
                      type="number"
                      error={!!errors.canceledOrders}
                      helperText={errors.canceledOrders?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            }}
          >
            {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        TransitionComponent={Grow}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa khách hàng{' '}
            <strong>{editingCustomer?.fullName}</strong> không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            startIcon={<DeleteIcon />}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomersPage; 
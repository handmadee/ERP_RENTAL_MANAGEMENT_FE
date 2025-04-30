import React, { useState, useMemo, useEffect } from 'react';
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
  Visibility as VisibilityIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { showToast } from '@/components/common/Toast';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { customerService, Customer as CustomerType, translateOrderStatus } from '@/services/customerService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Update the Customer interface to match the API
interface Customer {
  _id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  address: string;
  note?: string;
  createdAt: string;
  totalSpent: number;
  orderStats: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  status: string;
  email?: string;
}

interface Order {
  _id: string;
  orderCode: string;
  status: string;
  total: number;
  orderDate: string;
  returnDate: string;
  items: Array<{
    costumeId: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

interface CustomerDetails extends Customer {
  orders: Order[];
}

// Schema validation cho form
const schema = yup.object({
  fullName: yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
  address: yup
    .string()
    .required('Địa chỉ là bắt buộc'),
  note: yup
    .string()
    .nullable(),
  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Trạng thái không hợp lệ')
    .default('active'),
}).required();


const CustomersPage: React.FC = () => {
  const theme = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<CustomerDetails | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      note: '',
      status: 'active'
    },
  });

  // Load customers
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomers({
        page,
        limit: pageSize,
        search: searchQuery,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setCustomers(response.data);
      setTotalCustomers(response.metadata.total);
    } catch (error: any) {
      showToast.error(error?.response?.data?.message || 'Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page, pageSize, searchQuery]);

  // Add function to load customer details
  const loadCustomerDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await customerService.getCustomerOrders(id);
      setViewCustomer(response.data);
      setViewDialogOpen(true);
    } catch (error: any) {
      showToast.error(error?.response?.data?.message || 'Không thể tải thông tin chi tiết khách hàng');
    } finally {
      setLoading(false);
    }
  };

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
            label={`Tổng: ${params.row.orderStats.total}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`TC: ${params.row.orderStats.completed}`}
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip
            label={`Hủy: ${params.row.orderStats.cancelled}`}
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
      width: 160,
      renderCell: (params: GridRenderCellParams<any, Customer>) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              onClick={() => loadCustomerDetails(params.row._id)}
              sx={{
                color: theme.palette.info.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
    reset({
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      note: customer.note || '',
      status: (customer.status || 'active') as 'active' | 'inactive'
    });
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

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (editingCustomer) {
        // Update customer
        const updateData = {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          note: data.note,
          status: data.status,
        };
        const response = await customerService.updateCustomer(editingCustomer._id, updateData);
        if (response.success) {
          showToast.success('Cập nhật khách hàng thành công!');
          loadCustomers(); // Reload the list
          handleCloseDialog();
        }
      } else {
        // Create new customer
        await customerService.createCustomer(data);
        showToast.success('Thêm khách hàng thành công!');
        loadCustomers(); // Reload the list
        handleCloseDialog();
      }
    } catch (error: any) {
      showToast.error(error?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (editingCustomer) {
      try {
        setLoading(true);
        await customerService.deleteCustomer(editingCustomer._id);
        showToast.success('Xóa khách hàng thành công!');
        loadCustomers(); // Reload the list
        setDeleteConfirmOpen(false);
        setEditingCustomer(null);
      } catch (error: any) {
        showToast.error(error?.response?.data?.message || 'Không thể xóa khách hàng');
      } finally {
        setLoading(false);
      }
    }
  };

  // Add Customer Details Dialog
  const CustomerDetailsDialog = () => (
    <Dialog
      open={viewDialogOpen}
      onClose={() => setViewDialogOpen(false)}
      maxWidth="md"
      fullWidth
      TransitionComponent={Grow}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <VisibilityIcon color="primary" />
          <Typography variant="h6">Chi tiết khách hàng</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {viewCustomer && (
          <Box>
            {/* Thông tin cơ bản */}
            <Card sx={{ mb: 3, p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Mã khách hàng
                      </Typography>
                      <Typography variant="body1">{viewCustomer.customerCode}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Họ và tên
                      </Typography>
                      <Typography variant="body1">{viewCustomer.fullName}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1">{viewCustomer.phone}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tổng chi tiêu
                      </Typography>
                      <Typography variant="body1" color="success.main" fontWeight="bold">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(viewCustomer.totalSpent)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Card>

            {/* Thống kê đơn hàng */}
            <Card sx={{ mb: 3, p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thống kê đơn hàng
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <TimelineIcon color="primary" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Tổng đơn hàng
                        </Typography>
                        <Typography variant="h6">{viewCustomer.orderStats.total}</Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <SuccessIcon color="success" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Hoàn thành
                        </Typography>
                        <Typography variant="h6">{viewCustomer.orderStats.completed}</Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <CancelIcon color="error" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Đã hủy
                        </Typography>
                        <Typography variant="h6">{viewCustomer.orderStats.cancelled}</Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            </Card>

            {/* Danh sách đơn hàng */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Đơn hàng gần đây
              </Typography>
              <Stack spacing={2}>
                {viewCustomer.orders
                  .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
                  .map((order) => (
                    <Card
                      key={order.orderCode}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Mã đơn hàng
                          </Typography>
                          <Typography variant="body2">{order.orderCode}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Ngày đặt
                          </Typography>
                          <Typography variant="body2">
                            {format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Tổng tiền
                          </Typography>
                          <Typography variant="body2" color="success.main" fontWeight="bold">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(order.total)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Chip
                            label={translateOrderStatus(order.status)}
                            color={
                              order.status === 'completed'
                                ? 'success'
                                : order.status === 'cancelled'
                                  ? 'error'
                                  : 'primary'
                            }
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
              </Stack>
            </Card>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );

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
          rows={customers}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          rowCount={totalCustomers}
          pageSizeOptions={[10, 25, 50]}
          paginationMode="server"
          paginationModel={{
            page: page - 1,
            pageSize: pageSize,
          }}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            setPageSize(model.pageSize);
          }}
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
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Trạng thái"
                      fullWidth
                      error={!!errors.status}
                      helperText={errors.status?.message}
                    >
                      <MenuItem value="active">Hoạt động</MenuItem>
                      <MenuItem value="inactive">Không hoạt động</MenuItem>
                    </TextField>
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

      {/* Add CustomerDetailsDialog */}
      <CustomerDetailsDialog />
    </Box>
  );
};

export default CustomersPage; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Chip,
  Typography,
  Stack,
  MenuItem,
  Menu,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert,
  Visibility,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assignment,
  LocalOffer,
  Assessment,
  Event,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { showToast } from '@/components/common/Toast';
import OrderDialog, { Order } from '@/components/orders/OrderDialog';

interface Order {
  id?: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'completed' | 'cancelled';
  orderDate: string;
  totalAmount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-2023001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0123456789',
    customerEmail: 'nguyenvana@example.com',
    date: '2023-12-01',
    status: 'active',
    total: 4990000,
    items: [
      {
        id: 'ITEM001',
        name: 'Váy cưới công chúa',
        price: 2990000,
        quantity: 1,
        subtotal: 2990000
      },
      {
        id: 'ITEM002',
        name: 'Áo dài cưới',
        price: 2000000,
        quantity: 1,
        subtotal: 2000000
      }
    ],
    deposit: 2000000,
    remainingAmount: 2990000,
    note: 'Khách hẹn thử đồ vào tuần sau',
    timeline: [
      {
        time: '2023-12-01T09:00:00',
        status: 'created',
        description: 'Tạo đơn hàng'
      },
      {
        time: '2023-12-01T10:00:00',
        status: 'active',
        description: 'Đã xác nhận và đặt cọc'
      }
    ]
  },
  {
    id: 'ORD-2023002',
    customerName: 'Trần Thị B',
    customerPhone: '0987654321',
    customerEmail: 'tranthib@example.com',
    date: '2023-12-02',
    status: 'completed',
    total: 2990000,
    items: [
      {
        id: 'ITEM003',
        name: 'Váy phụ dâu',
        price: 2990000,
        quantity: 1,
        subtotal: 2990000
      }
    ],
    deposit: 2990000,
    remainingAmount: 0,
    note: 'Đã hoàn thành và trả đồ',
    timeline: [
      {
        time: '2023-12-02T09:00:00',
        status: 'created',
        description: 'Tạo đơn hàng'
      },
      {
        time: '2023-12-02T10:00:00',
        status: 'completed',
        description: 'Hoàn thành đơn hàng'
      }
    ]
  }
];

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
  active: 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  active: 'warning',
  completed: 'success',
  pending: 'info',
  cancelled: 'error',
};

const OrdersPage: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedOrderData, setSelectedOrderData] = useState<Order | undefined>();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilterChange = (status: string | null) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, order: Order) => {
    setSelectedOrder(order);
    setSelectedOrderData(order);
    setActionAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setSelectedOrder(null);
    setActionAnchorEl(null);
  };

  const handleCreateOrder = () => {
    setDialogMode('create');
    setSelectedOrderData(undefined);
    setOpenDialog(true);
  };

  const handleViewOrder = () => {
    setDialogMode('view');
    setOpenDialog(true);
    handleActionClose();
  };

  const handleEditClick = (order: Order) => {
    if (order?.id) {
      setSelectedOrder(order);
      setDialogMode('edit');
      setOpenDialog(true);
      handleActionClose();
    }
  };

  const handleDeleteOrder = () => {
    showToast.error('Đã xóa đơn hàng ' + selectedOrder?.id);
    handleActionClose();
  };

  const handleSubmitOrder = (values: Order) => {
    if (dialogMode === 'create') {
      // Handle create order
      console.log('Create order:', values);
    } else {
      // Handle update order
      console.log('Update order:', values);
    }
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={4}
        >
          <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
            Quản lý đơn hàng
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOrder}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
            }}
          >
            Tạo đơn hàng
          </Button>
        </Stack>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                }}
              >
                <Assignment />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Tổng số đơn hàng
                </Typography>
                <Typography variant="h5">{mockOrders.length}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  color: theme.palette.warning.main,
                }}
              >
                <LocalOffer />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Đơn chờ xử lý
                </Typography>
                <Typography variant="h5">
                  {mockOrders.filter((order) => order.status === 'pending').length}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  color: theme.palette.success.main,
                }}
              >
                <Assessment />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Doanh thu tháng
                </Typography>
                <Typography variant="h5">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(
                    mockOrders
                      .filter((order) => order.status === 'completed')
                      .reduce((sum, order) => sum + order.total, 0)
                  )}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  color: theme.palette.error.main,
                }}
              >
                <Event />
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Đơn hủy
                </Typography>
                <Typography variant="h5">
                  {mockOrders.filter((order) => order.status === 'cancelled').length}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <Box sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} width={{ xs: '100%', sm: 'auto' }}>
                <TextField
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: { xs: '100%', sm: 300 } }}
                />
                <Button
                  color="inherit"
                  startIcon={<FilterIcon />}
                  onClick={handleFilterClick}
                  sx={{
                    borderRadius: 2,
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  {statusFilter ? statusLabels[statusFilter] : 'Tất cả'}
                </Button>
              </Stack>
            </Stack>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Ngày đặt</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Tổng tiền</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2">{order.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          alt={order.customerName}
                          sx={{
                            bgcolor: theme.palette.primary.main,
                          }}
                        >
                          {order.customerName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {order.customerName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {order.items.length} sản phẩm
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {new Date(order.date).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[order.status]}
                        color={statusColors[order.status]}
                        size="small"
                        sx={{
                          minWidth: 100,
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.total)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionClick(e, order)}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Hiển thị"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count}`
            }
          />
        </Card>
      </motion.div>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        TransitionComponent={Fade}
      >
        <MenuItem
          selected={!statusFilter}
          onClick={() => handleStatusFilterChange(null)}
        >
          Tất cả trạng thái
        </MenuItem>
        <MenuItem
          selected={statusFilter === 'active'}
          onClick={() => handleStatusFilterChange('active')}
        >
          Đang thực hiện
        </MenuItem>
        <MenuItem
          selected={statusFilter === 'completed'}
          onClick={() => handleStatusFilterChange('completed')}
        >
          Hoàn thành
        </MenuItem>
        <MenuItem
          selected={statusFilter === 'pending'}
          onClick={() => handleStatusFilterChange('pending')}
        >
          Chờ xử lý
        </MenuItem>
        <MenuItem
          selected={statusFilter === 'cancelled'}
          onClick={() => handleStatusFilterChange('cancelled')}
        >
          Đã hủy
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={handleViewOrder}>
          <Visibility fontSize="small" sx={{ mr: 2 }} />
          Xem chi tiết
        </MenuItem>
        <MenuItem onClick={() => selectedOrder && handleEditClick(selectedOrder)}>
          <EditIcon fontSize="small" sx={{ mr: 2 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleDeleteOrder} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 2 }} />
          Xóa
        </MenuItem>
      </Menu>

      <OrderDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        order={selectedOrderData}
        mode={dialogMode}
        onSubmit={handleSubmitOrder}
      />
    </Box>
  );
};

export default OrdersPage; 
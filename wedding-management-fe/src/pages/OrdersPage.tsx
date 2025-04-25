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
  Tooltip,
  CircularProgress,
  Alert,
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
  ContentCopy,
  Warning,
  Inbox as InboxIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { showToast } from '@/components/common/Toast';
import OrderDialog, { Order as DialogOrder } from '@/components/orders/OrderDialog';
import * as Yup from 'yup';
import orderService from '@/services/orderService';
import { Order as BackendOrder, OrderFilters, ORDER_STATUS } from '@/types/order';
import { CreateOrderDTO, UpdateOrderDTO } from '@/types/order';

const statusLabels: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Chờ xử lý',
  [ORDER_STATUS.ACTIVE]: 'Đang thực hiện',
  [ORDER_STATUS.COMPLETED]: 'Hoàn thành',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
};

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  [ORDER_STATUS.ACTIVE]: 'warning',
  [ORDER_STATUS.COMPLETED]: 'success',
  [ORDER_STATUS.PENDING]: 'info',
  [ORDER_STATUS.CANCELLED]: 'error',
};

const validationSchema = Yup.object({
  returnDate: Yup.string()
    .required('Ngày trả là bắt buộc')
    .test('is-after-date', 'Ngày trả phải sau ngày thuê', function (value) {
      const { orderDate } = this.parent;
      if (!orderDate || !value) return true;
      return new Date(value) > new Date(orderDate);
    }),
});

interface OrderStats {
  summary: {
    totalOrders: number;
    pendingOrders: number;
    activeOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    monthlyRevenue: number;
    avgOrderValue: number;
    depositCollectionRate: string;
  };
  performance: {
    orderCompletion: {
      completed: number;
      total: number;
      rate: string;
    };
    financials: {
      totalRevenue: number;
      collectedAmount: number;
      pendingAmount: number;
      avgOrderValue: number;
    };
    customerMetrics: {
      topCustomers: Array<{
        customerInfo: {
          customerCode: string;
          fullName: string;
          phone: string;
          address?: string;
          note?: string;
        };
        orderCount: number;
        totalSpent: number;
        avgOrderValue: number;
        lastOrderDate: string;
      }>;
      topCostumes: Array<{
        rentCount: number;
        revenue: number;
        avgPrice: number;
      }>;
    };
  };
  trends: {
    daily: Array<{
      date: string;
      revenue: number;
      orders: number;
      deposits: number;
      pending: number;
    }>;
    weekly: Array<{
      period: string;
      orderCount: number;
      revenue: number;
      avgOrderValue: number;
    }>;
    monthly: Array<{
      period: string;
      orderCount: number;
      revenue: number;
      avgOrderValue: number;
    }>;
  };
  recentOrders: Array<{
    orderCode: string;
    customerName: string;
    customerPhone: string;
    orderDate: string;
    returnDate: string;
    status: string;
    total: number;
    deposit: number;
    remainingAmount: number;
    items: number;
    createdBy: string;
  }>;
}

interface OrderDetailsResponse {
  orderDetails: {
    _id: string;
    orderCode: string;
    customerId: {
      customerCode: string;
      fullName: string;
      phone: string;
      email?: string;
      address?: string;
    };
    items: Array<{
      costumeCode: string;
      costumeName: string;
      quantity: number;
      price: number;
      subtotal: number;
      availability: {
        total: number;
        available: number;
        rented: number;
        percentageRented: string;
      };
    }>;
    total: number;
    deposit: number;
    remainingAmount: number;
    status: string;
    orderDate: string;
    returnDate: string;
  };
}

const convertToDialogOrder = (order: BackendOrder): DialogOrder => ({
  id: order._id,
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  customerEmail: order.customerEmail || '',
  date: order.orderDate,
  returnDate: order.returnDate,
  status: order.status,
  items: order.items.map(item => ({
    id: item.costumeId,
    name: '', // This will need to be filled with actual costume name
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal
  })),
  total: order.total,
  deposit: order.deposit,
  remainingAmount: order.remainingAmount,
  note: order.note || '',
  timeline: order.timeline?.map(t => ({
    time: t.date,
    status: t.status,
    description: t.note
  }))
});

const convertToBackendOrder = (order: DialogOrder): Partial<BackendOrder> => ({
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  customerEmail: order.customerEmail,
  orderDate: order.date,
  returnDate: order.returnDate,
  status: order.status,
  items: order.items.map(item => ({
    costumeId: item.id,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.subtotal
  })),
  total: order.total,
  deposit: order.deposit,
  remainingAmount: order.remainingAmount,
  note: order.note
});

const convertToOrder = (orderDetails: OrderDetailsResponse['orderDetails']): BackendOrder => ({
  _id: orderDetails._id,
  orderCode: orderDetails.orderCode,
  customerName: orderDetails.customerId.fullName,
  customerPhone: orderDetails.customerId.phone,
  customerEmail: orderDetails.customerId.email,
  address: orderDetails.customerId.address,
  orderDate: orderDetails.orderDate,
  returnDate: orderDetails.returnDate,
  items: orderDetails.items.map(item => ({
    costumeId: item.costumeCode,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.subtotal
  })),
  total: orderDetails.total,
  deposit: orderDetails.deposit,
  remainingAmount: orderDetails.remainingAmount,
  status: orderDetails.status as BackendOrder['status'],
  timeline: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const convertToCreateDTO = (order: DialogOrder): CreateOrderDTO => ({
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  customerEmail: order.customerEmail,
  orderDate: order.date,
  returnDate: order.returnDate,
  items: order.items.map(item => ({
    costumeId: item.id,
    quantity: item.quantity,
    price: item.price
  })),
  total: order.total,
  deposit: order.deposit,
  remainingAmount: order.remainingAmount,
  note: order.note,
  status: order.status
});

const convertToUpdateDTO = (order: DialogOrder): UpdateOrderDTO => ({
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  orderDate: order.date,
  returnDate: order.returnDate,
  status: order.status,
  deposit: order.deposit,
  note: order.note
});

const OrdersPage: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ORDER_STATUS | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<OrderStats>({
    summary: {
      totalOrders: 0,
      pendingOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      monthlyRevenue: 0,
      avgOrderValue: 0,
      depositCollectionRate: '0',
    },
    performance: {
      orderCompletion: {
        completed: 0,
        total: 0,
        rate: '0',
      },
      financials: {
        totalRevenue: 0,
        collectedAmount: 0,
        pendingAmount: 0,
        avgOrderValue: 0,
      },
      customerMetrics: {
        topCustomers: [],
        topCostumes: [],
      },
    },
    trends: {
      daily: [],
      weekly: [],
      monthly: [],
    },
    recentOrders: [],
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const filters: OrderFilters = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter || undefined
      };
      const response = await orderService.getOrders(filters);
      setOrders(response.data);
      setTotalOrders(response.total);
    } catch (error) {
      showToast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await orderService.getOrderStats();
      console.log("🚀 ~ fetchStats ~ response:", response)
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showToast.error('Không thể tải thống kê đơn hàng');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

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

  const handleStatusFilterChange = (status: ORDER_STATUS | null) => {
    setStatusFilter(status);
    setPage(0);
    handleFilterClose();
  };

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, order: BackendOrder) => {
    setSelectedOrder(order);
    setActionAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setSelectedOrder(null);
    setActionAnchorEl(null);
  };

  const handleCreateOrder = () => {
    setDialogMode('create');
    setSelectedOrder(null);
    setOpenDialog(true);
  };

  const handleViewOrder = async () => {
    if (selectedOrder?._id) {
      try {
        const orderDetails = await orderService.getOrderById(selectedOrder._id);
        console.log("🚀 ~ handleViewOrder ~ orderDetails:", orderDetails)
        setSelectedOrder(convertToOrder(orderDetails.orderDetails));
        setDialogMode('view');
        setOpenDialog(true);
      } catch (error) {
        showToast.error('Không thể tải thông tin đơn hàng');
      }
    }
    handleActionClose();
  };

  const handleEditOrder = async () => {
    if (selectedOrder?._id) {
      try {
        const orderDetails = await orderService.getOrderById(selectedOrder._id);
        setSelectedOrder(convertToOrder(orderDetails.orderDetails));
        setDialogMode('edit');
        setOpenDialog(true);
      } catch (error) {
        showToast.error('Không thể tải thông tin đơn hàng');
      }
    }
    handleActionClose();
  };

  const handleDeleteOrder = async () => {
    if (selectedOrder?._id) {
      try {
        await orderService.deleteOrder(selectedOrder._id);
        showToast.success('Xóa đơn hàng thành công');
        fetchOrders();
        fetchStats();
      } catch (error) {
        showToast.error('Không thể xóa đơn hàng');
      }
    }
    handleActionClose();
  };

  const handleSubmitOrder = async (values: DialogOrder) => {
    try {
      if (dialogMode === 'create') {
        await orderService.createOrder(convertToCreateDTO(values));
        showToast.success('Tạo đơn hàng thành công');
      } else if (dialogMode === 'edit' && selectedOrder?._id) {
        await orderService.updateOrder(selectedOrder._id, convertToUpdateDTO(values));
        showToast.success('Cập nhật đơn hàng thành công');
      }
      setOpenDialog(false);
      fetchOrders();
      fetchStats();
    } catch (error) {
      showToast.error('Có lỗi xảy ra khi xử lý đơn hàng');
    }
  };

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
                {statsLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    <Typography variant="h5">
                      {stats?.summary?.totalOrders || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Giá trị TB: {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(stats?.summary?.avgOrderValue || 0)}
                    </Typography>
                  </>
                )}
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
                {statsLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    <Typography variant="h5">
                      {stats?.summary?.pendingOrders || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hoàn thành: {stats?.performance?.orderCompletion?.rate || '0'}%
                    </Typography>
                  </>
                )}
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
                {statsLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    <Typography variant="h5">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(stats?.summary?.monthlyRevenue || 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Thu cọc: {stats?.summary?.depositCollectionRate || '0'}%
                    </Typography>
                  </>
                )}
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
                {statsLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    <Typography variant="h5">
                      {stats?.summary?.cancelledOrders || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Đang hoạt động: {stats?.summary?.activeOrders || 0}
                    </Typography>
                  </>
                )}
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
                  <TableCell>Ngày thuê</TableCell>
                  <TableCell>Ngày trả</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Tổng tiền</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow
                      key={order._id}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                        ...(order.status === ORDER_STATUS.ACTIVE && new Date(order.returnDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && {
                          backgroundColor: alpha(theme.palette.warning.main, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.warning.main, 0.2),
                          },
                        }),
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2">{order.orderCode}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(order.orderCode);
                              showToast.success('Đã sao chép mã đơn hàng');
                            }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Stack>
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
                        {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {new Date(order.returnDate).toLocaleDateString('vi-VN')}
                          {order.status === ORDER_STATUS.ACTIVE && new Date(order.returnDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                            <Tooltip title="Sắp đến hạn trả">
                              <Warning fontSize="small" color="warning" />
                            </Tooltip>
                          )}
                        </Stack>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <InboxIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          Không có đơn hàng nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {searchTerm || statusFilter
                            ? 'Không tìm thấy đơn hàng nào phù hợp với điều kiện tìm kiếm'
                            : 'Chưa có đơn hàng nào được tạo'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {orders && orders.length > 0 && (
            <TablePagination
              component="div"
              count={totalOrders}
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
          )}
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
          selected={statusFilter === ORDER_STATUS.ACTIVE}
          onClick={() => handleStatusFilterChange(ORDER_STATUS.ACTIVE)}
        >
          Đang thực hiện
        </MenuItem>
        <MenuItem
          selected={statusFilter === ORDER_STATUS.COMPLETED}
          onClick={() => handleStatusFilterChange(ORDER_STATUS.COMPLETED)}
        >
          Hoàn thành
        </MenuItem>
        <MenuItem
          selected={statusFilter === ORDER_STATUS.PENDING}
          onClick={() => handleStatusFilterChange(ORDER_STATUS.PENDING)}
        >
          Chờ xử lý
        </MenuItem>
        <MenuItem
          selected={statusFilter === ORDER_STATUS.CANCELLED}
          onClick={() => handleStatusFilterChange(ORDER_STATUS.CANCELLED)}
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
        <MenuItem onClick={handleEditOrder}>
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
        order={selectedOrder ? convertToDialogOrder(selectedOrder) : undefined}
        mode={dialogMode}
        onSubmit={handleSubmitOrder}
      />
    </Box>
  );
};

export default OrdersPage; 
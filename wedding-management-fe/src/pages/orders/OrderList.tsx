import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    TextField,
    Box,
    Typography,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import orderService from '../../services/orderService';
import type { Order } from '../../types/order';
import { ORDER_STATUS } from '../../types/order';
import { format } from 'date-fns';
import { OrderForm } from '../../components/orders/OrderForm';

export default function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [openForm, setOpenForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getOrders({
                page,
                limit,
                search,
                status: status as ORDER_STATUS,
            });
            setOrders(response.data);
            setTotal(response.total);
        } catch (err) {
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, search, status]);

    const handleEdit = (order: Order) => {
        setSelectedOrder(order);
        setOpenForm(true);
    };

    const handleDelete = async () => {
        if (!selectedOrder) return;
        try {
            await orderService.deleteOrder(selectedOrder._id);
            setSuccessMessage('Order deleted successfully');
            fetchOrders();
            setOpenDelete(false);
        } catch (err) {
            setError('Failed to delete order');
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (selectedOrder) {
                const orderData = {
                    ...data,
                    orderDate: data.orderDate instanceof Date ? data.orderDate.toISOString() : data.orderDate,
                    returnDate: data.returnDate instanceof Date ? data.returnDate.toISOString() : data.returnDate
                };
                await orderService.updateOrder(selectedOrder._id, orderData);
                setSuccessMessage('Order updated successfully');
            } else {
                const orderData = {
                    ...data,
                    orderDate: data.orderDate instanceof Date ? data.orderDate.toISOString() : data.orderDate,
                    returnDate: data.returnDate instanceof Date ? data.returnDate.toISOString() : data.returnDate
                };
                await orderService.createOrder(orderData);
                setSuccessMessage('Order created successfully');
            }
            setOpenForm(false);
            fetchOrders();
        } catch (err) {
            setError('Failed to save order');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case ORDER_STATUS.PENDING:
                return 'warning';
            case ORDER_STATUS.ACTIVE:
                return 'info';
            case ORDER_STATUS.COMPLETED:
                return 'success';
            case ORDER_STATUS.CANCELLED:
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Orders
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setSelectedOrder(null);
                        setOpenForm(true);
                    }}
                >
                    Add Order
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    placeholder="Search orders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flexGrow: 1, maxWidth: 500 }}
                />
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={status}
                        label="Status"
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        {Object.values(ORDER_STATUS).map((status) => (
                            <MenuItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order Code</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Order Date</TableCell>
                            <TableCell>Return Date</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order._id}>
                                <TableCell>{order.orderCode}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell>{format(new Date(order.orderDate), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{format(new Date(order.returnDate), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>${order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        color={getStatusColor(order.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(order)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setOpenDelete(true);
                                        }}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
                <DialogTitle>{selectedOrder ? 'Edit Order' : 'Add Order'}</DialogTitle>
                <DialogContent>
                    <OrderForm
                        initialData={selectedOrder}
                        onSubmit={handleSave}
                        onCancel={() => setOpenForm(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Delete Order</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this order?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity="error">{error}</Alert>
            </Snackbar>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity="success">{successMessage}</Alert>
            </Snackbar>
        </Box>
    );
} 
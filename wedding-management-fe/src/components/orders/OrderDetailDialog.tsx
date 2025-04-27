import React, { useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Stack,
    IconButton,
    Box,
    Grid,
    Paper,
    Chip,
    CircularProgress,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    alpha,
    Alert,
    AlertTitle,
    Radio,
    RadioGroup,
    FormControl,
    FormControlLabel,
    TextField,
    LinearProgress,
    Skeleton,
    Divider,
    Avatar,
    Tooltip,
    Badge,
} from '@mui/material';
import {
    Close,
    Receipt,
    LocalShipping,
    AssignmentTurnedIn,
    Cancel,
    Payment,
    CalendarToday,
    Warning,
    Edit,
    Inventory,
    Person,
    Phone,
    Home,
    Tag,
    EmojiEvents,
    AttachMoney,
    Schedule,
    FiberNew,
    Group,
    EventNote,
    Cached,
    Info,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { ORDER_STATUS } from '@/types/order';
import { getStatusColor, getStatusLabel } from '@/theme/ThemeFallback';
import { Order } from '../../types/order';

// Helper functions for customer loyalty level
const getLoyaltyLevel = (orderCount: number): string => {
    if (orderCount >= 10) return 'Khách hàng VIP';
    if (orderCount >= 5) return 'Khách hàng thân thiết';
    if (orderCount >= 3) return 'Khách hàng thường xuyên';
    if (orderCount >= 1) return 'Khách hàng quen';
    return 'Khách hàng mới';
};

const getLoyaltyColor = (
    orderCount: number,
    theme?: any
): 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (orderCount >= 10) return 'error'; // VIP color
    if (orderCount >= 5) return 'warning'; // Gold color
    if (orderCount >= 3) return 'success'; // Regular color
    if (orderCount >= 1) return 'info'; // New recurring color
    return 'primary';
};

const getLoyaltyDescription = (orderCount: number): string => {
    if (orderCount >= 10) return 'Khách hàng đã đặt 10+ đơn hàng. Cần được chăm sóc đặc biệt và ưu đãi tốt nhất.';
    if (orderCount >= 5) return 'Khách hàng đã đặt 5+ đơn hàng. Xứng đáng nhận được ưu đãi đặc biệt.';
    if (orderCount >= 3) return 'Khách hàng đã đặt 3+ đơn hàng. Nên cung cấp dịch vụ ưu tiên.';
    if (orderCount >= 1) return 'Khách hàng đã đặt hàng trước đây. Nên cung cấp dịch vụ tận tâm.';
    return 'Đây là đơn hàng đầu tiên của khách. Cần tạo ấn tượng tốt.';
};

interface OrderDetailDialogProps {
    open: boolean;
    onClose: () => void;
    order?: Order & {
        orderCode?: string;
        timeline?: Array<{
            date: string;
            status: string;
            note?: string;
        }>;
        rentalDuration?: number;
        daysUntilReturn?: number;
        isOverdue?: boolean;
        paymentStatus?: string;
        paymentPercentage?: number;
        createdBy?: string;
        isNewCustomer?: boolean;
        customerTotalOrders?: number;
        customerHistory?: {
            previousOrders: Array<{
                _id: string;
                orderCode: string;
                orderDate: string;
                total: number;
                status: string;
            }>;
            totalOrders: number;
            isReturningCustomer: boolean;
        };
    };
    onStatusUpdate?: (status: string, data: any) => Promise<void>;
    loading?: boolean;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
    open,
    onClose,
    order,
    onStatusUpdate,
    loading,
}) => {
    const theme = useTheme();
    const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
    const [selectedStatus, setSelectedStatus] = React.useState('');
    const [statusNote, setStatusNote] = React.useState('');
    const [isFullyPaid, setIsFullyPaid] = React.useState(false);
    const [returnedOnTime, setReturnedOnTime] = React.useState(true);
    const [statusLoading, setStatusLoading] = React.useState(false);
    const [localLoading, setLocalLoading] = React.useState(true);

    const formattedItems = useMemo(() => {
        if (!order?.items) return [];
        return order.items.map(item => ({
            ...item,
            name: (item as any).name || 'Không có tên',
            imageUrl: (item as any).imageUrl || '',
            code: (item as any).code || '',
            category: (item as any).category || '',
            size: (item as any).size || '',
            availability: (item as any).availability || null,
        }));
    }, [order?.items]);
    React.useEffect(() => {
        if (open && !loading) {
            const timer = setTimeout(() => {
                setLocalLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setLocalLoading(true);
        }
    }, [open, loading]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch (error) {
            console.error('Invalid date:', dateString, error);
            return 'Không hợp lệ';
        }
    };

    const handleStatusUpdate = async () => {
        if (!onStatusUpdate || !selectedStatus) return;

        setStatusLoading(true);
        try {
            await onStatusUpdate(selectedStatus, {
                note: statusNote,
                isFullyPaid: selectedStatus === ORDER_STATUS.COMPLETED ? isFullyPaid : undefined,
                returnedOnTime: selectedStatus === ORDER_STATUS.COMPLETED ? returnedOnTime : undefined,
            });
            setStatusDialogOpen(false);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setStatusLoading(false);
        }
    };

    if (!order) return null;

    return (
        <ThemeProvider theme={theme}>
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
                            <Typography variant="h6">Chi tiết đơn hàng </Typography>
                            {order.orderCode && (
                                <Chip
                                    label={order.orderCode}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                />
                            )}
                        </Stack>
                        <IconButton onClick={onClose} size="small">
                            <Close />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers>
                    {loading || localLoading ? (
                        <Box sx={{ py: 3 }}>
                            <Stack spacing={3}>
                                <Skeleton variant="rectangular" height={120} />
                                <Skeleton variant="rectangular" height={100} />
                                <Stack spacing={2}>
                                    <Skeleton variant="rectangular" height={160} />
                                    <Skeleton variant="rectangular" height={160} />
                                </Stack>
                            </Stack>
                        </Box>
                    ) : (
                        <Stack spacing={3}>
                            {/* Order Status and Info */}
                            <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Receipt fontSize="small" color="primary" />
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Thông tin đơn hàng
                                        </Typography>
                                    </Stack>
                                    <Chip
                                        label={getStatusLabel(order.status)}
                                        color={order.status === ORDER_STATUS.COMPLETED ? 'success' :
                                            order.status === ORDER_STATUS.CANCELLED ? 'error' :
                                                order.status === ORDER_STATUS.ACTIVE ? 'warning' : 'info'}
                                        size="small"
                                    />
                                </Stack>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={3}>
                                        <Typography variant="body2" color="text.secondary">Ngày đặt hàng</Typography>
                                        <Typography variant="body1">
                                            {order.orderDate ? formatDate(order.orderDate) : '-'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Typography variant="body2" color="text.secondary">Ngày trả</Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography variant="body1">
                                                {order.returnDate ? formatDate(order.returnDate) : '-'}
                                            </Typography>
                                            {order.isOverdue && <Warning color="error" fontSize="small" />}
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Typography variant="body2" color="text.secondary">Thời gian thuê</Typography>
                                        <Typography variant="body1">{order.rentalDuration || 0} ngày</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Typography variant="body2" color="text.secondary">Người tạo đơn</Typography>
                                        <Typography variant="body1">{order.createdBy || '-'}</Typography>
                                    </Grid>
                                </Grid>

                                {/* Payment Status */}
                                {order.paymentStatus && (
                                    <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Payment fontSize="small" />
                                                <Typography variant="body1">{order.paymentStatus}</Typography>
                                            </Stack>
                                            {order.paymentPercentage !== undefined && (
                                                <Chip
                                                    label={`${order.paymentPercentage}% đã thanh toán`}
                                                    color={order.remainingAmount > 0 ? 'warning' : 'success'}
                                                    size="small"
                                                />
                                            )}
                                        </Stack>
                                    </Box>
                                )}
                            </Paper>

                            {/* Customer Info */}
                            <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Person fontSize="small" color="primary" />
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Thông tin khách hàng
                                        </Typography>
                                    </Stack>
                                    {order.customerHistory?.totalOrders === 1 && (
                                        <Chip
                                            icon={<FiberNew fontSize="small" />}
                                            label="Khách hàng mới"
                                            color="success"
                                            size="small"
                                            sx={{ fontWeight: 'medium' }}
                                        />
                                    )}
                                    {order.customerHistory?.totalOrders && order.customerHistory.totalOrders > 1 && (
                                        <Tooltip title={`Khách hàng thân thiết - ${order.customerHistory?.totalOrders} đơn hàng`}>
                                            <Chip
                                                icon={<EmojiEvents fontSize="small" />}
                                                label={`${order.customerHistory?.totalOrders} đơn hàng`}
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Tooltip>
                                    )}
                                </Stack>
                                <Box sx={{
                                    py: 1.5,
                                    px: 2,
                                    bgcolor: alpha(theme.palette.background.default, 0.7),
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    badgeContent={
                                                        order.isNewCustomer ?
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    width: 10,
                                                                    height: 10,
                                                                    borderRadius: '50%',
                                                                    bgcolor: 'success.main',
                                                                    border: `2px solid ${theme.palette.background.paper}`
                                                                }}
                                                            /> : null
                                                    }
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            bgcolor: order.isNewCustomer ? 'success.main' : 'primary.main',
                                                            fontSize: '1rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {order.customerName ? order.customerName.charAt(0).toUpperCase() : 'K'}
                                                    </Avatar>
                                                </Badge>
                                                <div>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {order.customerName}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Phone sx={{ color: 'text.secondary', fontSize: 14 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {order.customerPhone}
                                                        </Typography>
                                                    </Stack>
                                                </div>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Stack spacing={0.5}>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Home sx={{ fontSize: 14, mr: 0.5 }} />
                                                    Địa chỉ
                                                </Typography>
                                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                    {order.address || 'Không có địa chỉ'}
                                                </Typography>
                                            </Stack>
                                        </Grid>

                                        {order.customerTotalOrders && order.customerTotalOrders > 0 && (
                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 1 }} />
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6} sm={3}>
                                                        <Stack spacing={0.5} alignItems="center">
                                                            <Typography variant="caption" color="text.secondary">
                                                                Tổng đơn hàng
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {order.customerTotalOrders}
                                                            </Typography>
                                                        </Stack>
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <Stack spacing={0.5} alignItems="center">
                                                            <Typography variant="caption" color="text.secondary">
                                                                Khách hàng từ
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {order.isNewCustomer ? 'Hôm nay' : '---'}
                                                            </Typography>
                                                        </Stack>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Box sx={{
                                                            p: 1,
                                                            borderRadius: 1,
                                                            bgcolor: alpha(
                                                                order.isNewCustomer ? theme.palette.success.main : theme.palette.primary.main,
                                                                0.05
                                                            ),
                                                            border: `1px dashed ${alpha(
                                                                order.isNewCustomer ? theme.palette.success.main : theme.palette.primary.main,
                                                                0.2
                                                            )}`
                                                        }}>
                                                            <Typography variant="caption" align="center" display="block" color="text.secondary">
                                                                {order.isNewCustomer
                                                                    ? 'Đây là đơn hàng đầu tiên của khách hàng này'
                                                                    : 'Khách hàng thân thiết đã có nhiều đơn hàng'}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            </Paper>

                            {/* Customer History - Enhanced */}
                            {order.customerHistory && order.customerHistory.previousOrders && order.customerHistory.previousOrders.length > 0 && (
                                <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Group fontSize="small" color="primary" />
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                Lịch sử mua hàng của khách
                                            </Typography>
                                        </Stack>
                                        <Chip
                                            icon={<EmojiEvents fontSize="small" />}
                                            label={getLoyaltyLevel(order.customerHistory?.totalOrders || 0)}
                                            color={getLoyaltyColor(order.customerHistory?.totalOrders || 0, theme)}
                                            size="small"
                                            sx={{ fontWeight: 'medium' }}
                                        />
                                    </Stack>
                                    <Box sx={{
                                        py: 1.5,
                                        px: 2,
                                        bgcolor: alpha(theme.palette.background.default, 0.7),
                                        borderRadius: 1,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}>
                                        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                                            {order.customerHistory?.isReturningCustomer
                                                ? `Khách hàng thân thiết - đã đặt ${order.customerHistory?.totalOrders} đơn hàng`
                                                : 'Khách hàng mới - đây là đơn hàng đầu tiên'}
                                        </Typography>

                                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                            {order.customerHistory?.previousOrders.map((historyItem) => (
                                                <Box
                                                    key={historyItem._id}
                                                    sx={{
                                                        p: 1.5,
                                                        mb: 1.5,
                                                        borderRadius: 1,
                                                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                                                        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                            borderColor: alpha(theme.palette.primary.main, 0.2)
                                                        }
                                                    }}
                                                >
                                                    <Grid container spacing={1}>
                                                        <Grid item xs={12} sm={3}>
                                                            <Stack spacing={0.5}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Mã đơn hàng
                                                                </Typography>
                                                                <Chip
                                                                    label={historyItem.orderCode}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        height: 24,
                                                                        fontSize: '0.75rem'
                                                                    }}
                                                                />
                                                            </Stack>
                                                        </Grid>
                                                        <Grid item xs={12} sm={3}>
                                                            <Stack spacing={0.5}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Ngày đặt
                                                                </Typography>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {formatDate(historyItem.orderDate)}
                                                                </Typography>
                                                            </Stack>
                                                        </Grid>
                                                        <Grid item xs={12} sm={3}>
                                                            <Stack spacing={0.5}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Tổng tiền
                                                                </Typography>
                                                                <Typography variant="body2" color="primary.main" fontWeight="medium">
                                                                    {formatCurrency(historyItem.total)}
                                                                </Typography>
                                                            </Stack>
                                                        </Grid>
                                                        <Grid item xs={12} sm={3}>
                                                            <Stack spacing={0.5}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Trạng thái
                                                                </Typography>
                                                                <Chip
                                                                    label={getStatusLabel(historyItem.status)}
                                                                    size="small"
                                                                    color={
                                                                        historyItem.status === ORDER_STATUS.COMPLETED ? 'success' :
                                                                            historyItem.status === ORDER_STATUS.CANCELLED ? 'error' :
                                                                                historyItem.status === ORDER_STATUS.ACTIVE ? 'warning' : 'info'
                                                                    }
                                                                    sx={{ height: 24, fontSize: '0.75rem' }}
                                                                />
                                                            </Stack>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            ))}
                                        </Box>

                                        <Box sx={{
                                            mt: 2,
                                            p: 1.5,
                                            borderRadius: 1,
                                            bgcolor: alpha(theme.palette[getLoyaltyColor(order.customerHistory?.totalOrders || 0, theme)].main, 0.05),
                                            border: `1px dashed ${alpha(theme.palette[getLoyaltyColor(order.customerHistory?.totalOrders || 0, theme)].main, 0.3)}`
                                        }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <EmojiEvents color={getLoyaltyColor(order.customerHistory?.totalOrders || 0, theme)} />
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="medium" color={theme.palette[getLoyaltyColor(order.customerHistory?.totalOrders || 0, theme)].main}>
                                                        {getLoyaltyLevel(order.customerHistory?.totalOrders || 0)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {getLoyaltyDescription(order.customerHistory?.totalOrders || 0)}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </Box>
                                </Paper>
                            )}

                            {/* Order Items - Enhanced */}
                            <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Inventory fontSize="small" color="primary" />
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Danh sách sản phẩm
                                        </Typography>
                                    </Stack>
                                    <Chip
                                        label={`${formattedItems.length} sản phẩm`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Stack>

                                <Box sx={{
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: alpha(theme.palette.background.default, 0.7),
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{ overflowX: 'auto' }}>
                                        {formattedItems.map((item, index) => (
                                            <Paper
                                                key={index}
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    mb: 2,
                                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                    borderRadius: 1,
                                                    '&:last-child': { mb: 0 },
                                                    transition: 'all 0.2s ease-in-out',
                                                    '&:hover': {
                                                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                                                        borderColor: alpha(theme.palette.primary.main, 0.2)
                                                    }
                                                }}
                                            >
                                                <Grid container spacing={2}>
                                                    {/* Hình ảnh và thông tin cơ bản */}
                                                    <Grid item xs={12} sm={5}>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            {item.imageUrl ? (
                                                                <Box
                                                                    sx={{
                                                                        width: 80,
                                                                        height: 80,
                                                                        borderRadius: 1,
                                                                        overflow: 'hidden',
                                                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                                                    }}
                                                                >
                                                                    <Box
                                                                        component="img"
                                                                        loading="lazy"
                                                                        src={item.imageUrl}
                                                                        alt={item.name}
                                                                        sx={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover',
                                                                            transition: 'transform 0.3s ease-in-out',
                                                                            '&:hover': {
                                                                                transform: 'scale(1.1)'
                                                                            }
                                                                        }}
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.src = '/placeholder-image.png';
                                                                        }}
                                                                    />
                                                                </Box>
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        width: 80,
                                                                        height: 80,
                                                                        borderRadius: 1,
                                                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                                                    }}
                                                                >
                                                                    <Inventory sx={{ color: alpha(theme.palette.primary.main, 0.5) }} />
                                                                </Box>
                                                            )}
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="subtitle2" fontWeight="medium">
                                                                    {item.name}
                                                                </Typography>
                                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                                    {item.code && (
                                                                        <Chip
                                                                            icon={<Tag fontSize="small" />}
                                                                            label={item.code}
                                                                            size="small"
                                                                            variant="outlined"
                                                                            sx={{
                                                                                height: 20,
                                                                                '& .MuiChip-label': {
                                                                                    px: 0.7,
                                                                                    fontSize: '0.7rem'
                                                                                },
                                                                                '& .MuiChip-icon': {
                                                                                    fontSize: '0.8rem',
                                                                                    ml: 0.5
                                                                                }
                                                                            }}
                                                                        />
                                                                    )}
                                                                    {item.category && (
                                                                        <Typography variant="caption" color="text.secondary" component="span">
                                                                            {item.category}
                                                                        </Typography>
                                                                    )}
                                                                    {item.size && (
                                                                        <Typography variant="caption" color="text.secondary" component="span">
                                                                            Size: {item.size}
                                                                        </Typography>
                                                                    )}
                                                                </Stack>
                                                            </Box>
                                                        </Stack>
                                                    </Grid>

                                                    {/* Thông tin số lượng và giá */}
                                                    <Grid item xs={12} sm={7}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={4}>
                                                                <Stack spacing={0.5}>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Số lượng thuê
                                                                    </Typography>
                                                                    <Typography variant="body2" fontWeight="medium">
                                                                        {item.quantity} sản phẩm
                                                                    </Typography>
                                                                </Stack>
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <Stack spacing={0.5}>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Đơn giá
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {formatCurrency(item.price)}
                                                                    </Typography>
                                                                </Stack>
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <Stack spacing={0.5}>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Thành tiền
                                                                    </Typography>
                                                                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                                                                        {formatCurrency(item.subtotal || (item.price * item.quantity))}
                                                                    </Typography>
                                                                </Stack>
                                                            </Grid>

                                                            {/* Thông tin tình trạng sản phẩm nếu có */}
                                                            {item.availability && (
                                                                <Grid item xs={12}>
                                                                    <Box sx={{
                                                                        mt: 1,
                                                                        p: 1.5,
                                                                        borderRadius: 1,
                                                                        bgcolor: alpha(theme.palette.info.main, 0.05),
                                                                        border: `1px dashed ${alpha(theme.palette.info.main, 0.2)}`
                                                                    }}>
                                                                        <Typography variant="caption" color="text.secondary" display="block" align="center" gutterBottom>
                                                                            Thông tin tồn kho
                                                                        </Typography>
                                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                                            <Stack spacing={0.5} alignItems="center" sx={{ flex: 1 }}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Tổng kho
                                                                                </Typography>
                                                                                <Typography variant="body2" fontWeight="medium">
                                                                                    {item.availability.total}
                                                                                </Typography>
                                                                            </Stack>
                                                                            <Stack spacing={0.5} alignItems="center" sx={{ flex: 1 }}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Đang cho thuê
                                                                                </Typography>
                                                                                <Typography variant="body2" color="warning.main" fontWeight="medium">
                                                                                    {item.availability.rented}
                                                                                </Typography>
                                                                            </Stack>
                                                                            <Stack spacing={0.5} alignItems="center" sx={{ flex: 1 }}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Có sẵn
                                                                                </Typography>
                                                                                <Typography variant="body2" color="success.main" fontWeight="medium">
                                                                                    {item.availability.available}
                                                                                </Typography>
                                                                            </Stack>
                                                                        </Stack>
                                                                        <Box sx={{ mt: 1 }}>
                                                                            <LinearProgress
                                                                                variant="determinate"
                                                                                value={parseFloat(item.availability.percentageRented)}
                                                                                sx={{
                                                                                    height: 6,
                                                                                    borderRadius: 1,
                                                                                    bgcolor: alpha(theme.palette.divider, 0.2),
                                                                                    '& .MuiLinearProgress-bar': {
                                                                                        bgcolor: parseFloat(item.availability.percentageRented) > 80
                                                                                            ? 'error.main'
                                                                                            : parseFloat(item.availability.percentageRented) > 50
                                                                                                ? 'warning.main'
                                                                                                : 'success.main'
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 0.5 }}>
                                                                                {item.availability.percentageRented}% đã được sử dụng
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                </Grid>
                                                            )}
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        ))}
                                    </Box>
                                </Box>

                                {/* Tổng kết đơn hàng - Enhanced */}
                                <Box sx={{ mt: 3, p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.background.paper, 0.7), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                                    <Typography variant="subtitle2" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AttachMoney fontSize="small" sx={{ mr: 0.5 }} />
                                        Thông tin thanh toán
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <Stack spacing={0.5} alignItems="center">
                                                <Typography variant="caption" color="text.secondary">
                                                    Tổng tiền
                                                </Typography>
                                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                                    {formatCurrency(order.total)}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Stack spacing={0.5} alignItems="center">
                                                <Typography variant="caption" color="text.secondary">
                                                    Đã đặt cọc
                                                </Typography>
                                                <Typography variant="h6" color="success.main" fontWeight="medium">
                                                    {formatCurrency(order.deposit)}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Stack spacing={0.5} alignItems="center">
                                                <Typography variant="caption" color="text.secondary">
                                                    Còn lại
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    color={order.remainingAmount > 0 ? "warning.main" : "success.main"}
                                                    fontWeight="medium"
                                                >
                                                    {formatCurrency(order.remainingAmount)}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                    {/* Payment progress */}
                                    <Box sx={{ mt: 2 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={order.deposit / order.total * 100}
                                            sx={{
                                                height: 8,
                                                borderRadius: 1,
                                                bgcolor: alpha(theme.palette.divider, 0.2),
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: order.remainingAmount === 0 ? 'success.main' : 'primary.main'
                                                }
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 0.5 }}>
                                            Đã thanh toán {Math.round(order.deposit / order.total * 100)}%
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Order Timeline - Enhanced */}
                            {order.timeline && order.timeline.length > 0 && (
                                <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                        <CalendarToday fontSize="small" color="primary" />
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Lịch sử đơn hàng
                                        </Typography>
                                        <Chip
                                            label={`${order.timeline?.length || 0} sự kiện`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Stack>

                                    <Box sx={{
                                        p: 2,
                                        borderRadius: 1,
                                        bgcolor: alpha(theme.palette.background.default, 0.7),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}>
                                        <Timeline position="right" sx={{
                                            p: 0,
                                            m: 0,
                                            [`& .MuiTimelineItem-root::before`]: {
                                                display: 'none'
                                            }
                                        }}>
                                            {order.timeline?.map((event, index) => (
                                                <TimelineItem key={index} sx={{ minHeight: 'auto' }}>
                                                    <TimelineSeparator>
                                                        <TimelineDot
                                                            sx={{
                                                                bgcolor: getStatusColor(event.status, theme),
                                                                boxShadow: `0 0 0 3px ${alpha(getStatusColor(event.status, theme), 0.2)}`
                                                            }}
                                                        >
                                                            {event.status === ORDER_STATUS.PENDING && <Receipt fontSize="small" />}
                                                            {event.status === ORDER_STATUS.ACTIVE && <LocalShipping fontSize="small" />}
                                                            {event.status === ORDER_STATUS.COMPLETED && <AssignmentTurnedIn fontSize="small" />}
                                                            {event.status === ORDER_STATUS.CANCELLED && <Cancel fontSize="small" />}
                                                        </TimelineDot>
                                                        {index < (order.timeline?.length || 0) - 1 && (
                                                            <TimelineConnector sx={{
                                                                bgcolor: alpha(theme.palette.divider, 0.3),
                                                                minHeight: 30
                                                            }} />
                                                        )}
                                                    </TimelineSeparator>
                                                    <TimelineContent sx={{ py: 1, px: 2 }}>
                                                        <Box sx={{
                                                            p: 1.5,
                                                            borderRadius: 1,
                                                            bgcolor: alpha(getStatusColor(event.status, theme), 0.05),
                                                            border: `1px solid ${alpha(getStatusColor(event.status, theme), 0.1)}`,
                                                            '&:hover': {
                                                                bgcolor: alpha(getStatusColor(event.status, theme), 0.1),
                                                            }
                                                        }}>
                                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                <Typography variant="subtitle2" fontWeight="medium">
                                                                    {getStatusLabel(event.status)}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {new Date(event.date).toLocaleString('vi-VN')}
                                                                </Typography>
                                                            </Stack>
                                                            {event.note && (
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        mt: 0.5,
                                                                        p: 1,
                                                                        borderRadius: 0.5,
                                                                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                                                                        borderLeft: `3px solid ${alpha(getStatusColor(event.status, theme), 0.5)}`
                                                                    }}
                                                                >
                                                                    {event.note}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TimelineContent>
                                                </TimelineItem>
                                            ))}
                                        </Timeline>
                                    </Box>
                                </Paper>
                            )}

                            {/* Notes - Enhanced */}
                            {order.note && (
                                <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                        <EventNote fontSize="small" color="primary" />
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Ghi chú đơn hàng
                                        </Typography>
                                    </Stack>
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: 1,
                                        bgcolor: alpha(theme.palette.background.default, 0.7),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.7)}`
                                    }}>
                                        <Typography variant="body2">{order.note}</Typography>
                                    </Box>
                                </Paper>
                            )}


                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2, justifyContent: 'space-between', borderTop: 1, borderColor: 'divider' }}>
                    <Box>
                        {onStatusUpdate && (order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.ACTIVE) && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Edit />}
                                onClick={() => {
                                    setSelectedStatus(order.status === ORDER_STATUS.PENDING ? ORDER_STATUS.ACTIVE : ORDER_STATUS.COMPLETED);
                                    setStatusDialogOpen(true);
                                }}
                                disabled={loading || localLoading}
                                sx={{
                                    boxShadow: 2,
                                    '&:hover': {
                                        boxShadow: 4
                                    }
                                }}
                            >
                                Cập nhật trạng thái
                            </Button>
                        )}
                    </Box>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        startIcon={<Close />}
                    >
                        Đóng
                    </Button>
                </DialogActions>

                {/* Status Update Dialog - Enhanced */}
                <Dialog
                    open={statusDialogOpen}
                    onClose={() => setStatusDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        elevation: 8,
                        sx: {
                            borderRadius: 2,
                            overflow: 'hidden'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        bgcolor: alpha(getStatusColor(selectedStatus, theme), 0.1),
                        borderBottom: `1px solid ${alpha(getStatusColor(selectedStatus, theme), 0.2)}`,
                        color: getStatusColor(selectedStatus, theme)
                    }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            {selectedStatus === ORDER_STATUS.ACTIVE && <LocalShipping fontSize="small" />}
                            {selectedStatus === ORDER_STATUS.COMPLETED && <AssignmentTurnedIn fontSize="small" />}
                            Cập nhật trạng thái đơn hàng
                        </Stack>
                    </DialogTitle>
                    <DialogContent dividers sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            <Alert
                                severity="info"
                                variant="outlined"
                                icon={
                                    selectedStatus === ORDER_STATUS.ACTIVE ? <LocalShipping /> :
                                        selectedStatus === ORDER_STATUS.COMPLETED ? <AssignmentTurnedIn /> :
                                            <Info />
                                }
                                sx={{
                                    borderColor: alpha(getStatusColor(selectedStatus, theme), 0.3),
                                    bgcolor: alpha(getStatusColor(selectedStatus, theme), 0.05)
                                }}
                            >
                                <AlertTitle>Xác nhận thay đổi trạng thái</AlertTitle>
                                Bạn đang chuyển trạng thái đơn hàng sang <strong>{getStatusLabel(selectedStatus)}</strong>
                            </Alert>

                            <TextField
                                fullWidth
                                label="Ghi chú"
                                multiline
                                rows={3}
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="Nhập ghi chú về việc thay đổi trạng thái (không bắt buộc)"
                                variant="outlined"
                                InputProps={{
                                    startAdornment: <EventNote fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />

                            {selectedStatus === ORDER_STATUS.COMPLETED && (
                                <Paper
                                    elevation={0}
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 1,
                                        borderColor: alpha(theme.palette.success.main, 0.3),
                                        bgcolor: alpha(theme.palette.success.main, 0.05)
                                    }}
                                >
                                    <Typography variant="subtitle2" gutterBottom>
                                        Thông tin hoàn tất đơn hàng
                                    </Typography>

                                    <FormControl component="fieldset" sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                            Tình trạng thanh toán
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={isFullyPaid ? 'paid' : 'notPaid'}
                                            onChange={(e) => setIsFullyPaid(e.target.value === 'paid')}
                                        >
                                            <FormControlLabel
                                                value="paid"
                                                control={<Radio color="success" />}
                                                label="Đã thanh toán đủ"
                                            />
                                            <FormControlLabel
                                                value="notPaid"
                                                control={<Radio color="warning" />}
                                                label="Chưa thanh toán đủ"
                                            />
                                        </RadioGroup>
                                    </FormControl>

                                    <FormControl component="fieldset" sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                            Thời gian trả
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={returnedOnTime ? 'onTime' : 'late'}
                                            onChange={(e) => setReturnedOnTime(e.target.value === 'onTime')}
                                        >
                                            <FormControlLabel
                                                value="onTime"
                                                control={<Radio color="success" />}
                                                label="Trả đúng hạn"
                                            />
                                            <FormControlLabel
                                                value="late"
                                                control={<Radio color="error" />}
                                                label="Trả trễ"
                                            />
                                        </RadioGroup>
                                    </FormControl>

                                    {isFullyPaid && (
                                        <Alert severity="success" sx={{ mt: 2 }}>
                                            Hệ thống sẽ tự động cập nhật số tiền còn lại về 0 và đánh dấu là đã thanh toán đủ.
                                        </Alert>
                                    )}
                                </Paper>
                            )}
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Button
                            onClick={() => setStatusDialogOpen(false)}
                            variant="outlined"
                            color="inherit"
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="contained"
                            color={selectedStatus === ORDER_STATUS.ACTIVE ? "primary" : "success"}
                            onClick={handleStatusUpdate}
                            disabled={statusLoading}
                            startIcon={statusLoading ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{
                                boxShadow: 2,
                                '&:hover': {
                                    boxShadow: 4
                                },
                                px: 3
                            }}
                        >
                            Xác nhận
                        </Button>
                    </DialogActions>
                </Dialog>
            </Dialog>
        </ThemeProvider>
    );
};

export default OrderDetailDialog; 
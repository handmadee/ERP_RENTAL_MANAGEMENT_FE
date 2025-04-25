import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Stack,
    Avatar,
    Grid,
    Paper,
    Chip,
    Tabs,
    Tab,
    ImageList,
    ImageListItem,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Divider,
    useTheme,
    alpha,
    Tooltip,
} from '@mui/material';
import {
    Info,
    PhotoLibrary,
    History,
    Inventory2 as InventoryIcon,
    MonetizationOn as MoneyIcon,
    TrendingUp as TrendingIcon,
    Build as MaintenanceIcon,
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
    Schedule as ScheduleIcon,
    Close as CloseIcon,
    ShoppingCart as RentedIcon,
    LocalOffer as PriceIcon,
    Assessment as MetricsIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import costumeService from '../../services/costumeService';
import { showToast } from '../common/Toast';
import type { CostumeDetail as CostumeDetailType } from '../../types/costume';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
        >
            {value === index && children}
        </div>
    );
};

interface CostumeDetailProps {
    costumeId: string;
    onClose: () => void;
}

const CostumeDetail: React.FC<CostumeDetailProps> = ({ costumeId, onClose }) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<CostumeDetailType | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await costumeService.getCostumeDetail(costumeId);
                setDetail(data);
            } catch (error) {
                console.error('Error fetching costume detail:', error);
                showToast.error('Không thể tải thông tin chi tiết sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [costumeId]);

    const tabs = [
        { label: 'Thông tin chung', icon: <Info /> },
        { label: 'Hình ảnh', icon: <PhotoLibrary /> },
        { label: 'Lịch sử thuê', icon: <History /> }
    ];

    if (loading) {
        return (
            <Dialog open={true} maxWidth="lg" fullWidth>
                <DialogContent>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                        <CircularProgress />
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    if (!detail) {
        return null;
    }

    const { basicInfo, inventoryMetrics, financialMetrics, rentalMetrics, maintenanceInfo, recentHistory } = detail;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Có sẵn':
                return theme.palette.success;
            case 'Đang cho thuê':
                return theme.palette.warning;
            case 'Bảo trì':
                return theme.palette.error;
            default:
                return theme.palette.grey;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
    };

    return (
        <Dialog open={true} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                            src={basicInfo.imageUrl}
                            variant="rounded"
                            sx={{ width: 56, height: 56 }}
                        />
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {basicInfo.name}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Mã: {basicInfo.code}
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={onClose} size="large">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
            >
                {tabs.map((tab, index) => (
                    <Tab
                        key={index}
                        label={tab.label}
                        icon={tab.icon}
                        iconPosition="start"
                    />
                ))}
            </Tabs>

            <DialogContent>
                <TabPanel value={activeTab} index={0}>
                    <Grid container spacing={3}>
                        {/* Basic Info */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, height: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <Info color="primary" />
                                    <Typography variant="h6">
                                        Thông tin cơ bản
                                    </Typography>
                                </Stack>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CategoryIcon color="action" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Danh mục"
                                            secondary={basicInfo.category.name}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <PriceIcon color="action" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Giá thuê"
                                            secondary={formatCurrency(basicInfo.price)}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <MetricsIcon color="action" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Kích thước"
                                            secondary={basicInfo.size}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <InfoIcon color="action" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Trạng thái"
                                            secondary={
                                                <Chip
                                                    label={basicInfo.status}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(getStatusColor(basicInfo.status).main, 0.1),
                                                        color: getStatusColor(basicInfo.status).main,
                                                    }}
                                                />
                                            }
                                        />
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>

                        {/* Inventory Metrics */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, height: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <InventoryIcon color="primary" />
                                    <Typography variant="h6">
                                        Thông tin tồn kho
                                    </Typography>
                                </Stack>
                                <List>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography>Tổng số lượng</Typography>
                                                    {inventoryMetrics.restockNeeded && (
                                                        <Tooltip title="Cần nhập thêm hàng">
                                                            <WarningIcon color="warning" fontSize="small" />
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            }
                                            secondary={inventoryMetrics.totalQuantity}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Có sẵn"
                                            secondary={inventoryMetrics.available}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Đang cho thuê"
                                            secondary={inventoryMetrics.rented}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Tỷ lệ sử dụng"
                                            secondary={inventoryMetrics.utilizationRate}
                                        />
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>

                        {/* Financial Metrics */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, height: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <MoneyIcon color="success" />
                                    <Typography variant="h6">
                                        Thông tin tài chính
                                    </Typography>
                                </Stack>
                                <List>
                                    <ListItem>
                                        <ListItemText
                                            primary="Giá hiện tại"
                                            secondary={formatCurrency(financialMetrics.currentPrice)}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Tổng doanh thu"
                                            secondary={formatCurrency(financialMetrics.totalRevenue)}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Doanh thu trung bình/lần thuê"
                                            secondary={formatCurrency(financialMetrics.averageRevenuePerRental)}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Chỉ số sinh lời"
                                            secondary={
                                                <Chip
                                                    label={financialMetrics.profitabilityScore}
                                                    size="small"
                                                    color={
                                                        financialMetrics.profitabilityScore === 'Cao' ? 'success' :
                                                            financialMetrics.profitabilityScore === 'Trung bình' ? 'warning' : 'error'
                                                    }
                                                />
                                            }
                                        />
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>

                        {/* Rental Metrics */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, height: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <TrendingIcon color="info" />
                                    <Typography variant="h6">
                                        Thông tin cho thuê
                                    </Typography>
                                </Stack>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <ShoppingCart color="action" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Tổng số lần cho thuê"
                                            secondary={rentalMetrics.totalRentals}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <RentedIcon color="action" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Đang cho thuê"
                                            secondary={rentalMetrics.activeRentals}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <`TrendingUp` color="action" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Tỷ lệ sử dụng hiện tại"
                                            secondary={rentalMetrics.currentUtilization}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Assessment color="action" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Mức độ phổ biến"
                                            secondary={
                                                <Chip
                                                    label={rentalMetrics.popularityScore}
                                                    size="small"
                                                    color={
                                                        rentalMetrics.popularityScore === 'Cao' ? 'success' :
                                                            rentalMetrics.popularityScore === 'Trung bình' ? 'warning' : 'error'
                                                    }
                                                    sx={{ width: 'fit-content' }}
                                                />
                                            }
                                        />
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>

                        {/* Maintenance Info */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, height: '100%' }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <MaintenanceIcon color="warning" />
                                    <Typography variant="h6">
                                        Thông tin bảo trì
                                    </Typography>
                                </Stack>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckIcon color={maintenanceInfo.status === 'Đang hoạt động' ? 'success' : 'error'} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Trạng thái"
                                            secondary={maintenanceInfo.status}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <RefreshIcon color="action" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Lần bảo trì gần nhất"
                                            secondary={maintenanceInfo.lastMaintenance}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <ScheduleIcon color="action" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Lần bảo trì tiếp theo"
                                            secondary={maintenanceInfo.nextMaintenance}
                                        />
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    {basicInfo.listImageUrl && basicInfo.listImageUrl.length > 0 ? (
                        <ImageList cols={3} gap={16}>
                            {basicInfo.listImageUrl.map((url, index) => (
                                <ImageListItem key={index}>
                                    <img
                                        src={url}
                                        alt={`${basicInfo.name} - ${index + 1}`}
                                        loading="lazy"
                                        style={{ borderRadius: 8 }}
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    ) : (
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minHeight={200}
                            bgcolor={alpha(theme.palette.primary.main, 0.05)}
                            borderRadius={2}
                        >
                            <Typography variant="body1" color="text.secondary">
                                Chưa có hình ảnh
                            </Typography>
                        </Box>
                    )}
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    {recentHistory && recentHistory.length > 0 ? (
                        <List>
                            {recentHistory.map((history, index) => (
                                <React.Fragment key={history.orderCode}>
                                    <ListItem>
                                        <ListItemIcon>
                                            <RentedIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle2">
                                                    Mã đơn: {history.orderCode}
                                                </Typography>
                                            }
                                            secondary={
                                                <Stack spacing={0.5}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Ngày thuê: {formatDate(history.orderDate)}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Ngày trả: {formatDate(history.returnDate)}
                                                    </Typography>
                                                    <Chip
                                                        label={
                                                            history.status === 'pending' ? 'Đang xử lý' :
                                                                history.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'
                                                        }
                                                        size="small"
                                                        color={
                                                            history.status === 'pending' ? 'warning' :
                                                                history.status === 'completed' ? 'success' : 'error'
                                                        }
                                                        sx={{ width: 'fit-content' }}
                                                    />
                                                </Stack>
                                            }
                                        />
                                    </ListItem>
                                    {index < recentHistory.length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minHeight={200}
                            bgcolor={alpha(theme.palette.primary.main, 0.05)}
                            borderRadius={2}
                        >
                            <Typography variant="body1" color="text.secondary">
                                Chưa có lịch sử thuê
                            </Typography>
                        </Box>
                    )}
                </TabPanel>
            </DialogContent>
        </Dialog>
    );
};

export default CostumeDetail; 
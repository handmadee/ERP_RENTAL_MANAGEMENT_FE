import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Button,
  Stack,
  TextField,
  Tooltip,
  Alert,
  InputAdornment,
  CircularProgress,
  useTheme,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  Divider,
  ImageList,
  ImageListItem,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Visibility,
  NavigateBefore,
  NavigateNext,
  Edit,
  Delete,
  ContentCopy,
  Add,
  CategoryOutlined,
  Inventory2,
  CheckCircle,
  Error,
  Info,
  Warning,
  Close,
  Search,
  Clear,
  Sort,
  ArrowUpward,
  ArrowDownward,
  Check,
  PhotoLibrary,
  History,
  Build,
  ShoppingBag,
  LocalOffer,
  Straighten,
  MonetizationOn,
  TrendingUp,
  Assessment,
  ShoppingCart,
  Schedule,
  Refresh,
  PhotoCamera,
} from '@mui/icons-material';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../components/common/Toast';
import { format } from 'date-fns';
import costumeService from '../services/costumeService';
import { Category, Costume } from '../types/costume';
import type { CostumeStats } from '../types/costume';
import CategoryCard from '../components/costume/CategoryCard';
import CostumeFilters from '../components/costume/CostumeFilters';
import CostumeStatsComponent from '../components/costume/CostumeStats';
import { vi } from 'date-fns/locale';
import type { CostumeDetail as CostumeDetailType, RentalHistory } from '../types/costume';
import type { Theme, PaletteColor } from '@mui/material';

type CostumeStatus = 'available' | 'rented' | 'maintenance';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
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

const validationSchema = Yup.object({
  code: Yup.string().required('Mã sản phẩm là bắt buộc'),
  name: Yup.string().required('Tên trang phục là bắt buộc'),
  categoryId: Yup.string().required('Danh mục là bắt buộc'),
  price: Yup.number()
    .required('Giá thuê là bắt buộc')
    .min(0, 'Giá thuê phải lớn hơn 0'),
  size: Yup.string().required('Kích thước là bắt buộc'),
  status: Yup.string()
    .oneOf(['available', 'rented', 'maintenance'] as const, 'Trạng thái không hợp lệ')
    .required('Trạng thái là bắt buộc'),
  quantityAvailable: Yup.number()
    .required('Số lượng có sẵn là bắt buộc')
    .min(0, 'Số lượng không thể âm'),
  description: Yup.string().required('Mô tả là bắt buộc'),
  imageUrl: Yup.string(),
  listImageUrl: Yup.array().of(Yup.string())
});

interface CategoryFormValues {
  name: string;
  color: string;
  description?: string;
}

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (category: CategoryFormValues) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  categories: Category[];
  editingCategory?: Category | null;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onClose,
  onAdd,
  onEdit,
  onDelete,
  categories,
  editingCategory,
}) => {
  const theme = useTheme();
  const formik = useFormik<CategoryFormValues>({
    initialValues: editingCategory ? {
      name: editingCategory.name,
      color: editingCategory.color,
      description: editingCategory.description,
    } : {
      name: '',
      color: '#1976d2',
      description: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Tên danh mục là bắt buộc'),
      color: Yup.string().required('Màu sắc là bắt buộc'),
      description: Yup.string(),
    }),
    onSubmit: (values) => {
      if (editingCategory) {
        onEdit({ ...editingCategory, ...values });
      } else {
        onAdd(values);
      }
      onClose();
    },
    enableReinitialize: true,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tên danh mục"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              label="Màu sắc"
              name="color"
              type="color"
              value={formik.values.color}
              onChange={formik.handleChange}
              error={formik.touched.color && Boolean(formik.errors.color)}
              helperText={formik.touched.color && formik.errors.color}
              sx={{
                '& input': {
                  height: 50,
                  padding: 1,
                },
              }}
            />
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              multiline
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          {editingCategory && (
            <Button
              color="error"
              onClick={() => {
                onDelete(editingCategory._id);
                onClose();
              }}
              startIcon={<Delete />}
            >
              Xóa
            </Button>
          )}
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" startIcon={editingCategory ? <Edit /> : <Add />}>
            {editingCategory ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

interface CostumeDetailProps {
  costumeId: string;
  onClose: () => void;
}

const CostumeDetail: React.FC<CostumeDetailProps> = ({ costumeId, onClose }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [detail, setDetail] = useState<CostumeDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await costumeService.getCostumeDetail(costumeId);
        setDetail(response);
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
      <Dialog open maxWidth="lg" fullWidth>
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
        return theme.palette.success.main;
      case 'Đang cho thuê':
        return theme.palette.warning.main;
      case 'Bảo trì':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
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
    <>
      <Dialog open maxWidth="lg" fullWidth>
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
              <Close />
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
                        <CategoryOutlined color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Danh mục"
                        secondary={basicInfo.category.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocalOffer color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Giá thuê"
                        secondary={formatCurrency(basicInfo.price)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Straighten color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Kích thước"
                        secondary={basicInfo.size}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Info color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trạng thái"
                        secondary={
                          <Chip
                            label={basicInfo.status}
                            size="small"
                            sx={{
                              bgcolor: alpha(getStatusColor(basicInfo.status), 0.1),
                              color: getStatusColor(basicInfo.status),
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
                    <Inventory2 color="primary" />
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
                                <Warning color="warning" fontSize="small" />
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
                    <MonetizationOn color="success" />
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
                    <ShoppingCart color="info" />
                    <Typography variant="h6">
                      Thông tin cho thuê
                    </Typography>
                  </Stack>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <ShoppingBag color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tổng số lần cho thuê"
                        secondary={rentalMetrics.totalRentals}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ShoppingBag color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Đang cho thuê"
                        secondary={rentalMetrics.activeRentals}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="action" />
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
                    <Build color="warning" />
                    <Typography variant="h6">
                      Thông tin bảo trì
                    </Typography>
                  </Stack>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color={maintenanceInfo.status === 'Đang hoạt động' ? 'success' : 'error'} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Trạng thái"
                        secondary={maintenanceInfo.status}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Refresh color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Lần bảo trì gần nhất"
                        secondary={maintenanceInfo.lastMaintenance}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule color="action" />
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
              <Box sx={{ position: 'relative' }}>
                <ImageList cols={3} gap={16} sx={{ mb: 0 }}>
                  {basicInfo.listImageUrl.map((url: string, index: number) => (
                    <ImageListItem
                      key={url}
                      sx={{
                        cursor: 'pointer',
                        overflow: 'hidden',
                        borderRadius: 2,
                        '&:hover img': {
                          transform: 'scale(1.1)',
                          transition: 'transform 0.3s ease'
                        }
                      }}
                      onClick={() => setSelectedImage(url)}
                    >
                      <img
                        src={url}
                        alt={`${basicInfo.name} - ${index + 1}`}
                        loading="lazy"
                        style={{
                          height: 200,
                          width: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                      {url === basicInfo.imageUrl && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            bgcolor: 'rgba(25, 118, 210, 0.8)',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          Ảnh đại diện
                        </Box>
                      )}
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            ) : (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
                bgcolor={alpha(theme.palette.primary.main, 0.1)}
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
                {recentHistory.map((history: RentalHistory, index: number) => (
                  <React.Fragment key={history.orderCode}>
                    <ListItem>
                      <ListItemIcon>
                        <ShoppingBag color="primary" />
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
                bgcolor={alpha(theme.palette.primary.main, 0.1)}
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

      {/* Image Preview Dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            maxWidth: 'none',
            maxHeight: 'none',
            height: '100%',
            m: 0
          }
        }}
        fullScreen
      >
        <Box
          sx={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <IconButton
            onClick={() => setSelectedImage(null)}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
              },
              zIndex: 1
            }}
          >
            <Close />
          </IconButton>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Preview"
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                objectFit: 'contain'
              }}
            />
          )}
        </Box>
      </Dialog>
    </>
  );
};

interface UploadedImage {
  url: string;
  metadata: {
    thumbnails: Array<{
      size: string;
      url: string;
    }>;
  };
}

interface CostumeFormValues {
  code: string;
  name: string;
  categoryId?: string;
  price: number;
  size: string;
  status: CostumeStatus;
  imageUrl?: string;
  listImageUrl?: string[];
  description: string;
  quantityAvailable: number;
}

interface CostumeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CostumeFormValues, files?: File[]) => void;
  initialValues?: Costume;
  categories: Category[];
}

const CostumeDialog: React.FC<CostumeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  categories,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleteImageUrl, setDeleteImageUrl] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [productCode] = useState(() => {
    if (initialValues) {
      return initialValues.code;
    }
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `SP${randomNum}`;
  });

  const getThumbnailUrl = (image: UploadedImage): string => {
    const thumbnail300 = image.metadata.thumbnails.find(t => t.size === '300x300');
    return thumbnail300 ? thumbnail300.url : image.url;
  };

  const formik = useFormik<CostumeFormValues>({
    initialValues: initialValues ? {
      code: initialValues.code,
      name: initialValues.name,
      categoryId: initialValues.category?._id,
      price: initialValues.price,
      size: initialValues.size,
      status: initialValues.status,
      imageUrl: initialValues.imageUrl || '',
      listImageUrl: initialValues.listImageUrl || [],
      description: initialValues.description,
      quantityAvailable: initialValues.quantityAvailable,
    } : {
      code: productCode,
      name: '',
      categoryId: '',
      price: 0,
      size: '',
      status: 'available' as CostumeStatus,
      imageUrl: '',
      listImageUrl: [],
      description: '',
      quantityAvailable: 1,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Upload images first if there are any selected files
        if (selectedFiles.length > 0) {
          const uploadedImages = await costumeService.uploadMultipleImages(selectedFiles, {
            entityType: 'costume',
            compress: true
          });

          // Get original URLs for listImageUrl
          const originalUrls = uploadedImages.map(img => img.url);
          const currentUrls = values.listImageUrl || [];
          const allUrls = [...currentUrls, ...originalUrls];

          // Get 300x300 thumbnail for imageUrl if it's not set yet
          if (!values.imageUrl && uploadedImages.length > 0) {
            const firstImage = uploadedImages[0];
            const thumbnail300 = firstImage.metadata.thumbnails.find(t => t.size === '300x300');
            values.imageUrl = thumbnail300 ? thumbnail300.url : firstImage.url;
          }

          values.listImageUrl = allUrls;
        }

        // Now submit the form with updated values
        await onSubmit(values, []);
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
        showToast.error('Có lỗi xảy ra khi lưu thông tin');
      }
    },
    enableReinitialize: true,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        showToast.error('Chỉ được phép tải lên file hình ảnh!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        showToast.error('Kích thước hình ảnh phải nhỏ hơn 5MB!');
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showToast.error('Vui lòng chọn ít nhất một hình ảnh');
      return;
    }

    setUploading(true);
    try {
      const newUploadedImages = await costumeService.uploadMultipleImages(selectedFiles, {
        entityType: 'costume',
        compress: true
      });

      // Store uploaded images for thumbnail reference
      setUploadedImages(prev => [...prev, ...newUploadedImages]);

      // Get original URLs for listImageUrl
      const originalUrls = newUploadedImages.map(img => img.url);
      const currentUrls = formik.values.listImageUrl || [];
      const allUrls = [...currentUrls, ...originalUrls];

      // Get 300x300 thumbnail for imageUrl if it's not set yet
      if (!formik.values.imageUrl && newUploadedImages.length > 0) {
        formik.setFieldValue('imageUrl', getThumbnailUrl(newUploadedImages[0]));
      }

      formik.setFieldValue('listImageUrl', allUrls);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showToast.success('Tải ảnh lên thành công');
    } catch (error) {
      console.error('Error uploading images:', error);
      showToast.error('Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleSetMainImage = (url: string) => {
    const uploadedImage = uploadedImages.find(img => img.url === url);
    if (uploadedImage) {
      formik.setFieldValue('imageUrl', getThumbnailUrl(uploadedImage));
    } else {
      // If we can't find the uploaded image (e.g. after page refresh), 
      // we'll need to handle this case differently
      formik.setFieldValue('imageUrl', url);
    }
  };

  const handleDeleteImage = (url: string) => {
    setDeleteImageUrl(url);
  };

  const confirmDeleteImage = () => {
    if (!deleteImageUrl) return;

    const currentUrls = formik.values.listImageUrl || [];
    const newUrls = currentUrls.filter(url => url !== deleteImageUrl);

    formik.setFieldValue('listImageUrl', newUrls);

    // If we're removing the main image, set the first available image as main or empty string if none left
    if (formik.values.imageUrl === deleteImageUrl) {
      formik.setFieldValue('imageUrl', newUrls[0] || '');
    }

    setDeleteImageUrl(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              {initialValues ? 'Chỉnh sửa trang phục' : 'Thêm trang phục mới'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Hình ảnh sản phẩm
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<PhotoCamera />}
                    >
                      Chọn ảnh
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleUpload}
                      disabled={selectedFiles.length === 0 || uploading}
                      startIcon={uploading ? <CircularProgress size={20} /> : null}
                    >
                      {uploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
                    </Button>
                  </Stack>

                  {/* Selected files preview */}
                  {selectedFiles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Ảnh đã chọn ({selectedFiles.length})
                      </Typography>
                      <ImageList cols={3} gap={8}>
                        {selectedFiles.map((file, index) => (
                          <ImageListItem key={index}>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Selected ${index + 1}`}
                              loading="lazy"
                              style={{ borderRadius: 4, height: '150px', objectFit: 'cover' }}
                            />
                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                              }}
                              size="small"
                              onClick={() => removeFile(index)}
                            >
                              <Close sx={{ color: 'white' }} />
                            </IconButton>
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Box>
                  )}

                  {/* Uploaded images preview */}
                  {formik.values.listImageUrl && formik.values.listImageUrl.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Ảnh đã tải lên ({formik.values.listImageUrl.length})
                      </Typography>
                      <ImageList cols={3} gap={8}>
                        {formik.values.listImageUrl.map((url, index) => (
                          <ImageListItem key={url}>
                            <img
                              src={url}
                              alt={`Uploaded ${index + 1}`}
                              loading="lazy"
                              style={{ borderRadius: 4, height: '150px', objectFit: 'cover' }}
                            />
                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                              }}
                              size="small"
                              onClick={() => handleDeleteImage(url)}
                            >
                              <Close sx={{ color: 'white' }} />
                            </IconButton>
                            {url === formik.values.imageUrl && (
                              <Chip
                                label="Ảnh đại diện"
                                size="small"
                                color="primary"
                                sx={{
                                  position: 'absolute',
                                  bottom: 4,
                                  left: 4,
                                  bgcolor: 'rgba(25, 118, 210, 0.8)',
                                }}
                              />
                            )}
                            {url !== formik.values.imageUrl && (
                              <Tooltip title="Đặt làm ảnh đại diện">
                                <IconButton
                                  sx={{
                                    position: 'absolute',
                                    bottom: 4,
                                    right: 4,
                                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                                  }}
                                  size="small"
                                  onClick={() => handleSetMainImage(url)}
                                >
                                  <PhotoCamera sx={{ color: 'white' }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Rest of the form fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  disabled
                  fullWidth
                  label="Mã sản phẩm"
                  name="code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  error={formik.touched.code && Boolean(formik.errors.code)}
                  helperText={formik.touched.code && formik.errors.code}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tên trang phục"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Danh mục"
                  name="categoryId"
                  value={formik.values.categoryId}
                  onChange={formik.handleChange}
                  error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
                  helperText={formik.touched.categoryId && formik.errors.categoryId}
                >
                  {categories.filter(cat => cat._id !== 'all').map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Giá thuê"
                  name="price"
                  type="number"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price && formik.errors.price}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kích thước"
                  name="size"
                  value={formik.values.size}
                  onChange={formik.handleChange}
                  error={formik.touched.size && Boolean(formik.errors.size)}
                  helperText={formik.touched.size && formik.errors.size}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Trạng thái"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  helperText={formik.touched.status && formik.errors.status}
                >
                  <MenuItem value="available">Có sẵn</MenuItem>
                  <MenuItem value="rented">Đã cho thuê</MenuItem>
                  <MenuItem value="maintenance">Bảo trì</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số lượng có sẵn"
                  name="quantityAvailable"
                  type="number"
                  value={formik.values.quantityAvailable}
                  onChange={formik.handleChange}
                  error={formik.touched.quantityAvailable && Boolean(formik.errors.quantityAvailable)}
                  helperText={formik.touched.quantityAvailable && formik.errors.quantityAvailable}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={initialValues ? <Edit /> : <Add />}
              disabled={uploading}
            >
              {initialValues ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirmation Dialog for Image Deletion */}
      <Dialog
        open={Boolean(deleteImageUrl)}
        onClose={() => setDeleteImageUrl(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa hình ảnh này không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteImageUrl(null)}>Hủy</Button>
          <Button
            onClick={confirmDeleteImage}
            color="error"
            variant="contained"
            startIcon={<Delete />}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const QuantityDisplay: React.FC<{
  available: number;
  rented: number;
  total: number;
}> = ({ available, rented, total }) => {
  const theme = useTheme();
  const availablePercentage = (available / total) * 100;
  const rentedPercentage = (rented / total) * 100;

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Inventory2 sx={{ mr: 1, color: theme.palette.primary.main }} fontSize="small" />
          <Typography variant="subtitle2" fontWeight="bold">
            Tổng số lượng: {total}
          </Typography>
        </Box>
        <Box sx={{ position: 'relative', height: 8, bgcolor: 'background.default', borderRadius: 1 }}>
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${availablePercentage}%`,
              bgcolor: theme.palette.success.main,
              borderRadius: 1,
              transition: 'width 0.5s ease',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: `${availablePercentage}%`,
              top: 0,
              height: '100%',
              width: `${rentedPercentage}%`,
              bgcolor: theme.palette.primary.main,
              borderRadius: 1,
              transition: 'width 0.5s ease',
            }}
          />
        </Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
                mr: 0.5,
              }}
            />
            Có sẵn: {available}
          </Typography>
          <Typography variant="caption" color="primary.main" sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                mr: 0.5,
              }}
            />
            Đã cho thuê: {rented}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface CustomToastProps {
  message: string;
  variant: ToastVariant;
  onClose?: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({ message, variant, onClose }) => {
  const theme = useTheme();
  const icon = {
    success: <CheckCircle />,
    error: <Error />,
    info: <Info />,
    warning: <Warning />,
  }[variant];

  const bgColor = {
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    warning: theme.palette.warning.main,
  }[variant];

  return (
    <Paper
      elevation={6}
      sx={{
        minWidth: 300,
        maxWidth: 500,
        bgcolor: 'background.paper',
        borderLeft: 6,
        borderColor: bgColor,
        borderRadius: 1,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1.5 }}>
        <Box sx={{ color: bgColor, display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          {message}
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
            <Close />
          </IconButton>
        )}
      </Stack>
    </Paper>
  );
};

interface CostumesPageState {
  categories: Category[];
  costumes: Costume[];
  selectedCategory: string;
  selectedCostume: Costume | null;
  editingCostume: Costume | null;
  editingCategory: Category | null;
  openCategoryDialog: boolean;
  openCostumeDialog: boolean;
  searchQuery: string;
  sortBy: 'name' | 'price';
  sortOrder: 'ASC' | 'DESC';
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  stats: CostumeStats | null;
  status: CostumeStatus | undefined;
}

const CostumesPage: React.FC = () => {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CostumesPageState>({
    categories: [],
    costumes: [],
    selectedCategory: 'all',
    selectedCostume: null,
    editingCostume: null,
    editingCategory: null,
    openCategoryDialog: false,
    openCostumeDialog: false,
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'ASC',
    page: 1,
    limit: 10,
    total: 0,
    loading: true,
    stats: null,
    status: undefined,
  });
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const categories = await costumeService.getCategories();
      const allCategories = [
        {
          _id: 'all',
          name: 'Tất cả',
          color: '#666666',
          description: 'Tất cả trang phục',
          productCount: 0,
          createdAt: '',
          updatedAt: '',
        },
        ...categories
      ];
      setState(prev => ({ ...prev, categories: allCategories }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast.error('Không thể tải danh sách danh mục');
    }
  }, []);

  const fetchCostumes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const filters = {
        page: state.page,
        limit: state.limit,
        name: state.searchQuery,
        categoryId: state.selectedCategory !== 'all' ? state.selectedCategory : undefined,
        status: state.status,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      };
      const response = await costumeService.getCostumes(filters);
      setState(prev => ({
        ...prev,
        costumes: response.items,
        total: response.total,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching costumes:', error);
      showToast.error('Không thể tải danh sách trang phục');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.page, state.limit, state.searchQuery, state.selectedCategory, state.status, state.sortBy, state.sortOrder]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCostumes();
  }, [fetchCostumes]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  const handleAddCategory = async (category: CategoryFormValues) => {
    try {
      await costumeService.createCategory(category);
      showToast.success(`Đã thêm danh mục "${category.name}" thành công`);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      showToast.error('Không thể thêm danh mục');
    }
  };

  const handleEditCategory = async (_id: string, category: Category) => {
    try {
      const updateData = {
        name: category.name,
        color: category.color,
        description: category.description
      };

      await costumeService.updateCategory(_id, updateData);
      showToast.success(`Đã cập nhật danh mục "${category.name}" thành công`);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      showToast.error('Không thể cập nhật danh mục');
    }
  };

  const handleDeleteCategory = async (_id: string) => {
    try {
      await costumeService.deleteCategory(_id);
      showToast.success('Đã xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast.error('Không thể xóa danh mục');
    }
  };

  const handleCreateCostume = async (costumeData: CostumeFormValues, files?: File[]) => {
    try {
      setLoading(true);
      const costume = {
        ...costumeData,
      };
      await costumeService.createCostume(costume, files);
      showToast.success(`Đã thêm trang phục "${costume.name}" thành công`);
      fetchCostumes();
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating costume:', error);
      showToast.error('Có lỗi xảy ra khi thêm trang phục');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCostume = async (id: string, costumeData: Partial<CostumeFormValues>) => {
    try {
      await costumeService.updateCostume(id, costumeData);
      showToast.success(`Đã cập nhật trang phục "${costumeData.name}" thành công`);
      fetchCostumes();
    } catch (error) {
      console.error('Error updating costume:', error);
      showToast.error('Không thể cập nhật trang phục');
    }
  };

  const handleDeleteCostume = async (id: string) => {
    try {
      await costumeService.deleteCostume(id);
      showToast.success('Đã xóa trang phục thành công');
      fetchCostumes();
    } catch (error) {
      console.error('Error deleting costume:', error);
      showToast.error('Không thể xóa trang phục');
    }
  };

  const handleCloseDialog = () => {
    setState((prev) => ({
      ...prev,
      editingCostume: null,
      openCostumeDialog: false,
    }));
  };

  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: 'Mã SP',
      width: 130,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2">{params.value}</Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(params.value)
                .then(() => showToast.success(`Đã sao chép mã: ${params.value}`))
                .catch(() => showToast.error('Không thể sao chép mã'));
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
    {
      field: 'name',
      headerName: 'Tên sản phẩm',
      flex: 1,
    },
    {
      field: 'category',
      headerName: 'Danh mục',
      width: 150,
      valueGetter: (params) => params.row.category?.name,
    },
    {
      field: 'price',
      headerName: 'Giá thuê',
      width: 150,
      valueFormatter: (params) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(params.value),
    },
    {
      field: 'size',
      headerName: 'Kích thước',
      width: 120,
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={
            params.value === 'available'
              ? 'Có sẵn'
              : params.value === 'rented'
                ? 'Đã cho thuê'
                : 'Bảo trì'
          }
          color={
            params.value === 'available'
              ? 'success'
              : params.value === 'rented'
                ? 'primary'
                : 'warning'
          }
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => setState(prev => ({ ...prev, selectedCostume: params.row }))}
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setState(prev => ({
                ...prev,
                editingCostume: params.row,
                openCostumeDialog: true,
              }));
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCostume(params.row._id);
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const filteredCostumes = state.costumes
    .filter(costume => {
      // First filter by category
      const matchesCategory = state.selectedCategory === 'all' ||
        costume.categoryId === state.selectedCategory;

      // Then filter by search query
      const matchesSearch = state.searchQuery === '' ||
        costume.code.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        costume.name.toLowerCase().includes(state.searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });

  const sortedAndFilteredCostumes = filteredCostumes.sort((a, b) => {
    const factor = state.sortOrder === 'ASC' ? 1 : -1;
    if (state.sortBy === 'name') {
      return factor * a.name.localeCompare(b.name);
    }
    return factor * (a.price - b.price);
  });

  const displayedCostumes = sortedAndFilteredCostumes.slice(
    (state.page - 1) * state.limit,
    (state.page - 1) * state.limit + state.limit
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" fontWeight="bold">
              Quản lý trang phục
            </Typography>
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<CategoryOutlined />}
                onClick={() => setState(prev => ({ ...prev, openCategoryDialog: true }))}
                sx={{
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                Quản lý danh mục
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setState(prev => ({ ...prev, openCostumeDialog: true }))}
                sx={{
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  boxShadow: `0 4px 10px ${theme.palette.primary.main}40`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  },
                }}
              >
                Thêm trang phục
              </Button>
            </Stack>
          </motion.div>
        </Stack>

        {/* Stats */}
        {state.stats && <CostumeStatsComponent stats={state.stats} />}

        {/* Categories */}
        <Box sx={{ position: 'relative' }}>
          <IconButton
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => handleScroll('left')}
          >
            <NavigateBefore />
          </IconButton>
          <Box
            ref={scrollRef}
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': { display: 'none' },
              mx: 5,
              py: 1,
            }}
          >
            {state.categories.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                isSelected={state.selectedCategory === category._id}
                onSelect={() => setState(prev => ({ ...prev, selectedCategory: category._id }))}
                onEdit={() => setState(prev => ({
                  ...prev,
                  editingCategory: category,
                  openCategoryDialog: true,
                }))}
              />
            ))}
          </Box>
          <IconButton
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => handleScroll('right')}
          >
            <NavigateNext />
          </IconButton>
        </Box>

        {/* Filters */}
        <CostumeFilters
          searchQuery={state.searchQuery}
          onSearchChange={(value) => setState(prev => ({ ...prev, searchQuery: value, page: 1 }))}
          sortBy={state.sortBy}
          onSortByChange={(value) => setState(prev => ({ ...prev, sortBy: value }))}
          sortOrder={state.sortOrder}
          onSortOrderChange={() => setState(prev => ({
            ...prev,
            sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
          }))}
        />

        {/* Data Grid */}
        <Paper sx={{ height: 'calc(100vh - 400px)', overflow: 'auto' }}>
          <DataGrid
            rows={state.costumes}
            columns={columns}
            loading={state.loading}
            rowCount={state.total}
            pageSizeOptions={[10, 25, 50]}
            paginationMode="server"
            paginationModel={{
              page: state.page - 1,
              pageSize: state.limit,
            }}
            onPaginationModelChange={(model) => setState(prev => ({
              ...prev,
              page: model.page + 1,
              limit: model.pageSize,
            }))}
            getRowId={(row) => row._id}
            sx={{ bgcolor: 'background.paper' }}
          />
        </Paper>
      </Stack>

      {/* Dialogs */}
      <CategoryDialog
        open={state.openCategoryDialog}
        onClose={() => setState(prev => ({
          ...prev,
          openCategoryDialog: false,
          editingCategory: null,
        }))}
        onAdd={handleAddCategory}
        onEdit={(category) => handleEditCategory(category._id, category)}
        onDelete={handleDeleteCategory}
        editingCategory={state.editingCategory}
        categories={state.categories}
      />

      <CostumeDialog
        open={state.openCostumeDialog}
        onClose={() => setState(prev => ({
          ...prev,
          openCostumeDialog: false,
          editingCostume: null,
        }))}
        onSubmit={state.editingCostume
          ? (values) => handleEditCostume(state.editingCostume!._id, values)
          : handleCreateCostume}
        initialValues={state.editingCostume || undefined}
        categories={state.categories}
      />

      {state.selectedCostume && (
        <CostumeDetail
          costumeId={state.selectedCostume._id}
          onClose={() => setState(prev => ({ ...prev, selectedCostume: null }))}
        />
      )}
    </Box>
  );
};

export default CostumesPage;
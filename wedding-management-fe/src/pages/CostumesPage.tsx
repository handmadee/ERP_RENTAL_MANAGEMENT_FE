import React, { useState, useRef, useCallback } from 'react';
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
  LinearProgress,
  Snackbar,
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
  Category as CategoryIcon,
  Inventory2,
  CheckCircle,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import SwipeableViews from 'react-swipeable-views';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../components/common/Toast';

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  productCount?: number;
}

interface Costume {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  size: string;
  status: 'available' | 'rented' | 'maintenance';
  imageUrl: string;
  description: string;
  quantityAvailable: number;
  quantityRented: number;
  createdAt: string;
  updatedAt: string;
}

const categories: Category[] = [
  { id: 'all', name: 'Tất cả', color: '#1976d2', productCount: 0 },
  { id: 'wedding', name: 'Váy cưới', color: '#e91e63', description: 'Bộ sưu tập váy cưới cao cấp', productCount: 0 },
  { id: 'evening', name: 'Váy dạ hội', color: '#9c27b0', description: 'Váy dạ hội sang trọng', productCount: 0 },
  { id: 'traditional', name: 'Áo dài', color: '#f44336', description: 'Áo dài truyền thống', productCount: 0 },
  { id: 'accessories', name: 'Phụ kiện', color: '#4caf50', description: 'Phụ kiện thời trang', productCount: 0 },
];

const validationSchema = Yup.object({
  code: Yup.string().required('Mã sản phẩm là bắt buộc'),
  name: Yup.string().required('Tên trang phục là bắt buộc'),
  category: Yup.string().required('Danh mục là bắt buộc'),
  price: Yup.number()
    .required('Giá thuê là bắt buộc')
    .min(0, 'Giá thuê phải lớn hơn 0'),
  size: Yup.string().required('Kích thước là bắt buộc'),
  status: Yup.string().required('Trạng thái là bắt buộc'),
  quantityAvailable: Yup.number()
    .required('Số lượng có sẵn là bắt buộc')
    .min(0, 'Số lượng không thể âm'),
  description: Yup.string().required('Mô tả là bắt buộc'),
});

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (category: Omit<Category, 'id'>) => void;
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
  const formik = useFormik({
    initialValues: editingCategory || {
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
                onDelete(editingCategory.id);
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

const CostumeDetail: React.FC<{ costume: Costume; onClose: () => void }> = ({ costume, onClose }) => {
  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          {costume.name}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <img
              src={costume.imageUrl}
              alt={costume.name}
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Danh mục
                </Typography>
                <Chip label={costume.category} color="primary" />
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Giá thuê
                </Typography>
                <Typography variant="h6">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(costume.price)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Kích thước
                </Typography>
                <Typography>{costume.size}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Trạng thái
                </Typography>
                <Chip
                  label={
                    costume.status === 'available'
                      ? 'Có sẵn'
                      : costume.status === 'rented'
                      ? 'Đã cho thuê'
                      : 'Bảo trì'
                  }
                  color={
                    costume.status === 'available'
                      ? 'success'
                      : costume.status === 'rented'
                      ? 'primary'
                      : 'warning'
                  }
                />
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  Mô tả
                </Typography>
                <Typography>{costume.description}</Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

interface CostumeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<Costume, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
  const formik = useFormik({
    initialValues: initialValues || {
      code: '',
      name: '',
      category: '',
      price: 0,
      size: '',
      status: 'available' as const,
      imageUrl: '',
      description: '',
      quantityAvailable: 1,
      quantityRented: 0,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
    enableReinitialize: true,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {initialValues ? 'Chỉnh sửa trang phục' : 'Thêm trang phục mới'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
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
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                error={formik.touched.category && Boolean(formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
              >
                {categories.filter(cat => cat.id !== 'all').map((category) => (
                  <MenuItem key={category.id} value={category.name}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số lượng đã cho thuê"
                name="quantityRented"
                type="number"
                value={formik.values.quantityRented}
                onChange={formik.handleChange}
                error={formik.touched.quantityRented && Boolean(formik.errors.quantityRented)}
                helperText={formik.touched.quantityRented && formik.errors.quantityRented}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Link hình ảnh"
                name="imageUrl"
                value={formik.values.imageUrl}
                onChange={formik.handleChange}
                error={formik.touched.imageUrl && Boolean(formik.errors.imageUrl)}
                helperText={formik.touched.imageUrl && formik.errors.imageUrl}
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
          <Button type="submit" variant="contained" startIcon={initialValues ? <Edit /> : <Add />}>
            {initialValues ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
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
    error: <ErrorIcon />,
    info: <InfoIcon />,
    warning: <WarningIcon />,
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
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </Paper>
  );
};

const CostumesPage: React.FC = () => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);
  const [editingCostume, setEditingCostume] = useState<Costume | null>(null);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openCostumeDialog, setOpenCostumeDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'code',
      headerName: 'Mã SP',
      width: 130,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography>{params.value}</Typography>
          <Tooltip title="Sao chép mã">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (params.value) {
                  navigator.clipboard.writeText(params.value)
                    .then(() => {
                      showToast.success(`Đã sao chép mã sản phẩm: ${params.value}`);
                    })
                    .catch(() => {
                      showToast.error('Không thể sao chép mã sản phẩm. Vui lòng thử lại.');
                    });
                }
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                transition: 'all 0.2s',
              }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
    { field: 'name', headerName: 'Tên sản phẩm', flex: 1 },
    { field: 'category', headerName: 'Danh mục', width: 150 },
    {
      field: 'price',
      headerName: 'Giá thuê',
      width: 150,
      renderCell: (params) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(params.value),
    },
    { field: 'size', headerName: 'Kích thước', width: 120 },
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
      field: 'quantity',
      headerName: 'Số lượng',
      width: 250,
      renderCell: (params) => (
        <QuantityDisplay
          available={params.row.quantityAvailable}
          rented={params.row.quantityRented}
          total={params.row.quantityAvailable + params.row.quantityRented}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Xem chi tiết">
            <IconButton onClick={() => setSelectedCostume(params.row)} size="small">
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setEditingCostume(params.row);
                setOpenCostumeDialog(true);
              }}
              size="small"
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCostume(params.row.id);
              }}
              size="small"
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // Mock data with the new fields
  const costumes: Costume[] = [
    {
      id: '1',
      code: 'VC001',
      name: 'Váy cưới công chúa',
      category: 'Váy cưới',
      price: 5000000,
      size: 'S, M, L',
      status: 'available' as const,
      imageUrl: 'https://example.com/image1.jpg',
      description: 'Váy cưới phong cách công chúa với chất liệu ren cao cấp',
      quantityAvailable: 5,
      quantityRented: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Add more items here
  ];

  const filteredCostumes = selectedCategory === 'all'
    ? costumes
    : costumes.filter((costume) => costume.category === categories.find(cat => cat.id === selectedCategory)?.name);

  const sortedAndFilteredCostumes = filteredCostumes.sort((a, b) => {
    const factor = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') {
      return factor * a.name.localeCompare(b.name);
    }
    return factor * (a.price - b.price);
  });

  const displayedCostumes = sortedAndFilteredCostumes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleAddCategory = (newCategory: Omit<Category, 'id'>) => {
    const category: Category = {
      ...newCategory,
      id: Date.now().toString(),
      productCount: 0,
    };
    categories.push(category);
    showToast.success(`Đã thêm danh mục "${category.name}" thành công`);
  };

  const handleEditCategory = (category: Category) => {
    const index = categories.findIndex((c) => c.id === category.id);
    if (index !== -1) {
      const oldCategory = categories[index];
      categories[index] = category;
      showToast.success(
        `Đã cập nhật danh mục từ "${oldCategory.name}" thành "${category.name}"`
      );
    }
  };

  const handleDeleteCategory = (id: string) => {
    const index = categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      const category = categories[index];
      const productCount = costumes.filter((c) => c.category === category.name).length;
      if (productCount > 0) {
        showToast.error(
          `Không thể xóa danh mục "${category.name}" vì còn ${productCount} sản phẩm. Vui lòng chuyển hoặc xóa các sản phẩm trước.`
        );
        return;
      }
      categories.splice(index, 1);
      showToast.success(`Đã xóa danh mục "${category.name}" thành công`);
    }
  };

  const handleAddCostume = (values: Omit<Costume, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCostume: Costume = {
      ...values,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    costumes.push(newCostume);
    updateCategoryProductCount();
    showToast.success(
      `Đã thêm trang phục "${newCostume.name}" (${newCostume.code}) thành công`
    );
  };

  const handleEditCostume = (values: Omit<Costume, 'id' | 'createdAt' | 'updatedAt'>) => {
    const index = costumes.findIndex((c) => c.id === editingCostume?.id);
    if (index !== -1) {
      const oldCostume = costumes[index];
      costumes[index] = {
        ...costumes[index],
        ...values,
        updatedAt: new Date().toISOString(),
      };
      updateCategoryProductCount();
      showToast.success(
        `Đã cập nhật trang phục "${values.name}" (${values.code}) thành công`
      );
    }
    setEditingCostume(null);
  };

  const handleDeleteCostume = (id: string) => {
    const index = costumes.findIndex((c) => c.id === id);
    if (index !== -1) {
      const costume = costumes[index];
      if (costume.quantityRented > 0) {
        showToast.error(
          `Không thể xóa trang phục "${costume.name}" vì đang có ${costume.quantityRented} sản phẩm được thuê. Vui lòng chờ khách hàng trả hàng.`
        );
        return;
      }
      costumes.splice(index, 1);
      updateCategoryProductCount();
      showToast.success(
        `Đã xóa trang phục "${costume.name}" (${costume.code}) thành công`
      );
    }
  };

  const updateCategoryProductCount = () => {
    categories.forEach((category) => {
      if (category.id !== 'all') {
        category.productCount = costumes.filter((c) => c.category === category.name).length;
      }
    });
    categories[0].productCount = costumes.length;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
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
              startIcon={<CategoryIcon />}
              onClick={() => setOpenCategoryDialog(true)}
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
              onClick={() => setOpenCostumeDialog(true)}
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

      <Box sx={{ position: 'relative', mb: 3 }}>
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
          {categories.map((category) => (
            <Paper
              key={category.id}
              elevation={selectedCategory === category.id ? 3 : 1}
              sx={{
                p: 2,
                cursor: 'pointer',
                minWidth: 200,
                position: 'relative',
                bgcolor: selectedCategory === category.id ? category.color : 'background.paper',
                color: selectedCategory === category.id ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: selectedCategory === category.id ? category.color : 'action.hover',
                  '& .edit-button': { opacity: 1 },
                },
              }}
              onClick={() => setSelectedCategory(category.id)}
            >
              <Stack spacing={1}>
                <Typography variant="h6" fontWeight="bold">
                  {category.name}
                </Typography>
                {category.description && (
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {category.description}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Số sản phẩm: {category.productCount}
                </Typography>
                {category.id !== 'all' && (
                  <IconButton
                    className="edit-button"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(category);
                      setOpenCategoryDialog(true);
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Paper>
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

      <Paper sx={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}>
        <DataGrid
          rows={displayedCostumes}
          columns={columns}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{ bgcolor: 'background.paper' }}
        />
      </Paper>

      <CategoryDialog
        open={openCategoryDialog}
        onClose={() => {
          setOpenCategoryDialog(false);
          setEditingCategory(null);
        }}
        onAdd={handleAddCategory}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        categories={categories}
        editingCategory={editingCategory}
      />

      <CostumeDialog
        open={openCostumeDialog}
        onClose={() => {
          setOpenCostumeDialog(false);
          setEditingCostume(null);
        }}
        onSubmit={editingCostume ? handleEditCostume : handleAddCostume}
        initialValues={editingCostume || undefined}
        categories={categories}
      />

      {selectedCostume && (
        <CostumeDetail
          costume={selectedCostume}
          onClose={() => setSelectedCostume(null)}
        />
      )}
    </Box>
  );
};

export default CostumesPage;
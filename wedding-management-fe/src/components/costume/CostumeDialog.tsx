import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  useTheme,
  alpha,
  InputAdornment,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Add,
  Edit,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Costume, Category } from '../../types/costume';

interface CostumeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<Costume, '_id' | 'createdAt' | 'updatedAt'>) => void;
  initialValues?: Costume;
  categories: Category[];
}

const validationSchema = Yup.object({
  code: Yup.string().required('Mã sản phẩm là bắt buộc'),
  name: Yup.string().required('Tên trang phục là bắt buộc'),
  categoryId: Yup.string().required('Danh mục là bắt buộc'),
  price: Yup.number()
    .required('Giá thuê là bắt buộc')
    .min(0, 'Giá thuê phải lớn hơn 0'),
  size: Yup.string().required('Kích thước là bắt buộc'),
  status: Yup.string().required('Trạng thái là bắt buộc'),
  description: Yup.string().required('Mô tả là bắt buộc'),
  quantityAvailable: Yup.number()
    .required('Số lượng có sẵn là bắt buộc')
    .min(0, 'Số lượng không thể âm'),
});

const CostumeDialog: React.FC<CostumeDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  categories,
}) => {
  const theme = useTheme();
  const [previewImages, setPreviewImages] = useState<string[]>(
    initialValues?.imageUrl ? [initialValues.imageUrl] : []
  );

  const formik = useFormik({
    initialValues: initialValues || {
      code: '',
      name: '',
      categoryId: '',
      price: 0,
      size: '',
      status: 'available' as const,
      imageUrl: '',
      description: '',
      quantityAvailable: 1,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
    enableReinitialize: true,
  });

  const handleClose = () => {
    formik.resetForm();
    setPreviewImages([]);
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setPreviewImages([...previewImages, ...newImages]);
            formik.setFieldValue('images', [...previewImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newImages);
    formik.setFieldValue('images', newImages);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
                name="categoryId"
                value={formik.values.categoryId}
                onChange={formik.handleChange}
                error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
                helperText={formik.touched.categoryId && formik.errors.categoryId}
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: category.color,
                        }}
                      />
                      <Typography>{category.name}</Typography>
                    </Stack>
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
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="submit" variant="contained" startIcon={initialValues ? <Edit /> : <Add />}>
            {initialValues ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CostumeDialog; 
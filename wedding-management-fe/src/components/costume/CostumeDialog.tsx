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
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../common/Toast';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface Category {
  id: string;
  name: string;
}

interface CostumeDialogProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (values: any) => void;
  initialValues?: any;
}

const validationSchema = Yup.object({
  code: Yup.string().required('Mã sản phẩm là bắt buộc'),
  name: Yup.string()
    .required('Tên trang phục là bắt buộc')
    .min(2, 'Tên trang phục phải có ít nhất 2 ký tự'),
  categoryId: Yup.string().required('Danh mục là bắt buộc'),
  price: Yup.number()
    .required('Giá thuê là bắt buộc')
    .min(0, 'Giá thuê phải lớn hơn hoặc bằng 0'),
  total: Yup.number()
    .required('Số lượng là bắt buộc')
    .min(1, 'Số lượng phải lớn hơn 0'),
  available: Yup.number()
    .required('Số lượng có sẵn là bắt buộc')
    .min(0, 'Số lượng có sẵn phải lớn hơn hoặc bằng 0')
    .max(Yup.ref('total'), 'Số lượng có sẵn không thể lớn hơn tổng số lượng'),
  description: Yup.string(),
  images: Yup.array()
    .of(Yup.string())
    .min(1, 'Phải có ít nhất 1 hình ảnh'),
});

export const CostumeDialog: React.FC<CostumeDialogProps> = ({
  open,
  onClose,
  categories,
  onSubmit,
  initialValues,
}) => {
  const theme = useTheme();
  const [previewImages, setPreviewImages] = useState<string[]>(
    initialValues?.images || []
  );

  const formik = useFormik({
    initialValues: initialValues || {
      code: '',
      name: '',
      categoryId: '',
      price: '',
      total: '',
      available: '',
      description: '',
      images: [],
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      handleClose();
    },
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

  const availabilityPercentage =
    (Number(formik.values.available) / Number(formik.values.total)) * 100 || 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {initialValues ? 'Chỉnh sửa trang phục' : 'Thêm trang phục mới'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  fullWidth
                  label="Mã sản phẩm"
                  name="code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  error={formik.touched.code && Boolean(formik.errors.code)}
                  helperText={formik.touched.code && formik.errors.code}
                />
                <CopyToClipboard
                  text={formik.values.code}
                  onCopy={() => showToast.success('Đã sao chép mã sản phẩm')}
                >
                  <IconButton>
                    <CopyIcon />
                  </IconButton>
                </CopyToClipboard>
              </Stack>
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
                fullWidth
                select
                label="Danh mục"
                name="categoryId"
                value={formik.values.categoryId}
                onChange={formik.handleChange}
                error={
                  formik.touched.categoryId && Boolean(formik.errors.categoryId)
                }
                helperText={formik.touched.categoryId && formik.errors.categoryId}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
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
                  startAdornment: <Typography>₫</Typography>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tổng số lượng"
                name="total"
                type="number"
                value={formik.values.total}
                onChange={formik.handleChange}
                error={formik.touched.total && Boolean(formik.errors.total)}
                helperText={formik.touched.total && formik.errors.total}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số lượng có sẵn"
                name="available"
                type="number"
                value={formik.values.available}
                onChange={formik.handleChange}
                error={
                  formik.touched.available && Boolean(formik.errors.available)
                }
                helperText={formik.touched.available && formik.errors.available}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={
                  formik.touched.description && Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Stack spacing={1} alignItems="center">
                  <UploadIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography>
                    Kéo thả hoặc click để tải lên hình ảnh
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hỗ trợ: JPG, PNG (Tối đa 5MB/ảnh)
                  </Typography>
                </Stack>
              </Box>
              {formik.touched.images && formik.errors.images && (
                <Typography color="error" variant="caption">
                  {formik.errors.images as string}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <AnimatePresence>
                  {previewImages.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'background.paper',
                            '&:hover': {
                              bgcolor: 'error.main',
                              color: 'white',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tình trạng: {availabilityPercentage.toFixed(0)}% có sẵn
                </Typography>
                <Box
                  sx={{
                    height: 10,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${availabilityPercentage}%`,
                      bgcolor:
                        availabilityPercentage === 0
                          ? theme.palette.error.main
                          : availabilityPercentage <= 30
                          ? theme.palette.warning.main
                          : theme.palette.success.main,
                      transition: 'all 0.3s',
                    }}
                  />
                </Box>
                <Stack direction="row" spacing={1} mt={1}>
                  <Chip
                    size="small"
                    label={`Tổng: ${formik.values.total || 0}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={`Có sẵn: ${formik.values.available || 0}`}
                    color={
                      availabilityPercentage === 0
                        ? 'error'
                        : availabilityPercentage <= 30
                        ? 'warning'
                        : 'success'
                    }
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => formik.handleSubmit()}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          }}
        >
          {initialValues ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 
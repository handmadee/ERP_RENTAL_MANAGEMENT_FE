import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Category } from '../../types/costume';

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (category: Omit<Category, '_id' | 'createdAt' | 'updatedAt' | 'productCount'>) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  editingCategory: Category | null;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Tên danh mục là bắt buộc'),
  color: Yup.string().required('Màu sắc là bắt buộc'),
  description: Yup.string(),
});

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onClose,
  onAdd,
  onEdit,
  onDelete,
  editingCategory,
}) => {
  const formik = useFormik({
    initialValues: editingCategory || {
      name: '',
      color: '#1976d2',
      description: '',
    },
    validationSchema,
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

export default CategoryDialog; 
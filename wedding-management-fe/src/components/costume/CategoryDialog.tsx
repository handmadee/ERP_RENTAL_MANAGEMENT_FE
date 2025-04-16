import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showToast } from '../common/Toast';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Tên danh mục là bắt buộc')
    .min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  description: Yup.string(),
});

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onClose,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const theme = useTheme();
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      if (editingCategory) {
        onEditCategory({ ...editingCategory, ...values });
        showToast.success('Cập nhật danh mục thành công!');
      } else {
        onAddCategory(values);
        showToast.success('Thêm danh mục thành công!');
      }
      resetForm();
      setEditingCategory(null);
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    formik.setValues({
      name: category.name,
      description: category.description || '',
    });
  };

  const handleDelete = (id: string) => {
    onDeleteCategory(id);
    showToast.success('Xóa danh mục thành công!');
  };

  const handleCancel = () => {
    formik.resetForm();
    setEditingCategory(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Quản lý danh mục
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Tên danh mục"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            multiline
            rows={2}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={editingCategory ? <EditIcon /> : <AddIcon />}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              }}
            >
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </Button>
            {editingCategory && (
              <Button variant="outlined" onClick={handleCancel}>
                Hủy
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <List>
          {categories.map((category) => (
            <ListItem
              key={category.id}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemText
                primary={category.name}
                secondary={category.description}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEdit(category)}
                  sx={{ color: theme.palette.primary.main }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(category.id)}
                  sx={{ color: theme.palette.error.main }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}; 
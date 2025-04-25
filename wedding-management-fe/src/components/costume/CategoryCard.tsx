import React from 'react';
import { Paper, Stack, Typography, IconButton, Box, Tooltip } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Category } from '../../types/costume';

interface CategoryCardProps {
    category: Category;
    isSelected: boolean;
    onSelect: () => void;
    onEdit?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    isSelected,
    onSelect,
    onEdit,
}) => {
    return (
        <Paper
            elevation={isSelected ? 3 : 1}
            sx={{
                p: 2,
                cursor: 'pointer',
                minWidth: 200,
                position: 'relative',
                bgcolor: isSelected ? category.color : 'background.paper',
                color: isSelected ? 'white' : 'text.primary',
                transition: 'all 0.2s ease',
                '&:hover': {
                    bgcolor: isSelected ? category.color : 'action.hover',
                    transform: 'translateY(-2px)',
                    '& .edit-button': { opacity: 1 },
                },
            }}
            onClick={onSelect}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: category.color,
                        }}
                    />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {category.productCount} sản phẩm
                    </Typography>
                </Box>
                {onEdit && (
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
                            onEdit();
                        }}
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                )}
            </Stack>
        </Paper>
    );
};

export default CategoryCard; 
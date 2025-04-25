import React from 'react';
import {
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Typography,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
} from '@mui/material';
import {
    Search,
    Clear,
    Sort,
    ArrowUpward,
    ArrowDownward,
} from '@mui/icons-material';

interface CostumeFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: 'name' | 'price';
    onSortByChange: (value: 'name' | 'price') => void;
    sortOrder: 'ASC' | 'DESC';
    onSortOrderChange: () => void;
}

const CostumeFilters: React.FC<CostumeFiltersProps> = ({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortByChange,
    sortOrder,
    onSortOrderChange,
}) => {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <TextField
                fullWidth
                placeholder="Tìm kiếm theo mã hoặc tên sản phẩm..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={() => onSearchChange('')}>
                                <Clear />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{
                    maxWidth: 400,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        '&:hover': {
                            '& > fieldset': {
                                borderColor: 'primary.main',
                            },
                        },
                    },
                }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                    Sắp xếp theo:
                </Typography>
                <ToggleButtonGroup
                    value={sortBy}
                    exclusive
                    onChange={(e, newValue) => {
                        if (newValue) onSortByChange(newValue);
                    }}
                    size="small"
                >
                    <ToggleButton value="name">
                        <Tooltip title="Sắp xếp theo tên">
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Sort />
                                <Typography variant="body2">Tên</Typography>
                            </Stack>
                        </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="price">
                        <Tooltip title="Sắp xếp theo giá">
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Sort />
                                <Typography variant="body2">Giá</Typography>
                            </Stack>
                        </Tooltip>
                    </ToggleButton>
                </ToggleButtonGroup>
                <IconButton onClick={onSortOrderChange} size="small">
                    {sortOrder === 'ASC' ? <ArrowUpward /> : <ArrowDownward />}
                </IconButton>
            </Stack>
        </Stack>
    );
};

export default CostumeFilters; 
import React, { useState, useEffect } from 'react';
import {
    Autocomplete,
    TextField,
    InputAdornment,
    Stack,
    Typography,
    Chip,
    Avatar,
    Tooltip,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import costumeService from '@/services/costumeService';
import { debounce } from 'lodash';

interface Category {
    _id: string;
    name: string;
    color: string;
}

interface Costume {
    _id: string;
    code: string;
    name: string;
    price: number;
    size: string;
    status: string;
    imageUrl?: string;
    listImageUrl?: string[];
    description: string;
    quantityAvailable: number;
    category?: Category;
}

interface ProductSearchProps {
    onSelect: (product: Costume | null) => void;
    disabled?: boolean;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onSelect, disabled }) => {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<Costume[]>([]);
    const [loading, setLoading] = useState(false);

    const searchProducts = async (search: string) => {
        try {
            setLoading(true);
            const response = await costumeService.searchCostumes({
                searchTerm: search,
                limit: 10,
                page: 1,
            });
            console.log("🚀 ~ searchProducts ~ response:", response);

            // Đảm bảo quantityAvailable luôn là số hợp lệ
            const validatedItems = (response.items || []).map(item => ({
                ...item,
                quantityAvailable: typeof item.quantityAvailable === 'number' && !isNaN(item.quantityAvailable)
                    ? item.quantityAvailable
                    : 0
            }));

            setOptions(validatedItems);
        } catch (error) {
            console.error('Error searching products:', error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const debouncedSearch = debounce(searchProducts, 300);

    useEffect(() => {
        if (inputValue) {
            debouncedSearch(inputValue);
        } else {
            setOptions([]);
        }
        return () => {
            debouncedSearch.cancel();
        };
    }, [inputValue]);

    // Hàm kiểm tra sản phẩm có sẵn hay không
    const isProductAvailable = (option: Costume): boolean => {
        const availableQty = typeof option.quantityAvailable === 'number' && !isNaN(option.quantityAvailable)
            ? option.quantityAvailable
            : 0;
        return availableQty <= 0;
    };

    return (
        <Autocomplete
            fullWidth
            options={options}
            getOptionLabel={(option) => `${option.code} - ${option.name}`}
            loading={loading}
            onInputChange={(_, newValue) => setInputValue(newValue)}
            onChange={(_, value) => onSelect(value)}
            disabled={disabled}
            getOptionDisabled={(option) => isProductAvailable(option)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Tìm kiếm sản phẩm"
                    placeholder="Nhập tên hoặc mã sản phẩm..."
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <>
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                            </>
                        ),
                    }}
                />
            )}
            renderOption={(props, option) => {
                const { key, ...restProps } = props;
                const isOutOfStock = isProductAvailable(option);
                const qtyAvailable = typeof option.quantityAvailable === 'number' && !isNaN(option.quantityAvailable)
                    ? option.quantityAvailable
                    : 0;

                return (
                    <Tooltip title={isOutOfStock ? "Sản phẩm đã hết hàng" : ""}>
                        <li key={key} {...restProps} style={{ opacity: isOutOfStock ? 0.5 : 1 }}>
                            <Stack direction="row" spacing={2} width="100%" alignItems="center">
                                <Avatar
                                    src={option.imageUrl}
                                    alt={option.name}
                                    variant="rounded"
                                    sx={{ width: 48, height: 48 }}
                                />
                                <Stack spacing={0.5} flex={1}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle2">
                                            {option.name}
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Chip
                                                size="small"
                                                label={`Size ${option.size}`}
                                                color="primary"
                                                variant="outlined"
                                            />
                                            <Chip
                                                size="small"
                                                label={`Còn ${qtyAvailable}`}
                                                color={qtyAvailable > 0 ? 'success' : 'error'}
                                            />
                                        </Stack>
                                    </Stack>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        <Typography variant="body2">
                                            Mã: {option.code}
                                        </Typography>
                                        <Typography variant="body2">
                                            Giá: {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(option.price)}
                                        </Typography>
                                        {option.category && (
                                            <Typography variant="body2">
                                                Loại: {option.category.name}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Stack>
                        </li>
                    </Tooltip>
                );
            }}
        />
    );
};

export default ProductSearch; 
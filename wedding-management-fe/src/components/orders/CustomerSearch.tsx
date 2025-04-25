import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  InputAdornment,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { customerService } from '@/services/customerService';
import { debounce } from 'lodash';

interface OrderStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
}

interface Customer {
  _id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  address: string;
  totalSpent: number;
  orderStats: OrderStats;
}

interface CustomerSearchProps {
  onSelect: (customer: Customer | null) => void;
  disabled?: boolean;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({ onSelect, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const searchCustomers = async (search: string) => {
    try {
      setLoading(true);
      const response = await customerService.getCustomersWithStats(search);
      setOptions(response.data.data);
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(searchCustomers, 300);

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

  const getOrderStatusText = (stats: OrderStats) => {
    return `${stats.total} đơn (${stats.completed} TC - ${stats.cancelled} Hủy - ${stats.pending} Chờ)`;
  };

  return (
    <Autocomplete
      fullWidth
      options={options}
      getOptionLabel={(option) => `${option.fullName} - ${option.phone}`}
      loading={loading}
      onInputChange={(_, newValue) => setInputValue(newValue)}
      onChange={(_, value) => onSelect(value)}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tìm kiếm khách hàng"
          placeholder="Nhập tên hoặc số điện thoại..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Stack spacing={1} width="100%">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">
                {option.fullName} - {option.customerCode}
              </Typography>
              <Chip
                size="small"
                label={getOrderStatusText(option.orderStats)}
                color={option.orderStats.total > 0 ? 'primary' : 'default'}
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{ color: 'text.secondary' }}
            >
              <Typography variant="body2">
                SĐT: {option.phone}
              </Typography>
              <Typography variant="body2">
                Địa chỉ: {option.address}
              </Typography>
            </Stack>
          </Stack>
        </li>
      )}
    />
  );
};

export default CustomerSearch; 
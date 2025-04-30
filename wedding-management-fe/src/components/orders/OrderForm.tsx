import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
    TextField,
    Button,
    Box,
    Grid,
    IconButton,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Order, OrderItem } from '../../types/order';
import { ORDER_STATUS } from '../../types/order';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { customerService } from '../../services/customerService';

const orderSchema = z.object({
    orderCode: z.string().min(1, 'Order code is required'),
    customerId: z.string().min(1, 'Customer is required'),
    orderDate: z.date(),
    returnDate: z.date(),
    items: z.array(z.object({
        costumeId: z.string().min(1, 'Costume is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        price: z.number().min(0, 'Price must be non-negative'),
    })).min(1, 'At least one item is required'),
    deposit: z.number().min(0, 'Deposit must be non-negative'),
    note: z.string().optional(),
    status: z.enum([ORDER_STATUS.PENDING, ORDER_STATUS.ACTIVE, ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED]),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
    initialData?: Order | null;
    onSubmit: (data: OrderFormData) => void;
    onCancel: () => void;
}

export function OrderForm({ initialData, onSubmit, onCancel }: OrderFormProps) {
    const [customers, setCustomers] = useState<Array<{ id: string; label: string }>>([]);
    const [searchCustomer, setSearchCustomer] = useState('');

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            orderCode: initialData?.orderCode || '',
            customerId: initialData?.customerId || '',
            orderDate: initialData?.orderDate ? new Date(initialData.orderDate) : new Date(),
            returnDate: initialData?.returnDate ? new Date(initialData.returnDate) : new Date(),
            items: initialData?.items || [{ costumeId: '', quantity: 1, price: 0 }],
            deposit: initialData?.deposit || 0,
            note: initialData?.note || '',
            status: initialData?.status || ORDER_STATUS.PENDING,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const loadCustomers = async (search: string) => {
        try {
            const response = await customerService.getCustomers({ search, limit: 10 });
            setCustomers(
                response.data.map((customer) => ({
                    id: customer._id,
                    label: `${customer.customerCode} - ${customer.fullName}`,
                }))
            );
        } catch (error) {
            console.error('Failed to load customers:', error);
        }
    };

    const calculateSubtotal = (item: OrderItem) => {
        return item.quantity * item.price;
    };

    const calculateTotal = () => {
        const items = watch('items');
        return items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Controller
                            name="orderCode"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Order Code"
                                    fullWidth
                                    error={!!errors.orderCode}
                                    helperText={errors.orderCode?.message}
                                    disabled={!!initialData}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="customerId"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    options={customers}
                                    getOptionLabel={(option) => option.label}
                                    onInputChange={(_, value) => {
                                        setSearchCustomer(value);
                                        loadCustomers(value);
                                    }}
                                    onChange={(_, value) => {
                                        field.onChange(value?.id || '');
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Customer"
                                            error={!!errors.customerId}
                                            helperText={errors.customerId?.message}
                                        />
                                    )}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="orderDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    label="Order Date"
                                    value={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!errors.orderDate,
                                            helperText: errors.orderDate?.message,
                                        },
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="returnDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    label="Return Date"
                                    value={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!errors.returnDate,
                                            helperText: errors.returnDate?.message,
                                        },
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6">Items</Typography>
                            {fields.map((field, index) => (
                                <Box key={field.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Controller
                                        name={`items.${index}.costumeId`}
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Costume"
                                                fullWidth
                                                error={!!errors.items?.[index]?.costumeId}
                                                helperText={errors.items?.[index]?.costumeId?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name={`items.${index}.quantity`}
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Quantity"
                                                type="number"
                                                sx={{ width: 120 }}
                                                error={!!errors.items?.[index]?.quantity}
                                                helperText={errors.items?.[index]?.quantity?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name={`items.${index}.price`}
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Price"
                                                type="number"
                                                sx={{ width: 120 }}
                                                error={!!errors.items?.[index]?.price}
                                                helperText={errors.items?.[index]?.price?.message}
                                            />
                                        )}
                                    />
                                    <IconButton
                                        onClick={() => remove(index)}
                                        color="error"
                                        disabled={fields.length === 1}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => append({ costumeId: '', quantity: 1, price: 0 })}
                            >
                                Add Item
                            </Button>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="deposit"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Deposit"
                                    type="number"
                                    fullWidth
                                    error={!!errors.deposit}
                                    helperText={errors.deposit?.message}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth error={!!errors.status}>
                                    <InputLabel>Status</InputLabel>
                                    <Select {...field} label="Status">
                                        {Object.values(ORDER_STATUS).map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.status && (
                                        <FormHelperText>{errors.status.message}</FormHelperText>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="note"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Note"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    error={!!errors.note}
                                    helperText={errors.note?.message}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Typography variant="h6">
                                Total: ${calculateTotal().toFixed(2)}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting}
                            >
                                {initialData ? 'Update' : 'Create'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </form>
    );
} 
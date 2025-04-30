import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Grid } from '@mui/material';
import type { Customer } from '../../types/customer';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const customerSchema = z.object({
    customerCode: z.string().min(1, 'Customer code is required'),
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(1, 'Phone number is required')
        .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
    address: z.string().optional(),
    note: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
    initialData?: any | null;
    onSubmit: (data: CustomerFormData) => void;
    onCancel: () => void;
}

export function CustomerForm({ initialData, onSubmit, onCancel }: CustomerFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            customerCode: initialData?.customerCode || '',
            fullName: initialData?.fullName || '',
            phone: initialData?.phone || '',
            address: initialData?.address || '',
            note: initialData?.note || '',
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Controller
                            name="customerCode"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Customer Code"
                                    fullWidth
                                    error={!!errors.customerCode}
                                    helperText={errors.customerCode?.message}
                                    disabled={!!initialData}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="fullName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Full Name"
                                    fullWidth
                                    error={!!errors.fullName}
                                    helperText={errors.fullName?.message}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Phone Number"
                                    fullWidth
                                    error={!!errors.phone}
                                    helperText={errors.phone?.message}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="address"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Address"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    error={!!errors.address}
                                    helperText={errors.address?.message}
                                />
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
                                    rows={2}
                                    error={!!errors.note}
                                    helperText={errors.note?.message}
                                />
                            )}
                        />
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
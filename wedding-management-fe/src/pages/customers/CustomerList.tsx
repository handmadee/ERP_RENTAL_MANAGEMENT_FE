import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    TextField,
    Box,
    Typography,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { customerService, Customer } from '../../services/customerService';
import { CustomerForm } from '../../components/customers/CustomerForm';

export default function CustomerList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [openForm, setOpenForm] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerService.getCustomers({
                page,
                limit,
                search,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            });
            setCustomers(response.data);
            setTotal(response.metadata.total);
        } catch (err) {
            setError('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [page, search]);

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setOpenForm(true);
    };

    const handleDelete = async () => {
        if (!selectedCustomer) return;
        try {
            await customerService.deleteCustomer(selectedCustomer._id);
            setSuccessMessage('Customer deleted successfully');
            fetchCustomers();
            setOpenDelete(false);
        } catch (err) {
            setError('Failed to delete customer');
        }
    };

    const handleSave = async (data: Partial<Customer>) => {
        try {
            if (selectedCustomer) {
                await customerService.updateCustomer(selectedCustomer._id, data);
                setSuccessMessage('Customer updated successfully');
            } else {
                await customerService.createCustomer({
                    fullName: data.fullName || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    note: data.note
                });
                setSuccessMessage('Customer created successfully');
            }
            setOpenForm(false);
            fetchCustomers();
        } catch (err) {
            setError('Failed to save customer');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Customers
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setSelectedCustomer(null);
                        setOpenForm(true);
                    }}
                >
                    Add Customer
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ maxWidth: 500 }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Customer Code</TableCell>
                            <TableCell>Full Name</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer._id}>
                                <TableCell>{customer.customerCode}</TableCell>
                                <TableCell>{customer.fullName}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>{customer.address || '-'}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(customer)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            setSelectedCustomer(customer);
                                            setOpenDelete(true);
                                        }}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
                <DialogContent>
                    <CustomerForm
                        initialData={selectedCustomer}
                        onSubmit={handleSave}
                        onCancel={() => setOpenForm(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Delete Customer</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this customer?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity="error">{error}</Alert>
            </Snackbar>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity="success">{successMessage}</Alert>
            </Snackbar>
        </Box>
    );
} 
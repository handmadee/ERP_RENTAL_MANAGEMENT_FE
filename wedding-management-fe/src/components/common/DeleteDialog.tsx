import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface DeleteDialogProps {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
    open,
    title,
    message,
    onClose,
    onConfirm,
    loading = false,
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Hủy
                </Button>
                <LoadingButton
                    onClick={onConfirm}
                    color="error"
                    loading={loading}
                    variant="contained"
                >
                    Xóa
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}; 
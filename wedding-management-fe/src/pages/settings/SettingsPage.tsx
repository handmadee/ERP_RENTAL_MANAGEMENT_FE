import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    TextField,
    Switch,
    FormControlLabel,
    Button,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import { Settings, settingsService } from '../../services/settingsService';

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await settingsService.getSettings();
            setSettings(data);
        } catch (err) {
            setError('Không thể tải thông tin cài đặt');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedSettings = await settingsService.updateSettings({
                companyName: settings.companyName,
                email: settings.email,
                phone: settings.phone,
                address: settings.address,
                currency: settings.currency,
                language: settings.language,
                notifications: settings.notifications,
                security: settings.security,
            });
            setSettings(updatedSettings);
            setSuccess('Đã lưu thay đổi thành công');
        } catch (err) {
            setError('Không thể lưu thay đổi');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Cài đặt hệ thống
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Thông tin công ty */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Thông tin công ty
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box display="flex" flexDirection="column" gap={2}>
                                <TextField
                                    label="Tên công ty"
                                    fullWidth
                                    value={settings?.companyName || ''}
                                    onChange={(e) => setSettings(prev => prev ? { ...prev, companyName: e.target.value } : null)}
                                />
                                <TextField
                                    label="Email"
                                    fullWidth
                                    value={settings?.email || ''}
                                    onChange={(e) => setSettings(prev => prev ? { ...prev, email: e.target.value } : null)}
                                />
                                <TextField
                                    label="Số điện thoại"
                                    fullWidth
                                    value={settings?.phone || ''}
                                    onChange={(e) => setSettings(prev => prev ? { ...prev, phone: e.target.value } : null)}
                                />
                                <TextField
                                    label="Địa chỉ"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={settings?.address || ''}
                                    onChange={(e) => setSettings(prev => prev ? { ...prev, address: e.target.value } : null)}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Cài đặt thông báo */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Cài đặt thông báo
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box display="flex" flexDirection="column" gap={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings?.notifications.email || false}
                                            onChange={(e) => setSettings(prev => prev ? {
                                                ...prev,
                                                notifications: {
                                                    ...prev.notifications,
                                                    email: e.target.checked
                                                }
                                            } : null)}
                                        />
                                    }
                                    label="Thông báo qua email"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings?.notifications.push || false}
                                            onChange={(e) => setSettings(prev => prev ? {
                                                ...prev,
                                                notifications: {
                                                    ...prev.notifications,
                                                    push: e.target.checked
                                                }
                                            } : null)}
                                        />
                                    }
                                    label="Thông báo đẩy"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings?.notifications.sms || false}
                                            onChange={(e) => setSettings(prev => prev ? {
                                                ...prev,
                                                notifications: {
                                                    ...prev.notifications,
                                                    sms: e.target.checked
                                                }
                                            } : null)}
                                        />
                                    }
                                    label="Thông báo qua SMS"
                                />
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Cài đặt bảo mật */}
                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Cài đặt bảo mật
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings?.twoFactorEnabled || false}
                                        onChange={(e) => setSettings(prev => prev ? {
                                            ...prev,
                                            twoFactorEnabled: e.target.checked,
                                            security: {
                                                ...prev.security,
                                                twoFactorEnabled: e.target.checked
                                            }
                                        } : null)}
                                    />
                                }
                                label="Xác thực 2 yếu tố"
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </Box>
        </Box>
    );
};

export default SettingsPage; 
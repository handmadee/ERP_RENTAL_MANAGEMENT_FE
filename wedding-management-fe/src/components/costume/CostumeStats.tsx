import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Stack,
    LinearProgress,
    useTheme,
} from '@mui/material';
import {
    Inventory2 as InventoryIcon,
    ShoppingCart as RentedIcon,
    Build as MaintenanceIcon,
} from '@mui/icons-material';
import { CostumeStats as CostumeStatsType } from '../../types/costume';

interface StatCardProps {
    title: string;
    value: number;
    total: number;
    color: string;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, total, color, icon }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
        <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ color }}>{icon}</Box>
                    <Typography variant="subtitle2" color="text.secondary">
                        {title}
                    </Typography>
                </Stack>
                <Typography variant="h4" fontWeight="bold">
                    {value}
                </Typography>
                <Box>
                    <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                            height: 8,
                            borderRadius: 1,
                            bgcolor: 'background.default',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: color,
                            },
                        }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {percentage.toFixed(1)}% của tổng số
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
};

interface CostumeStatsProps {
    stats: CostumeStatsType;
}

const CostumeStats: React.FC<CostumeStatsProps> = ({ stats }) => {
    const theme = useTheme();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <StatCard
                    title="Tổng số trang phục"
                    value={stats.totalCostumes}
                    total={stats.totalCostumes}
                    color={theme.palette.primary.main}
                    icon={<InventoryIcon />}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <StatCard
                    title="Đang cho thuê"
                    value={stats.rentedCostumes}
                    total={stats.totalCostumes}
                    color={theme.palette.success.main}
                    icon={<RentedIcon />}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <StatCard
                    title="Đang bảo trì"
                    value={stats.maintenanceCostumes}
                    total={stats.totalCostumes}
                    color={theme.palette.warning.main}
                    icon={<MaintenanceIcon />}
                />
            </Grid>
        </Grid>
    );
};

export default CostumeStats; 
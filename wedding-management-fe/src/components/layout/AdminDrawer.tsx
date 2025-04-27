import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Typography,
  Divider,
  useTheme,
  alpha,
  Collapse,
  Badge,
  Tooltip,
  Stack,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  Button,
  Paper,
} from '@mui/material';
import {
  Dashboard,
  ShoppingBag,
  People,
  Settings,
  Menu as MenuIcon,
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  Assignment,
  LocalOffer,
  Assessment,
  Event,
  Notifications,
  ExitToApp,
  AccountCircle,
  Business,
  Info,
  Language,
  CurrencyExchange,
  Storage,
  Brightness4,
  Brightness7,
  KeyboardArrowDown,
  Security,
  Speed,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings as AppSettings, settingsService } from '../../services/settingsService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const DRAWER_WIDTH = 280;

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  children?: {
    title: string;
    path: string;
    badge?: number;
  }[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Tổng quan',
    path: '/dashboard',
    icon: <Dashboard />,
  },
  {
    title: 'Đơn hàng',
    path: '/orders',
    icon: <Assignment />,
    badge: 5,
    children: [
      { title: 'Danh sách đơn hàng', path: '/orders', badge: 3 },
      { title: 'Tạo đơn hàng', path: '/orders/create' },
    ],
  },
  {
    title: 'Trang phục',
    path: '/costumes',
    icon: <ShoppingBag />,
    badge: 2,
    children: [
      { title: 'Danh sách trang phục', path: '/costumes' },
      { title: 'Thêm trang phục', path: '/costumes/create' },
      { title: 'Danh mục', path: '/costumes/categories', badge: 2 },
    ],
  },
  {
    title: 'Khách hàng',
    path: '/customers',
    icon: <People />,
    badge: 1,
  },
  {
    title: 'Sự kiện',
    path: '/events',
    icon: <Event />,
  },
  {
    title: 'Báo cáo',
    path: '/reports',
    icon: <Assessment />,
    children: [
      { title: 'Doanh thu', path: '/reports/revenue' },
      { title: 'Đơn hàng', path: '/reports/orders' },
      { title: 'Khách hàng', path: '/reports/customers' },
    ],
  },
  {
    title: 'Cài đặt',
    path: '/settings',
    icon: <Settings />,
  },
];

interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const AdminDrawer: React.FC<AdminDrawerProps> = ({ open, onClose, onToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});
  const [notificationCount, setNotificationCount] = useState(3);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [systemStatsAnchor, setSystemStatsAnchor] = useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settings = await settingsService.getSettings();
        setAppSettings(settings);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubMenuClick = (path: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  // Auto expand submenu of current path
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children?.some((child) => isCurrentPath(child.path))) {
        setOpenSubMenus((prev) => ({ ...prev, [item.path]: true }));
      }
    });
  }, [location.pathname]);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleSystemStatsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSystemStatsAnchor(event.currentTarget);
  };

  const handleSystemStatsClose = () => {
    setSystemStatsAnchor(null);
  };

  const handleLogout = () => {
    // Add logout logic here
    handleUserMenuClose();
  };

  const handleToggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: appSettings?.currency || 'VND',
    }).format(value);
  };

  const renderSystemHealth = () => {
    // Sample system health metrics
    const metrics = [
      { label: 'CPU', value: '12%', color: 'success.main' },
      { label: 'RAM', value: '45%', color: 'success.main' },
      { label: 'Storage', value: '32%', color: 'success.main' },
      { label: 'Uptime', value: '99.9%', color: 'success.main' },
    ];

    return (
      <Menu
        anchorEl={systemStatsAnchor}
        open={Boolean(systemStatsAnchor)}
        onClose={handleSystemStatsClose}
        PaperProps={{
          sx: {
            width: 280,
            p: 2,
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Thông tin hệ thống
        </Typography>
        <Stack spacing={2}>
          {metrics.map((metric, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">{metric.label}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 100, mr: 1 }}>
                  <LinearProgressWithLabel value={parseInt(metric.value)} color={metric.color} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {metric.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Version:</strong> {appSettings?.version || '1.0.0'}
          </Typography>
          <Typography variant="body2">
            <strong>Last Update:</strong> {appSettings?.updatedAt ? format(new Date(appSettings.updatedAt), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
          </Typography>
          <Typography variant="body2">
            <strong>Environment:</strong> Production
          </Typography>
        </Stack>
      </Menu>
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const isSelected = isCurrentPath(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isSubMenuOpen = openSubMenus[item.path];
    const isParentOfCurrentPath = item.children?.some((child) => isCurrentPath(child.path));

    return (
      <React.Fragment key={item.path}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleSubMenuClick(item.path);
              } else {
                navigate(item.path);
              }
            }}
            selected={isSelected || isParentOfCurrentPath}
            sx={{
              borderRadius: 1.5,
              mx: 1,
              mb: 0.5,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -8,
                top: '50%',
                transform: 'translateY(-50%)',
                height: '60%',
                width: 3,
                bgcolor: 'primary.main',
                borderRadius: 1,
                opacity: (isSelected || isParentOfCurrentPath) ? 1 : 0,
                transition: 'opacity 0.2s',
              },
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                backdropFilter: 'blur(4px)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              },
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                '& .MuiListItemIcon-root': {
                  transform: 'scale(1.1)',
                },
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: (isSelected || isParentOfCurrentPath) ? 'primary.main' : 'text.secondary',
                transition: 'transform 0.2s, color 0.2s',
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error" sx={{ '& .MuiBadge-badge': { right: -3, top: 3 } }}>
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: (isSelected || isParentOfCurrentPath) ? 600 : 400,
                color: (isSelected || isParentOfCurrentPath) ? 'primary.main' : 'text.primary',
              }}
            />
            {hasChildren && (
              <Box
                component="span"
                sx={{
                  transition: 'transform 0.3s',
                  transform: isSubMenuOpen ? 'rotate(-180deg)' : 'none',
                }}
              >
                {isSubMenuOpen ? <ExpandLess /> : <ExpandMore />}
              </Box>
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => (
                <ListItemButton
                  key={child.path}
                  onClick={() => navigate(child.path)}
                  selected={isCurrentPath(child.path)}
                  sx={{
                    pl: 7,
                    py: 0.5,
                    borderRadius: 1.5,
                    mx: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      backdropFilter: 'blur(4px)',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                      },
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemText
                    primary={child.title}
                    primaryTypographyProps={{
                      fontSize: '0.815rem',
                      fontWeight: isCurrentPath(child.path) ? 600 : 400,
                      color: isCurrentPath(child.path) ? 'primary.main' : 'text.primary',
                    }}
                  />
                  {child.badge && (
                    <Badge badgeContent={child.badge} color="error" sx={{ ml: 1 }} />
                  )}
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const LinearProgressWithLabel = ({ value, color }: { value: number, color: string }) => (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <Box
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.grey[500], 0.1),
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${value}%`,
              bgcolor: color,
              borderRadius: 3,
              transition: 'width 0.5s ease',
            }}
          />
        </Box>
      </Box>
    </Box>
  );

  const renderUserMenu = () => (
    <Menu
      anchorEl={userMenuAnchor}
      open={Boolean(userMenuAnchor)}
      onClose={handleUserMenuClose}
      PaperProps={{
        sx: {
          width: 200,
          p: 1,
          mt: 1.5,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={() => navigate('/profile')}>
        <AccountCircle sx={{ mr: 1.5, fontSize: '1.2rem' }} />
        <Typography variant="body2">Hồ sơ</Typography>
      </MenuItem>
      <MenuItem onClick={() => navigate('/settings')}>
        <Settings sx={{ mr: 1.5, fontSize: '1.2rem' }} />
        <Typography variant="body2">Cài đặt</Typography>
      </MenuItem>
      <Divider sx={{ my: 1 }} />
      <MenuItem onClick={handleToggleTheme}>
        {darkMode ? (
          <Brightness7 sx={{ mr: 1.5, fontSize: '1.2rem' }} />
        ) : (
          <Brightness4 sx={{ mr: 1.5, fontSize: '1.2rem' }} />
        )}
        <Typography variant="body2">
          Chế độ {darkMode ? 'sáng' : 'tối'}
        </Typography>
      </MenuItem>
      <Divider sx={{ my: 1 }} />
      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
        <ExitToApp sx={{ mr: 1.5, fontSize: '1.2rem' }} />
        <Typography variant="body2">Đăng xuất</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <Drawer
      variant="permanent"
      open={open}
      onClose={onClose}
      sx={{
        width: open ? DRAWER_WIDTH : 72,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : 72,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['width', 'box-shadow'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          boxShadow: open ? `0 2px 10px ${alpha(theme.palette.common.black, 0.08)}` : 'none',
          backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.95)}, ${theme.palette.background.paper})`,
          backdropFilter: 'blur(6px)',
        },
      }}
    >
      {/* App Logo and Toggle Button */}
      <Box
        sx={{
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: open ? 3 : 1,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            height: 1,
            bgcolor: 'divider',
          },
        }}
      >
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: 32,
                height: 32,
                marginRight: 8,
                objectFit: 'contain',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              {appSettings?.companyName || 'Wedding Management'}
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={onToggle}
          sx={{
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        >
          {open ? <ChevronLeft /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ mt: 2, mb: 2, px: open ? 3 : 1 }}>
        <Stack
          direction={open ? 'row' : 'column'}
          spacing={2}
          alignItems="center"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            transition: 'all 0.3s',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`,
            },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: theme.palette.primary.main,
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
              onClick={handleUserMenuOpen}
            >
              A
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: 'success.main',
                border: `2px solid ${theme.palette.background.paper}`,
              }}
            />
          </Box>
          {open && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  noWrap
                  sx={{ cursor: 'pointer' }}
                  onClick={handleUserMenuOpen}
                >
                  Admin User
                </Typography>
                <KeyboardArrowDown
                  fontSize="small"
                  sx={{
                    ml: 0.5,
                    cursor: 'pointer',
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                  onClick={handleUserMenuOpen}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                {appSettings?.email || 'admin@example.com'}
              </Typography>
            </Box>
          )}
          {open && (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Thông báo">
                <IconButton size="small">
                  <Badge badgeContent={notificationCount} color="error">
                    <Notifications fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Thông tin hệ thống">
                <IconButton size="small" onClick={handleSystemStatsOpen}>
                  <Speed fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          {renderUserMenu()}
          {renderSystemHealth()}
        </Stack>
      </Box>

      {/* Company Info */}
      {open && appSettings && (
        <Box sx={{ mx: 3, mb: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            }}
          >
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Business
                  fontSize="small"
                  sx={{ color: 'info.main', mr: 1 }}
                />
                <Typography variant="caption" fontWeight={500}>
                  {appSettings.companyName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CurrencyExchange
                  fontSize="small"
                  sx={{ color: 'info.main', mr: 1 }}
                />
                <Typography variant="caption">
                  {appSettings.currency === 'VND' ? 'Việt Nam Đồng' : 'US Dollar'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Language
                  fontSize="small"
                  sx={{ color: 'info.main', mr: 1 }}
                />
                <Typography variant="caption">
                  {appSettings.language === 'vi' ? 'Tiếng Việt' : 'English'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Security
                  fontSize="small"
                  sx={{ color: 'info.main', mr: 1 }}
                />
                <Typography variant="caption">
                  {appSettings.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      )}

      <Divider sx={{ mx: 2, mb: 1 }} />

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List sx={{ px: 2, py: 1 }}>
            {menuItems.map((item) => renderMenuItem(item))}
          </List>
        )}
      </Box>

      {/* Footer Section */}
      {open && (
        <>
          <Divider sx={{ mx: 2, mt: 1 }} />
          <Box sx={{ p: 2 }}>
            <ListItemButton
              sx={{
                borderRadius: 1.5,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  '& .MuiListItemIcon-root, & .MuiTypography-root': {
                    color: 'error.main',
                  },
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText
                primary="Đăng xuất"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                }}
              />
            </ListItemButton>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 2,
                color: 'text.secondary',
              }}
            >
              Version {appSettings?.version || '1.0.0'} • © {new Date().getFullYear()} {appSettings?.companyName || 'Wedding Management'}
            </Typography>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default AdminDrawer; 
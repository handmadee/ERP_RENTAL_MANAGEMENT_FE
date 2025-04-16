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
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

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
              borderRadius: 1,
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
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                      },
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                    },
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
          boxShadow: open ? '4px 0 8px rgba(0, 0, 0, 0.1)' : 'none',
        },
      }}
    >
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
            Wedding Management
          </Typography>
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
              }}
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
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                Admin User
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                admin@example.com
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
              <Tooltip title="Tài khoản">
                <IconButton size="small">
                  <AccountCircle fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      </Box>

      <Divider sx={{ mx: 2, mb: 1 }} />

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ px: 2, py: 1 }}>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {open && (
        <>
          <Divider sx={{ mx: 2, mt: 1 }} />
          <Box sx={{ p: 2 }}>
            <ListItemButton
              sx={{
                borderRadius: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  '& .MuiListItemIcon-root, & .MuiTypography-root': {
                    color: 'error.main',
                  },
                },
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
              Version 1.0.0 • © 2024 Wedding Management
            </Typography>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default AdminDrawer; 
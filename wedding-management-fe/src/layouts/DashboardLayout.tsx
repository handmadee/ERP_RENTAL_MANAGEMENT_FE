import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "@/routes/config";
import { authService } from "@/services/authService";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  Divider,
  Badge,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard,
  Checkroom,
  Receipt,
  Settings,
  Notifications,
  AccountCircle,
  ExitToApp,
  Search,
  People,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactElement;
  badge?: number;
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    path: ROUTE_PATHS.DASHBOARD.ROOT,
    icon: <Dashboard />,
  },
  {
    name: "Trang phục",
    path: ROUTE_PATHS.DASHBOARD.COSTUMES,
    icon: <Checkroom />,
    badge: 3, // Số lượng trang phục mới
  },
  {
    name: "Đơn hàng",
    path: ROUTE_PATHS.DASHBOARD.ORDERS,
    icon: <Receipt />,
    badge: 5, // Số đơn hàng chờ xử lý
  },
  {
    name: "Khách hàng",
    path: ROUTE_PATHS.DASHBOARD.CUSTOMERS,
    icon: <People />,
  },
  {
    name: "Cài đặt",
    path: ROUTE_PATHS.DASHBOARD.SETTINGS,
    icon: <Settings />,
  },
];

const DRAWER_WIDTH = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Add this type definition
const MotionDrawer = motion(Drawer);

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [userProfile, setUserProfile] = useState(authService.getCurrentUser());

  // Hiệu ứng hover cho các menu items
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await authService.getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Không thể lấy thông tin người dùng:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate(ROUTE_PATHS.AUTH.LOGIN);
  };

  // Animation variants
  const sidebarVariants = {
    open: { width: DRAWER_WIDTH },
    closed: { width: theme.spacing(9) },
  };

  const contentVariants = {
    open: { marginLeft: DRAWER_WIDTH },
    closed: { marginLeft: theme.spacing(9) },
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: open
            ? `calc(100% - ${DRAWER_WIDTH}px)`
            : `calc(100% - ${theme.spacing(9)})`,
          ml: open ? `${DRAWER_WIDTH}px` : theme.spacing(9),
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          background: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Toolbar>
          <IconButton
            color="primary"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>

          {/* Search Bar */}
          <Box
            sx={{
              position: "relative",
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.common.black, 0.04),
              "&:hover": {
                backgroundColor: alpha(theme.palette.common.black, 0.06),
              },
              mr: 2,
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <Box sx={{ position: "absolute", p: 2 }}>
              <Search sx={{ color: "text.secondary" }} />
            </Box>
            <Box
              component="input"
              sx={{
                border: "none",
                width: "100%",
                p: 2,
                pl: 6,
                backgroundColor: "transparent",
                outline: "none",
                color: "text.primary",
                fontSize: "0.875rem",
              }}
              placeholder="Tìm kiếm..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Notifications */}
          <Tooltip title="Thông báo">
            <IconButton
              color="primary"
              onClick={handleNotificationOpen}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Tooltip title="Tài khoản">
            <IconButton
              edge="end"
              color="primary"
              onClick={handleProfileMenuOpen}
            >
              <Avatar
                sx={{
                  width: 35,
                  height: 35,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                AD
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <MotionDrawer
        variant="permanent"
        open={open}
        sx={{
          "& .MuiDrawer-paper": {
            position: "relative",
            whiteSpace: "nowrap",
            width: DRAWER_WIDTH,
            backgroundColor: theme.palette.primary.main,
            color: "white",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: "border-box",
            ...(!open && {
              overflowX: "hidden",
              width: theme.spacing(9),
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }),
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: [1],
            background: alpha(theme.palette.primary.dark, 0.4),
          }}
        >
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.common.white
                }, ${alpha(theme.palette.primary.light, 0.9)})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
            }}
          >
            {open ? "Hệ thống quản lý trang phục" : "WM"}
          </Typography>
        </Toolbar>
        <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }} />
        <List component="nav" sx={{ px: 2, py: 1 }}>
          {navigation.map((item) => (
            <ListItem
              key={item.name}
              component={Link}
              to={item.path}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              sx={{
                borderRadius: 2,
                mb: 1,
                position: "relative",
                overflow: "hidden",
                color: "white",
                backgroundColor:
                  location.pathname === item.path
                    ? alpha(theme.palette.common.white, 0.1)
                    : "transparent",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: "inherit",
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ListItemText primary={item.name} />
                  </motion.div>
                )}
              </AnimatePresence>
              {hoveredItem === item.name && (
                <motion.div
                  layoutId="highlight"
                  initial={false}
                  animate={{
                    opacity: 1,
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(90deg, ${alpha(
                      theme.palette.common.white,
                      0.1
                    )} 0%, transparent 100%)`,
                    pointerEvents: "none",
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </MotionDrawer>
      <motion.div
        // animate={open ? "open" : "closed"}
        variants={contentVariants}
        style={{
          flexGrow: 1,
          padding: theme.spacing(3),
          marginTop: theme.spacing(8),
          backgroundColor: alpha(theme.palette.primary.light, 0.02),
          // transition: theme.transitions.create(["width", "margin"], {
          //   easing: theme.transitions.easing.sharp,
          //   duration: theme.transitions.duration.enteringScreen,
          // }),
        }}
      >
        {children}
      </motion.div>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 250,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={userProfile?.avatar}
            sx={{
              width: 50,
              height: 50,
              bgcolor: theme.palette.primary.main,
            }}
          >
            {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'A'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {userProfile?.fullName || "Đang tải..."}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userProfile?.email || ""}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
              {userProfile?.role === "admin" ? "Quản trị viên" : "Người dùng"}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Hồ sơ
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 320,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Thông báo
          </Typography>
          {[
            {
              title: "Đơn hàng mới #1234",
              desc: "Khách hàng vừa đặt trang phục mới",
              time: "5 phút trước",
            },
            {
              title: "Cập nhật hệ thống",
              desc: "Hệ thống sẽ bảo trì lúc 23:00",
              time: "1 giờ trước",
            },
            {
              title: "Nhắc nhở",
              desc: "Có 3 đơn hàng cần xử lý",
              time: "2 giờ trước",
            },
          ].map((notification, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                mb: 1,
                borderRadius: 1,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <Typography variant="subtitle2">{notification.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {notification.desc}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.primary.main }}
              >
                {notification.time}
              </Typography>
            </Box>
          ))}
        </Box>
      </Menu>
    </Box>
  );
};

export default DashboardLayout;

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  Divider,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const Layout: React.FC = () => {
  const { user, role, hasPermission } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop menu anchor states
  const [anchorInventory, setAnchorInventory] = useState<null | HTMLElement>(null);
  const [anchorCustomers, setAnchorCustomers] = useState<null | HTMLElement>(null);
  const [anchorReports, setAnchorReports] = useState<null | HTMLElement>(null);
  const [anchorVendors, setAnchorVendors] = useState<null | HTMLElement>(null);
  const [anchorUserMenu, setAnchorUserMenu] = useState<null | HTMLElement>(null);

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mobile collapse states for categories in drawer
  const [openInventory, setOpenInventory] = useState(false);
  const [openCustomers, setOpenCustomers] = useState(false);
  const [openVendors, setOpenVendors] = useState(false);
  const [openReports, setOpenReports] = useState(false);
  const [openUserSection, setOpenUserSection] = useState(false);

  // Menu items
  const inventoryMenuItems = [
    { name: "Parts", path: "/parts" },
  ];

  const customersMenuItems = [
    { name: "Customers", path: "/customers" },
    { name: "Invoices", path: "/invoices" }
  ];
  const vendorMenuItems = [
    { name: "Vendors", path: "/vendors" },
    { name: "Purchase Orders", path: "/invoices" }
  ];

  const reportsMenuItems = [
    { name: "Invoices", path: "/invoices" },
    { name: "Reports", path: "/dashboard" },
    ...(hasPermission(["manageUsers"]) ? [{ name: "Admin", path: "/admin" }] : []),
  ];

  // Navigation helpers
  const handleNavigate = (path: string) => {
    navigate(path);
    closeAllMenus();
    setMobileOpen(false);
  };

  const closeAllMenus = () => {
    setAnchorInventory(null);
    setAnchorCustomers(null);
    setAnchorVendors(null);
    setAnchorReports(null);
    setAnchorUserMenu(null);
  };

  // Desktop handlers with timers for hover menus
  // Open one menu and close the others
const handleMenuOpen = (
  menuName: "inventory" | "customers" | "reports" | "vendors",
  event: React.MouseEvent<HTMLElement>
) => {
  const currentTarget = event.currentTarget;

  // Determine which menu to open, and close others
  if (menuName === "inventory") {
    setAnchorInventory(currentTarget);
    setAnchorCustomers(null);
    setAnchorVendors(null);
    setAnchorReports(null);
  } else if (menuName === "customers") {
    setAnchorCustomers(currentTarget);
    setAnchorVendors(null);
    setAnchorInventory(null);
    setAnchorReports(null);
  } else if (menuName === "reports") {
    setAnchorReports(currentTarget);
    setAnchorVendors(null);
    setAnchorInventory(null);
    setAnchorCustomers(null);
  } else if (menuName === "vendors") {
    setAnchorReports(null);
    setAnchorVendors(currentTarget);
    setAnchorInventory(null);
    setAnchorCustomers(null);
  }
};
  const inventoryMenuClose = () => setAnchorInventory(null);
  const customersMenuClose = () => setAnchorCustomers(null);
  const reportsMenuClose = () => setAnchorReports(null);
  const vendorsMenuClose = () => setAnchorVendors(null);

  // Mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mobile collapses toggle
  const toggleInventory = () => setOpenInventory(!openInventory);
  const toggleCustomers = () => setOpenCustomers(!openCustomers);
  const toggleVendors = () => setOpenVendors(!openVendors);
  const toggleReports = () => setOpenReports(!openReports);
  const toggleUserSection = () => setOpenUserSection(!openUserSection);

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Active route helper
  const isActive = (path: string) => location.pathname === path;

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List onClick={toggleInventory} sx={{ cursor: "pointer" }}>
        <ListItem
          button
          component={"button"}>
          <ListItemText primary="Inventory" />
          {openInventory ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
      </List>
      <Collapse in={openInventory} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {inventoryMenuItems.map((item) => (
            <ListItem
              button
              component={"button"}
              key={item.name}
              sx={{ pl: 4 }}
              selected={isActive(item.path)}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
        </List>
      </Collapse>

      <List onClick={toggleCustomers} sx={{ cursor: "pointer" }}>
        <ListItem
          button
          component={"button"}>
          <ListItemText primary="Customers" />
          {openCustomers ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
      </List>
      <Collapse in={openCustomers} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {customersMenuItems.map((item) => (
            <ListItem
              button
              component={"button"}
              key={item.name}
              sx={{ pl: 4 }}
              selected={isActive(item.path)}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
        </List>
      </Collapse>
      <List onClick={toggleVendors} sx={{ cursor: "pointer" }}>
        <ListItem
          button
          component={"button"}>
          <ListItemText primary="Vendors" />
          {openCustomers ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
      </List>
      <Collapse in={openVendors} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {vendorMenuItems.map((item) => (
            <ListItem
              button
              component={"button"}
              key={item.name}
              sx={{ pl: 4 }}
              selected={isActive(item.path)}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
        </List>
      </Collapse>

      <List onClick={toggleReports} sx={{ cursor: "pointer" }}>
        <ListItem
          button
          component={"button"}>
          <ListItemText primary="Reports" />
          {openReports ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
      </List>
      <Collapse in={openReports} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {reportsMenuItems.map((item) => (
            <ListItem
              button
              component={"button"}
              key={item.name}
              sx={{ pl: 4 }}
              selected={isActive(item.path)}
              onClick={() => handleNavigate(item.path)}
            >
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
        </List>
      </Collapse>

      <Divider sx={{ my: 2 }} />

      {/* User Section */}
      <List onClick={toggleUserSection} sx={{ cursor: "pointer" }}>
        <ListItem
          button
          component={"button"}>
          <ListItemText primary={"User"} />
          {openUserSection ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
      </List>
      <Collapse in={openUserSection} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem>
            <ListItemText primary={user?.email || "No email found"} />
          </ListItem>
          <ListItem
            button
            component={"button"}
            onClick={() => handleNavigate("/myaccount")}>
            <ListItemText primary="My Account" />
          </ListItem>
          <ListItem
            button
            component={"button"}
            onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Collapse>
    </Box>
  );

  // Desktop UI with hover dropdown menus
  if (!isMobile) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/dashboard")}
            >
              My Company
            </Typography>

            <Box sx={{ display: "flex", gap: 3 }}>
              {/* Inventory */}
              <Box
                onMouseOver={(e) => handleMenuOpen("inventory", e)}
                onMouseLeave={inventoryMenuClose}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorInventory) ? "true" : undefined}
                sx={{ cursor: "pointer" }}
              >
                <Button
                  color="inherit"
                  aria-controls={anchorInventory ? "inventory-menu" : undefined}
                  aria-haspopup="true"
                  onClick={(e) => handleMenuOpen("inventory", e)}
                >
                  Inventory
                </Button>
                <Menu
                  id="inventory-menu"
                  anchorEl={anchorInventory}
                  open={Boolean(anchorInventory)}
                  onClose={inventoryMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                  MenuListProps={{
                    // onMouseLeave: handleMenuClose,
                    disablePadding: true,
                  }}
                  PaperProps={{
                      elevation: 3,
                  }}

                  PopoverClasses={{
                    root: 'no-overlay-popover',
                  }}
                  // disablePortal
                  // disableEnforceFocus
                  // disableAutoFocus
                  hideBackdrop
                >
                  {inventoryMenuItems.map((item) => (
                    <MenuItem
                      key={item.name}
                      selected={isActive(item.path)}
                      onClick={() => handleNavigate(item.path)}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              {/* Customers */}
              <Box
                onMouseOver={(e) => handleMenuOpen("customers", e)}
                onMouseLeave={customersMenuClose}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorCustomers) ? "true" : undefined}
                sx={{ cursor: "pointer" }}
              >
                <Button
                  color="inherit"
                  aria-controls={anchorCustomers ? "customers-menu" : undefined}
                  aria-haspopup="true"
                  onClick={(e) => handleMenuOpen("customers", e)}
                >
                  Customers
                </Button>
                <Menu
                  id="customers-menu"
                  anchorEl={anchorCustomers}
                  open={Boolean(anchorCustomers)}
                  onClose={customersMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                  MenuListProps={{
                    // onMouseLeave: handleMenuClose,
                    disablePadding: true,
                  }}
                  PaperProps={{
                      elevation: 3,
                  }}
                  PopoverClasses={{
                    root: 'no-overlay-popover',
                  }}
                  disablePortal
                  disableEnforceFocus
                  disableAutoFocus
                  hideBackdrop
                >
                  {customersMenuItems.map((item) => (
                    <MenuItem
                      key={item.name}
                      selected={isActive(item.path)}
                      onClick={() => handleNavigate(item.path)}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              {/* Vendors */}
              <Box
                onMouseOver={(e) => handleMenuOpen("vendors", e)}
                onMouseLeave={vendorsMenuClose}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorVendors) ? "true" : undefined}
                sx={{ cursor: "pointer" }}
              >
                <Button
                  color="inherit"
                  aria-controls={anchorVendors ? "vendors-menu" : undefined}
                  aria-haspopup="true"
                  onClick={(e) => handleMenuOpen("vendors", e)}
                >
                  Vendors
                </Button>
                <Menu
                  id="vendors-menu"
                  anchorEl={anchorVendors}
                  open={Boolean(anchorVendors)}
                  onClose={vendorsMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                  MenuListProps={{
                    // onMouseLeave: handleMenuClose,
                    disablePadding: true,
                  }}
                  PaperProps={{
                      elevation: 3,
                  }}
                  PopoverClasses={{
                    root: 'no-overlay-popover',
                  }}
                  disablePortal
                  disableEnforceFocus
                  disableAutoFocus
                  hideBackdrop
                >
                  {vendorMenuItems.map((item) => (
                    <MenuItem
                      key={item.name}
                      selected={isActive(item.path)}
                      onClick={() => handleNavigate(item.path)}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              {/* Reports */}
              <Box
                onMouseOver={(e) => handleMenuOpen("reports", e)}
                onMouseLeave={reportsMenuClose}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorReports) ? "true" : undefined}
                sx={{ cursor: "pointer" }}
              >
                <Button
                  color="inherit"
                  aria-controls={anchorReports ? "reports-menu" : undefined}
                  aria-haspopup="true"
                  onClick={(e) => handleMenuOpen("reports", e)}
                >
                  Reports
                </Button>
                <Menu
                  id="reports-menu"
                  anchorEl={anchorReports}
                  open={Boolean(anchorReports)}
                  onClose={reportsMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                  MenuListProps={{
                    // onMouseLeave: handleMenuClose,
                    disablePadding: true,
                  }}
                  PaperProps={{
                      elevation: 3,
                  }}
                  PopoverClasses={{
                    root: 'no-overlay-popover',
                  }}
                  disablePortal
                  disableEnforceFocus
                  disableAutoFocus
                  hideBackdrop
                >
                  {reportsMenuItems.map((item) => (
                    <MenuItem
                      key={item.name}
                      selected={isActive(item.path)}
                      onClick={() => handleNavigate(item.path)}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Box>

            {/* User Avatar menu */}
            <Box>
              <Tooltip title="User menu">
                <IconButton
                  onClick={(e) => setAnchorUserMenu(e.currentTarget)}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={anchorUserMenu ? "user-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorUserMenu) ? "true" : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user?.email?.[0].toUpperCase() ?? "U"}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="user-menu"
                anchorEl={anchorUserMenu}
                open={Boolean(anchorUserMenu)}
                onClose={() => setAnchorUserMenu(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
              >
                <MenuItem onClick={() => { setAnchorUserMenu(null); navigate("/myaccount"); }}>
                  My Account
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    );
  }

  // Mobile UI with drawer
  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            aria-label="open drawer"
            size="large"
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            My Company
          </Typography>

          {/* Avatar */}
          <IconButton
            size="small"
            onClick={() => setAnchorUserMenu(null)}
            sx={{ visibility: "hidden" }} // Hidden to keep spacing consistent
          >
            <Avatar>{user?.email?.[0].toUpperCase() ?? "U"}</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;

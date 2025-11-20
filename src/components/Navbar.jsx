import React, { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Box,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import CustomAlert from "../components/CustomAlert";

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [statusCode, setStatusCode] = useState();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const menuItems = [
    { label: "Ingestion", path: "/ingestion" },
    { label: "Cleaning", path: "/cleaning" },
    { label: "Transformation", path: "/transformation" },
    { label: "Visualization", path: "/visualization" },
  ];

const handleLogout = async () => {
  try {
    const res = await logout(); // backend call

    // Show alert with backend message
    setAlertMessage(res.data.message || "Logged out successfully");
    setStatusCode(res.data.status || 200);
    setAlert(true);

    // Delay to show alert
    setTimeout(() => {
      // Remove token & clear user AFTER alert
    window.accessToken = null; // clear token from memory
      setAlert(false); // hide alert
      navigate("/login", { replace: true });
    }, 2000);
     setTimeout(() => {
      // Remove token & clear user AFTER alert
      setUser(null);
    }, 2500);
  } catch (err) {
    console.error(err);
    setAlertMessage(err.response?.data?.message || "Logout failed");
    setStatusCode(err.response?.status || 500);
    setAlert(true);
  }
};

  const drawerContent = (
    <Box sx={{ width: 250, p: 2 }} role="presentation">
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Avatar sx={{ bgcolor: "secondary.main" }}>
          {user?.username?.[0]?.toUpperCase() || "U"}
        </Avatar>
        <Typography>{user?.username}</Typography>
      </Stack>
      <Button color="error" variant="contained" fullWidth onClick={handleLogout}>
        Logout  ss
      </Button>
    </Box>
  );

  return (
    <>
      {alert && (
        <CustomAlert
          setAlert={setAlert}
          message={alertMessage}
          statusCode={statusCode}
        />
      )}

      <AppBar position="static" color="primary">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/ingestion")}
          >
            Project Y
          </Typography>

          {isMobile ? (
            <>
              <IconButton color="inherit" edge="end" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
                {drawerContent}
              </Drawer>
            </>
          ) : (
            <Stack direction="row" spacing={2} alignItems="center">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              ))}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </Avatar>
                <Typography>{user?.username}</Typography>
              </Stack>
              <Button color="error" variant="contained" onClick={handleLogout}>
                Logout
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;

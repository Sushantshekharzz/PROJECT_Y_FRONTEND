import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { login } from "../api/auth";
import CustomAlert from "../components/CustomAlert";

import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [statusCode, setStatusCode] = useState();

  const navigate = useNavigate();
  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate fields
    const newErrors = {};
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!username.trim()) newErrors.username = "Email is required";
    else if (!gmailRegex.test(username))
      newErrors.username = "Email must be a valid @gmail.com";

    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await login({ username, password });
      setAlertMessage(res.data.message);
      setStatusCode(res.data.status);
      setAlert(true);

      if (res.status === 200) {
        localStorage.setItem("accessToken", res.data.accessToken);
        setUser(res.data.user);
        setTimeout(() => {
          navigate("/ingestion");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setAlertMessage(err.response?.data?.message || "Internal Server Error");
      setStatusCode(err.response?.status || 500);
      setAlert(true);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        boxSizing: "border-box",
        p: { xs: 2, sm: 0 },
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      }}
    >
      {alert && (
        <CustomAlert
          setAlert={setAlert}
          message={alertMessage}
          statusCode={statusCode}
        />
      )}

      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 3 },
          width: { xs: "90%", sm: 500, md: 600 },
          minHeight: { xs: 350, sm: 400 },
          p: { xs: 3, sm: 4 },
          boxSizing: "border-box",
        }}
      >
        {/* Heading */}
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 3, fontWeight: "bold", color: "primary.main" }}
        >
          Login
        </Typography>

        {/* Email */}
        <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
          Email
        </Typography>
        <TextField
          placeholder="yourname@gmail.com"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={!!errors.username}
          helperText={errors.username}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
        />

        {/* Password */}
        <Typography variant="body1" sx={{ fontSize: "1.1rem", mt: 2 }}>
          Password
        </Typography>
        <TextField
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePassword}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Submit Button */}
        <Button
          sx={{ mt: 5, height: 60 }}
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          Log In
        </Button>

        {/* Helper Links */}
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          sx={{ mt: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            Don’t have an account?
          </Typography>
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <Typography variant="body2" color="primary" fontWeight="bold">
              Sign up
            </Typography>
          </Link>
        </Stack>
      </Box>
    </Box>
  );
};

export default Login;

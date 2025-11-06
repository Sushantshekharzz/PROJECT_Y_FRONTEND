import { useState } from "react";
import { signup } from "../api/auth";
import CustomAlert from "../components/CustomAlert";
import { useNavigate, Link } from "react-router-dom";

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

const Signup = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [statusCode, setStatusCode] = useState();

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const validate = () => {
    const newErrors = {};
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    if (!gmailRegex.test(username))
      newErrors.username = "Email must be a valid @gmail.com";

    if (!passwordRegex.test(password))
      newErrors.password =
        "Password must be minimum 8 characters, include at least 1 letter and 1 number";

    return newErrors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const res = await signup({ username, password });
      setAlertMessage(res.data.message);
      setStatusCode(res.data.status );
      setAlert(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
        p: { xs: 2, sm: 0 },
        boxSizing: "border-box",
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
        onSubmit={handleSignup}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 3 },
          width: { xs: "90%", sm: 500, md: 600 },
          minHeight: { xs: 400, sm: 450 },
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
          Signup
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

        {/* Signup Button */}
        <Button
          sx={{ mt: 5, height: 60 }}
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          Signup
        </Button>

        {/* Already have an account */}
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          sx={{ mt: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            Already have an account?
          </Typography>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <Typography variant="body2" color="primary" fontWeight="bold">
              Log in
            </Typography>
          </Link>
        </Stack>
      </Box>
    </Box>
  );
};

export default Signup;

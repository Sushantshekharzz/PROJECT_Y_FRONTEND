import React from "react";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const Unauthorized = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.100",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 480,
          p: 4,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            mx: "auto",
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "error.light",
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 40, color: "error.main" }} />
        </Box>

        {/* Status Code */}
        <Typography variant="h6" color="error" gutterBottom>
          401
        </Typography>

        {/* Heading */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Unauthorized Access
        </Typography>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sorry, you do not have permission to view this page. <br />
          Please login with the correct credentials.
        </Typography>

        {/* Actions */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            href="/login"
          >
            Go to Login
          </Button>

        </Stack>
      </Paper>
    </Box>
  );
};

export default Unauthorized;

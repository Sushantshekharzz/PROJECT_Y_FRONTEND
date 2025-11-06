import React from "react";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const NotFound = () => {
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
            bgcolor: "warning.light",
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 40, color: "warning.main" }} />
        </Box>

        {/* Status Code */}
        <Typography variant="h6" color="warning.main" gutterBottom>
          404
        </Typography>

        {/* Heading */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Page Not Found
        </Typography>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sorry, we couldn’t find the page you’re looking for.
        </Typography>

        {/* Actions */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            href="/login"
          >
            Login
          </Button>

        </Stack>
      </Paper>
    </Box>
  );
};

export default NotFound;

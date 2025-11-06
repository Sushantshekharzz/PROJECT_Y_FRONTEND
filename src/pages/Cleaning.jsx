import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

export default function Cleaning() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: '#f0f2f5',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', p: 3, boxShadow: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CleaningServicesIcon sx={{ fontSize: 40, mr: 1, color: '#1976d2' }} />
            <Typography variant="h5" component="div">
              Data Cleaning
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This page allows you to clean and preprocess your data. Remove duplicates, fix errors, and prepare data for analysis.
          </Typography>
          <Button variant="contained" color="primary">
            Start Cleaning
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

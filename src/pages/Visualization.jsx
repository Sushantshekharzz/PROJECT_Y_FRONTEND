import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

export default function Visualization() {
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
            <BarChartIcon sx={{ fontSize: 40, mr: 1, color: '#1976d2' }} />
            <Typography variant="h5" component="div">
              Data Visualization
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This is the Visualization page. Here you can display charts, graphs, or other visual representations of your data.
          </Typography>
          <Button variant="contained" color="primary">
            View Charts
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

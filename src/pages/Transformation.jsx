import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';

export default function Transformation() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: '#f5f5f5',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', p: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Transformation Module
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This is a simple UI for the Transformation page. You can add more features or actions here.
          </Typography>
          <Button variant="contained" color="primary">
            Start Transformation
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

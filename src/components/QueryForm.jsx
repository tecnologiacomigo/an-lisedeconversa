import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Paper,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';

export default function QueryForm({ onSubmit }) {
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ 
        phone,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      setPhone(value);
    }
  };

  const formatPhoneDisplay = (value) => {
    if (!value) return '';
    if (value.length <= 2) return value;
    if (value.length <= 7) return `(${value.slice(0,2)}) ${value.slice(2)}`;
    return `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7)}`;
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Análise de Conversas WhatsApp
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Número do WhatsApp"
              value={formatPhoneDisplay(phone)}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999"
              disabled={loading}
              required
              helperText="Digite DDD + número (Ex: 11999999999)"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Data Inicial"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Data Final"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || !phone}
              sx={{ 
                height: 48,
                backgroundColor: loading ? 'grey.400' : 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Analisar Conversas'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

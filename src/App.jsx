import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import QueryForm from './components/QueryForm';
import ResultsDisplay from './components/ResultsDisplay';
import { fetchAndProcessMessages } from './services/api';

export default function App() {
  const [queryState, setQueryState] = useState({
    loading: false,
    error: null,
    data: null
  });

  const handleSubmit = async (formData) => {
    setQueryState({ loading: true, error: null, data: null });
    
    try {
      const data = await fetchAndProcessMessages(formData);
      setQueryState({ loading: false, error: null, data });
    } catch (error) {
      console.error('Error:', error);
      setQueryState({ 
        loading: false, 
        error: error.message || 'Erro ao processar mensagens', 
        data: null 
      });
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Análise de Conversas WhatsApp
        </Typography>
        
        <QueryForm onSubmit={handleSubmit} />
        <ResultsDisplay {...queryState} />
      </Box>
    </Container>
  );
}

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  LinearProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function ResultsDisplay({ loading, error, data }) {
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '' });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  const handleExportCSV = () => {
    const headers = ['Data', 'Usuário', 'Mensagem'];
    const csvContent = [
      headers.join(','),
      ...data.rawConversations.map(msg => [
        new Date(msg.timestamp * 1000).toLocaleString('pt-BR'),
        msg.name_user,
        `"${msg.text.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `conversas_whatsapp_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setSnackbar({ open: true, message: 'Arquivo CSV exportado com sucesso!' });
  };

  const handleCopyToClipboard = async () => {
    const txtContent = data.rawConversations.map(msg => 
      `[${new Date(msg.timestamp * 1000).toLocaleString('pt-BR')}] ${msg.name_user}: ${msg.text}`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(txtContent);
      setSnackbar({ open: true, message: 'Conteúdo copiado para a área de transferência!' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao copiar conteúdo!', severity: 'error' });
    }
  };

  // Criar visualização de atividade por dia
  const getDailyActivity = () => {
    const dailyCount = {};
    data.rawConversations.forEach(msg => {
      const date = new Date(msg.timestamp * 1000).toLocaleDateString('pt-BR');
      dailyCount[date] = (dailyCount[date] || 0) + 1;
    });
    return Object.entries(dailyCount)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .slice(-7); // Últimos 7 dias
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* Resumo Geral */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WhatsAppIcon color="success" />
                Resumo da Análise
              </Typography>
              <Box>
                <Tooltip title="Exportar CSV">
                  <IconButton onClick={handleExportCSV}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copiar">
                  <IconButton onClick={handleCopyToClipboard}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Chip
                  icon={<MessageIcon />}
                  label={`${data.messageCount} mensagens`}
                  color="primary"
                  sx={{ width: '100%', height: 40 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Chip
                  icon={<PersonIcon />}
                  label={`${Object.keys(data.userStats).length} participantes`}
                  color="secondary"
                  sx={{ width: '100%', height: 40 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Chip
                  icon={<CalendarTodayIcon />}
                  label={data.dateRange}
                  variant="outlined"
                  sx={{ width: '100%', height: 40 }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Atividade Diária */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Atividade dos Últimos 7 Dias
            </Typography>
            <Box sx={{ mt: 2 }}>
              {getDailyActivity().map(([date, count]) => (
                <Box key={date} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{date}</Typography>
                    <Typography variant="body2">{count} mensagens</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(count / data.messageCount) * 100}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Estatísticas por Usuário */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Participação por Usuário
            </Typography>
            <List>
              {Object.entries(data.userStats || {}).map(([name, stats], index) => (
                <React.Fragment key={name}>
                  <ListItem>
                    <ListItemText
                      primary={name}
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {stats.messageCount} mensagens • Média de {Math.round(stats.wordCount / stats.messageCount)} palavras
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < Object.entries(data.userStats || {}).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Últimas Mensagens */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MessageIcon />
              Últimas Mensagens
            </Typography>
            <List>
              {(data.rawConversations || []).slice(-5).map((msg, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={msg.text}
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {msg.name_user} • {new Date(msg.timestamp * 1000).toLocaleString('pt-BR')}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}

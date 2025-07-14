import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  Timeline, 
  Link as LinkIcon, 
  Schedule,
  TrendingUp 
} from '@mui/icons-material';
import { UrlService } from '../utils/urlService';
import { UrlData } from '../types';
import { logger } from '../utils/logger';

const Statistics: React.FC = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    activeUrls: 0,
    expiredUrls: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const urlData = UrlService.getAllUrls();
      const statistics = UrlService.getStatistics();
      
      setUrls(urlData);
      setStats(statistics);
      
      logger.info('Loaded statistics data', { 
        urlCount: urlData.length, 
        statistics 
      });
    } catch (error) {
      logger.error('Error loading statistics data', error);
    }
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
    logger.debug('Toggled row expansion', { id, expanded: !expandedRows.has(id) });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const getStatusColor = (url: UrlData) => {
    if (url.isExpired) return 'error';
    const now = new Date();
    const timeLeft = url.expiresAt.getTime() - now.getTime();
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    
    if (hoursLeft < 1) return 'warning';
    return 'success';
  };

  const getStatusText = (url: UrlData) => {
    if (url.isExpired) return 'Expired';
    const now = new Date();
    const timeLeft = url.expiresAt.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));
    
    if (minutesLeft < 60) return `${minutesLeft}m left`;
    const hoursLeft = Math.floor(minutesLeft / 60);
    return `${hoursLeft}h left`;
  };

  if (urls.length === 0) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Statistics Dashboard
        </Typography>
        <Alert severity="info">
          No URLs have been shortened yet. Create some URLs to see statistics here.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Statistics Dashboard
      </Typography>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <LinkIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.totalUrls}</Typography>
              <Typography variant="body2">Total URLs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.totalClicks}</Typography>
              <Typography variant="body2">Total Clicks</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Schedule sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.activeUrls}</Typography>
              <Typography variant="body2">Active URLs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Timeline sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{stats.expiredUrls}</Typography>
              <Typography variant="body2">Expired URLs</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* URL Details Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            URL Details
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Short URL</TableCell>
                  <TableCell>Original URL</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Clicks</TableCell>
                  <TableCell align="center">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {urls.map((url) => (
                  <React.Fragment key={url.id}>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                          /{url.shortCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 300, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.originalUrl}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(url.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(url)} 
                          color={getStatusColor(url)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" color="primary">
                          {url.clicks.length}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => toggleRowExpansion(url.id)}
                          disabled={url.clicks.length === 0}
                        >
                          {expandedRows.has(url.id) ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={expandedRows.has(url.id)} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              Click History
                            </Typography>
                            {url.clicks.length > 0 ? (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>Source</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>User Agent</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {url.clicks.map((click, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{formatDate(click.timestamp)}</TableCell>
                                      <TableCell>{click.source}</TableCell>
                                      <TableCell>{click.location}</TableCell>
                                      <TableCell>
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            maxWidth: 200,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          {click.userAgent}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <Typography color="text.secondary">No clicks recorded yet</Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Statistics;
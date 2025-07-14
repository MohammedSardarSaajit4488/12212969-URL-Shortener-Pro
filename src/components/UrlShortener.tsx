import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Grid,
  IconButton,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import { Add, Delete, ContentCopy, Link } from '@mui/icons-material';
import { UrlService } from '../utils/urlService';
import { UrlData, CreateUrlRequest } from '../types';
import { logger } from '../utils/logger';

interface UrlForm {
  originalUrl: string;
  customShortcode: string;
  validityMinutes: string;
}

const UrlShortener: React.FC = () => {
  const [forms, setForms] = useState<UrlForm[]>([
    { originalUrl: '', customShortcode: '', validityMinutes: '' }
  ]);
  const [results, setResults] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const addForm = () => {
    if (forms.length < 5) {
      setForms([...forms, { originalUrl: '', customShortcode: '', validityMinutes: '' }]);
      logger.info('Added new URL form', { totalForms: forms.length + 1 });
    }
  };

  const removeForm = (index: number) => {
    setForms(forms.filter((_, i) => i !== index));
    logger.info('Removed URL form', { index, remainingForms: forms.length - 1 });
  };

  const updateForm = (index: number, field: keyof UrlForm, value: string) => {
    const newForms = [...forms];
    newForms[index] = { ...newForms[index], [field]: value };
    setForms(newForms);
  };

  const validateForm = (form: UrlForm): string | null => {
    if (!form.originalUrl.trim()) {
      return 'URL is required';
    }
    
    if (!UrlService.isValidUrl(form.originalUrl)) {
      return 'Invalid URL format';
    }
    
    if (form.customShortcode && !UrlService.isValidShortcode(form.customShortcode)) {
      return 'Shortcode must be 3-10 alphanumeric characters';
    }
    
    if (form.validityMinutes && (!Number.isInteger(Number(form.validityMinutes)) || Number(form.validityMinutes) <= 0)) {
      return 'Validity must be a positive integer';
    }
    
    return null;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);
    setResults([]);
    
    logger.info('Starting URL shortening process', { formsCount: forms.length });

    const newErrors: string[] = [];
    const newResults: UrlData[] = [];

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      
      if (!form.originalUrl.trim()) continue;

      const validationError = validateForm(form);
      if (validationError) {
        newErrors.push(`Form ${i + 1}: ${validationError}`);
        continue;
      }

      try {
        const request: CreateUrlRequest = {
          originalUrl: form.originalUrl,
          customShortcode: form.customShortcode || undefined,
          validityMinutes: form.validityMinutes ? parseInt(form.validityMinutes) : undefined
        };

        const result = UrlService.createShortUrl(request);
        newResults.push(result);
        logger.info('Successfully created short URL', { index: i, shortCode: result.shortCode });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        newErrors.push(`Form ${i + 1}: ${errorMessage}`);
        logger.error('Failed to create short URL', { index: i, error: errorMessage });
      }
    }

    setErrors(newErrors);
    setResults(newResults);
    setLoading(false);
    
    logger.info('URL shortening process completed', { 
      successCount: newResults.length, 
      errorCount: newErrors.length 
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    logger.info('Copied to clipboard', { text });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        URL Shortener
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Shorten Your URLs
          </Typography>
          
          {forms.map((form, index) => (
            <Paper key={index} elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  URL {index + 1}
                </Typography>
                {forms.length > 1 && (
                  <IconButton onClick={() => removeForm(index)} color="error" size="small">
                    <Delete />
                  </IconButton>
                )}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Original URL"
                    placeholder="https://example.com"
                    value={form.originalUrl}
                    onChange={(e) => updateForm(index, 'originalUrl', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode (Optional)"
                    placeholder="mycode"
                    value={form.customShortcode}
                    onChange={(e) => updateForm(index, 'customShortcode', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Validity (Minutes)"
                    placeholder="30"
                    type="number"
                    value={form.validityMinutes}
                    onChange={(e) => updateForm(index, 'validityMinutes', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addForm}
              disabled={forms.length >= 5}
            >
              Add URL ({forms.length}/5)
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || forms.every(f => !f.originalUrl.trim())}
              startIcon={loading ? <CircularProgress size={20} /> : <Link />}
            >
              {loading ? 'Shortening...' : 'Shorten URLs'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Errors:</Typography>
          {errors.map((error, index) => (
            <Typography key={index} variant="body2">• {error}</Typography>
          ))}
        </Alert>
      )}

      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Shortened URLs
            </Typography>
            
            {results.map((result, index) => (
              <Paper key={index} elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Original URL:
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {result.originalUrl}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Short URL:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all', color: 'primary.main', fontWeight: 'bold' }}>
                        {result.shortUrl}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(result.shortUrl)}
                        color="primary"
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Expires:
                    </Typography>
                    <Chip 
                      label={result.expiresAt.toLocaleString()} 
                      size="small" 
                      color="warning"
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UrlShortener;
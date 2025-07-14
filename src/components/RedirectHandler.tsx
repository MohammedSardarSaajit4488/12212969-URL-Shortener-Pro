import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { UrlService } from '../utils/urlService';
import { logger } from '../utils/logger';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode) {
        setError('Invalid short URL');
        setLoading(false);
        return;
      }

      logger.info('Processing redirect request', { shortCode });

      const url = UrlService.getUrlByShortCode(shortCode);
      
      if (!url) {
        setError('Short URL not found');
        setLoading(false);
        logger.warn('Short URL not found', { shortCode });
        return;
      }

      if (url.isExpired || new Date() > url.expiresAt) {
        setError('This short URL has expired');
        setLoading(false);
        logger.warn('Attempted to access expired URL', { shortCode, expiresAt: url.expiresAt });
        return;
      }

      // Record the click
      const clickRecorded = UrlService.recordClick(shortCode);
      
      if (clickRecorded) {
        logger.info('Click recorded, redirecting', { shortCode, originalUrl: url.originalUrl });
        setRedirectUrl(url.originalUrl);
        
        // Redirect after a short delay to show loading state
        setTimeout(() => {
          window.location.href = url.originalUrl;
        }, 1000);
      } else {
        setError('Failed to process redirect');
        setLoading(false);
        logger.error('Failed to record click', { shortCode });
      }
    };

    handleRedirect();
  }, [shortCode]);

  if (loading && !redirectUrl) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="h6">Processing your request...</Typography>
        <Typography variant="body2" color="text.secondary">
          Validating short URL: /{shortCode}
        </Typography>
      </Box>
    );
  }

  if (redirectUrl) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="h6">Redirecting you now...</Typography>
        <Typography variant="body2" color="text.secondary">
          Taking you to: {redirectUrl}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          If you're not redirected automatically, 
          <Button 
            variant="text" 
            onClick={() => window.location.href = redirectUrl}
            sx={{ ml: 1 }}
          >
            click here
          </Button>
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          gap: 2,
          px: 3
        }}
      >
        <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.href = '/'}
        >
          Go Back to URL Shortener
        </Button>
      </Box>
    );
  }

  return <Navigate to="/" replace />;
};

export default RedirectHandler;
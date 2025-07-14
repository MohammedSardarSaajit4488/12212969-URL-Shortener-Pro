import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Tabs, 
  Tab, 
  Box,
  Container
} from '@mui/material';
import { Link, Timeline } from '@mui/icons-material';
import UrlShortener from './components/UrlShortener';
import Statistics from './components/Statistics';
import RedirectHandler from './components/RedirectHandler';
import { logger } from './utils/logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#00acc1',
      light: '#4dd0e1',
      dark: '#00838f',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const MainApp: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    logger.info('Tab changed', { tab: newValue });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Link sx={{ mr: 2, fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener Pro
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab 
              icon={<Link />} 
              label="Shorten URLs" 
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab 
              icon={<Timeline />} 
              label="Statistics" 
              id="tab-1"
              aria-controls="tabpanel-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <UrlShortener />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Statistics />
        </TabPanel>
      </Container>
    </Box>
  );
};

const RedirectRoute: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  
  // If the shortCode looks like a valid short code, handle redirect
  if (shortCode && /^[a-zA-Z0-9]+$/.test(shortCode)) {
    return <RedirectHandler />;
  }
  
  // Otherwise, show the main app
  return <MainApp />;
};

const App: React.FC = () => {
  React.useEffect(() => {
    logger.info('URL Shortener application started');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/:shortCode" element={<RedirectRoute />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
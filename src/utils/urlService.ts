import { UrlData, CreateUrlRequest, ClickData } from '../types';
import { logger } from './logger';

export class UrlService {
  private static STORAGE_KEY = 'url_shortener_data';

  static generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidShortcode(shortcode: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(shortcode) && shortcode.length >= 3 && shortcode.length <= 10;
  }

  static getAllUrls(): UrlData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const urls = JSON.parse(data).map((url: any) => ({
        ...url,
        createdAt: new Date(url.createdAt),
        expiresAt: new Date(url.expiresAt),
        clicks: url.clicks.map((click: any) => ({
          ...click,
          timestamp: new Date(click.timestamp)
        })),
        isExpired: new Date() > new Date(url.expiresAt)
      }));
      
      logger.info('Retrieved URLs from storage', { count: urls.length });
      return urls;
    } catch (error) {
      logger.error('Error retrieving URLs from storage', error);
      return [];
    }
  }

  static saveUrls(urls: UrlData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(urls));
      logger.info('Saved URLs to storage', { count: urls.length });
    } catch (error) {
      logger.error('Error saving URLs to storage', error);
    }
  }

  static createShortUrl(request: CreateUrlRequest): UrlData {
    logger.info('Creating short URL', request);

    if (!this.isValidUrl(request.originalUrl)) {
      logger.error('Invalid URL provided', request.originalUrl);
      throw new Error('Invalid URL format');
    }

    const existingUrls = this.getAllUrls();
    
    let shortCode = request.customShortcode;
    
    if (shortCode) {
      if (!this.isValidShortcode(shortCode)) {
        logger.error('Invalid shortcode format', shortCode);
        throw new Error('Shortcode must be 3-10 alphanumeric characters');
      }
      
      if (existingUrls.some(url => url.shortCode === shortCode)) {
        logger.error('Shortcode already exists', shortCode);
        throw new Error('Shortcode already exists');
      }
    } else {
      do {
        shortCode = this.generateShortCode();
      } while (existingUrls.some(url => url.shortCode === shortCode));
    }

    const validityMinutes = request.validityMinutes || 30;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validityMinutes * 60 * 1000);

    const urlData: UrlData = {
      id: Date.now().toString(),
      originalUrl: request.originalUrl,
      shortCode,
      shortUrl: `http://localhost:3000/${shortCode}`,
      createdAt: now,
      expiresAt,
      clicks: [],
      isExpired: false
    };

    existingUrls.push(urlData);
    this.saveUrls(existingUrls);

    logger.info('Short URL created successfully', urlData);
    return urlData;
  }

  static getUrlByShortCode(shortCode: string): UrlData | null {
    const urls = this.getAllUrls();
    const url = urls.find(u => u.shortCode === shortCode);
    
    if (url) {
      logger.info('Found URL by shortcode', { shortCode, originalUrl: url.originalUrl });
    } else {
      logger.warn('URL not found for shortcode', shortCode);
    }
    
    return url || null;
  }

  static recordClick(shortCode: string): boolean {
    logger.info('Recording click for shortcode', shortCode);
    
    const urls = this.getAllUrls();
    const urlIndex = urls.findIndex(u => u.shortCode === shortCode);
    
    if (urlIndex === -1) {
      logger.error('URL not found for click recording', shortCode);
      return false;
    }

    const url = urls[urlIndex];
    
    if (new Date() > url.expiresAt) {
      logger.warn('Attempted to click expired URL', shortCode);
      return false;
    }

    const clickData: ClickData = {
      timestamp: new Date(),
      source: document.referrer || 'Direct',
      userAgent: navigator.userAgent,
      location: 'Unknown' // In a real app, you'd use geolocation API
    };

    urls[urlIndex].clicks.push(clickData);
    this.saveUrls(urls);
    
    logger.info('Click recorded successfully', clickData);
    return true;
  }

  static getStatistics() {
    const urls = this.getAllUrls();
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks.length, 0);
    const activeUrls = urls.filter(url => !url.isExpired).length;
    
    logger.info('Generated statistics', { totalUrls, totalClicks, activeUrls });
    
    return {
      totalUrls,
      totalClicks,
      activeUrls,
      expiredUrls: totalUrls - activeUrls
    };
  }
}
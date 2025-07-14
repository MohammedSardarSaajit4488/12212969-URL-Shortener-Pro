export interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: Date;
  expiresAt: Date;
  clicks: ClickData[];
  isExpired: boolean;
}

export interface ClickData {
  timestamp: Date;
  source: string;
  userAgent: string;
  location: string;
}

export interface CreateUrlRequest {
  originalUrl: string;
  customShortcode?: string;
  validityMinutes?: number;
}
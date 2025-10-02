/**
 * CDN and Static Asset Optimization System
 * Advanced CDN integration, asset optimization, and delivery optimization
 */

import { NextRequest, NextResponse } from 'next/server';

export interface CDNConfig {
  provider: 'cloudflare' | 'aws_cloudfront' | 'vercel' | 'custom';
  domain: string;
  apiKey?: string;
  zoneId?: string;
  enableCompression: boolean;
  enableMinification: boolean;
  enableImageOptimization: boolean;
  enableCaching: boolean;
  cacheTtl: number;
}

export interface AssetOptimization {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  quality: number;
}

export interface CDNStats {
  requests: number;
  bandwidth: number;
  cacheHitRate: number;
  averageResponseTime: number;
  errorRate: number;
}

export class CDNOptimizer {
  private static config: CDNConfig = {
    provider: (process.env.CDN_PROVIDER as any) || 'vercel',
    domain: process.env.CDN_DOMAIN || '',
    apiKey: process.env.CDN_API_KEY,
    zoneId: process.env.CDN_ZONE_ID,
    enableCompression: process.env.CDN_COMPRESSION === 'true',
    enableMinification: process.env.CDN_MINIFICATION === 'true',
    enableImageOptimization: process.env.CDN_IMAGE_OPTIMIZATION === 'true',
    enableCaching: process.env.CDN_CACHING === 'true',
    cacheTtl: parseInt(process.env.CDN_CACHE_TTL || '86400') // 24 hours
  };

  private static stats: CDNStats = {
    requests: 0,
    bandwidth: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    errorRate: 0
  };

  /**
   * Optimize static assets
   */
  static async optimizeAsset(
    assetPath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png' | 'avif';
      compression?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const optimizedUrl = this.buildOptimizedUrl(assetPath, options);
      
      // Update stats
      this.stats.requests++;
      
      return optimizedUrl;

    } catch (error) {
      console.error('Asset optimization failed:', error);
      return assetPath; // Return original path on error
    }
  }

  /**
   * Build optimized URL for CDN
   */
  private static buildOptimizedUrl(
    assetPath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
      compression?: boolean;
    }
  ): string {
    if (!this.config.domain) {
      return assetPath;
    }

    const baseUrl = `https://${this.config.domain}`;
    const params = new URLSearchParams();

    // Add optimization parameters
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    if (options.compression) params.set('compress', 'true');

    const queryString = params.toString();
    const separator = assetPath.includes('?') ? '&' : '?';
    
    return `${baseUrl}${assetPath}${queryString ? separator + queryString : ''}`;
  }

  /**
   * Optimize images with automatic format selection
   */
  static async optimizeImage(
    imagePath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'auto' | 'webp' | 'jpeg' | 'png' | 'avif';
    } = {}
  ): Promise<string> {
    const optimizationOptions = {
      ...options,
      format: options.format === 'auto' ? this.getBestImageFormat() : options.format,
      compression: true
    };

    return this.optimizeAsset(imagePath, optimizationOptions);
  }

  /**
   * Get best image format based on browser support
   */
  private static getBestImageFormat(): string {
    // In a real implementation, this would check browser capabilities
    // For now, return WebP as it's widely supported and efficient
    return 'webp';
  }

  /**
   * Optimize CSS files
   */
  static async optimizeCSS(cssPath: string): Promise<string> {
    if (!this.config.enableMinification) {
      return cssPath;
    }

    return this.optimizeAsset(cssPath, {
      compression: true
    });
  }

  /**
   * Optimize JavaScript files
   */
  static async optimizeJS(jsPath: string): Promise<string> {
    if (!this.config.enableMinification) {
      return jsPath;
    }

    return this.optimizeAsset(jsPath, {
      compression: true
    });
  }

  /**
   * Generate responsive image URLs
   */
  static generateResponsiveImages(
    imagePath: string,
    sizes: number[] = [320, 640, 1024, 1280, 1920]
  ): string[] {
    return sizes.map(size => 
      this.optimizeImage(imagePath, { width: size, quality: 85 })
    );
  }

  /**
   * Generate srcset for responsive images
   */
  static generateSrcSet(
    imagePath: string,
    sizes: number[] = [320, 640, 1024, 1280, 1920]
  ): string {
    const responsiveImages = this.generateResponsiveImages(imagePath, sizes);
    
    return responsiveImages
      .map((url, index) => `${url} ${sizes[index]}w`)
      .join(', ');
  }

  /**
   * Preload critical assets
   */
  static generatePreloadLinks(assets: Array<{
    href: string;
    as: 'script' | 'style' | 'image' | 'font';
    type?: string;
  }>): string {
    return assets
      .map(asset => {
        const typeAttr = asset.type ? ` type="${asset.type}"` : '';
        return `<link rel="preload" href="${asset.href}" as="${asset.as}"${typeAttr}>`;
      })
      .join('\n');
  }

  /**
   * Generate critical CSS
   */
  static async generateCriticalCSS(cssPath: string): Promise<string> {
    // In a real implementation, this would extract critical CSS
    // For now, return a placeholder
    return `
      /* Critical CSS for above-the-fold content */
      body { margin: 0; font-family: system-ui, sans-serif; }
      .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    `;
  }

  /**
   * Optimize fonts
   */
  static async optimizeFonts(fontPaths: string[]): Promise<string[]> {
    return fontPaths.map(fontPath => 
      this.optimizeAsset(fontPath, {
        compression: true
      })
    );
  }

  /**
   * Generate font preload links
   */
  static generateFontPreloads(fonts: Array<{
    href: string;
    type: string;
    crossorigin?: boolean;
  }>): string {
    return fonts
      .map(font => {
        const crossorigin = font.crossorigin ? ' crossorigin' : '';
        return `<link rel="preload" href="${font.href}" as="font" type="${font.type}"${crossorigin}>`;
      })
      .join('\n');
  }

  /**
   * Purge CDN cache
   */
  static async purgeCache(urls: string[]): Promise<boolean> {
    try {
      if (this.config.provider === 'cloudflare' && this.config.apiKey && this.config.zoneId) {
        return await this.purgeCloudflareCache(urls);
      } else if (this.config.provider === 'aws_cloudfront' && this.config.apiKey) {
        return await this.purgeCloudFrontCache(urls);
      } else if (this.config.provider === 'vercel') {
        return await this.purgeVercelCache(urls);
      }

      console.warn('CDN cache purging not configured for provider:', this.config.provider);
      return false;

    } catch (error) {
      console.error('CDN cache purge failed:', error);
      return false;
    }
  }

  /**
   * Purge Cloudflare cache
   */
  private static async purgeCloudflareCache(urls: string[]): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ files: urls })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Cloudflare cache purge failed:', error);
      return false;
    }
  }

  /**
   * Purge AWS CloudFront cache
   */
  private static async purgeCloudFrontCache(urls: string[]): Promise<boolean> {
    // This would require AWS SDK implementation
    console.log('CloudFront cache purge not implemented');
    return false;
  }

  /**
   * Purge Vercel cache
   */
  private static async purgeVercelCache(urls: string[]): Promise<boolean> {
    try {
      const response = await fetch(
        'https://api.vercel.com/v1/integrations/deployments',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ urls })
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Vercel cache purge failed:', error);
      return false;
    }
  }

  /**
   * Get CDN statistics
   */
  static getCDNStats(): CDNStats {
    return { ...this.stats };
  }

  /**
   * Update CDN statistics
   */
  static updateStats(updates: Partial<CDNStats>): void {
    this.stats = { ...this.stats, ...updates };
  }

  /**
   * Generate performance hints
   */
  static generatePerformanceHints(): string {
    const hints = [
      'Use WebP format for images when possible',
      'Enable compression for all assets',
      'Implement lazy loading for images',
      'Use critical CSS for above-the-fold content',
      'Preload critical fonts and scripts',
      'Optimize images for different screen sizes',
      'Use CDN for static assets',
      'Implement proper caching headers'
    ];

    return hints.join('\n');
  }

  /**
   * Check CDN health
   */
  static async checkCDNHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'error';
    responseTime: number;
    cacheHitRate: number;
    errorRate: number;
  }> {
    try {
      const testUrl = `${this.config.domain}/health-check`;
      const startTime = Date.now();
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-cache'
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok && responseTime < 1000;

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        responseTime,
        cacheHitRate: this.stats.cacheHitRate,
        errorRate: this.stats.errorRate
      };

    } catch (error) {
      return {
        status: 'error',
        responseTime: 0,
        cacheHitRate: 0,
        errorRate: 100
      };
    }
  }
}

/**
 * CDN optimization middleware
 */
export function withCDNOptimization(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const response = await handler(request, ...args);

    // Add CDN headers
    if (CDNOptimizer['config'].enableCaching) {
      response.headers.set('Cache-Control', `public, max-age=${CDNOptimizer['config'].cacheTtl}`);
      response.headers.set('CDN-Cache-Control', 'public, max-age=31536000'); // 1 year for CDN
    }

    // Add compression headers
    if (CDNOptimizer['config'].enableCompression) {
      response.headers.set('Content-Encoding', 'gzip');
    }

    return response;
  };
}

/**
 * Asset optimization helper
 */
export class AssetOptimizer {
  /**
   * Optimize image for different use cases
   */
  static async optimizeForUseCase(
    imagePath: string,
    useCase: 'hero' | 'thumbnail' | 'gallery' | 'avatar'
  ): Promise<string> {
    const optimizationMap = {
      hero: { width: 1920, height: 1080, quality: 90, format: 'webp' },
      thumbnail: { width: 300, height: 200, quality: 80, format: 'webp' },
      gallery: { width: 800, height: 600, quality: 85, format: 'webp' },
      avatar: { width: 150, height: 150, quality: 90, format: 'webp' }
    };

    const options = optimizationMap[useCase];
    return CDNOptimizer.optimizeImage(imagePath, options);
  }

  /**
   * Generate responsive image component
   */
  static generateResponsiveImageComponent(
    imagePath: string,
    alt: string,
    sizes: string = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  ): string {
    const srcSet = CDNOptimizer.generateSrcSet(imagePath);
    const fallbackSrc = CDNOptimizer.optimizeImage(imagePath, { width: 800, quality: 85 });

    return `
      <img 
        src="${fallbackSrc}"
        srcset="${srcSet}"
        sizes="${sizes}"
        alt="${alt}"
        loading="lazy"
        decoding="async"
      />
    `;
  }
}

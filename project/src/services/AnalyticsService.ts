import { StorefrontConfig } from './StorefrontService';

export interface AnalyticsTimeframe {
  startDate: Date;
  endDate: Date;
}

export interface VisitorData {
  date: string;
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface DeviceData {
  device: 'desktop' | 'mobile' | 'tablet';
  percentage: number;
  visitors: number;
}

export interface TrafficSourceData {
  source: string;
  visitors: number;
  percentage: number;
  conversion: number;
}

export interface PagePerformanceData {
  path: string;
  title: string;
  views: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export interface ConversionData {
  date: string;
  visitors: number;
  addedToCart: number;
  checkouts: number;
  purchases: number;
  conversionRate: number;
}

export interface ProductPerformanceData {
  productId: string;
  name: string;
  views: number;
  addedToCart: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
}

export interface OverviewData {
  totalVisitors: number;
  totalPageViews: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  avgOrderValue: number;
  visitorsChange: number;
  revenueChange: number;
  ordersChange: number;
}

export interface FullAnalyticsData {
  overview: OverviewData;
  visitorsByDay: VisitorData[];
  deviceDistribution: DeviceData[];
  trafficSources: TrafficSourceData[];
  topPages: PagePerformanceData[];
  conversionsByDay: ConversionData[];
  topProducts: ProductPerformanceData[];
}

/**
 * Service for handling storefront analytics
 */
class AnalyticsService {
  /**
   * Get storefront analytics data
   */
  async getAnalyticsData(storefrontId: string, timeframe: AnalyticsTimeframe): Promise<FullAnalyticsData> {
    // In a real implementation, this would call an API to fetch actual analytics data
    // For now, we'll just return mock data
    return this.generateMockData(timeframe);
  }
  
  /**
   * Get analytics overview data
   */
  async getOverviewData(storefrontId: string, timeframe: AnalyticsTimeframe): Promise<OverviewData> {
    // In a real implementation, this would call an API to fetch actual analytics data
    return this.generateMockData(timeframe).overview;
  }
  
  /**
   * Generate tracking code for a storefront
   */
  generateTrackingCode(storefrontConfig: StorefrontConfig): string {
    // Generate basic tracking script
    return `
<!-- Auto-Dukaan Analytics -->
<script>
  (function(w,d,s,l,i){
    w[l]=w[l]||[];
    w[l].push({'storefrontId': '${storefrontConfig.id}'});
    var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;j.src='https://analytics.autodukaan.com/track.js'+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','dukaanData','AD');
</script>
<!-- End Auto-Dukaan Analytics -->
    `;
  }
  
  /**
   * Generate tracking code for Google Analytics
   */
  generateGoogleAnalyticsCode(gaId: string): string {
    return `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId}');
</script>
<!-- End Google Analytics -->
    `;
  }
  
  /**
   * Generate tracking code for Facebook Pixel
   */
  generateFacebookPixelCode(pixelId: string): string {
    return `
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
</noscript>
<!-- End Facebook Pixel Code -->
    `;
  }
  
  /**
   * Generate script to track ecommerce events
   */
  generateEcommerceTrackingScript(): string {
    return `
<!-- Auto-Dukaan Ecommerce Tracking -->
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Product view tracking
    if (document.querySelector('.product-detail')) {
      window.dukaanData = window.dukaanData || [];
      dukaanData.push({
        'event': 'view_item',
        'product': {
          'id': document.querySelector('[data-product-id]').dataset.productId,
          'name': document.querySelector('.product-title').innerText,
          'price': parseFloat(document.querySelector('.product-price').dataset.price)
        }
      });
    }
    
    // Add to cart tracking
    document.querySelectorAll('.add-to-cart-button').forEach(function(button) {
      button.addEventListener('click', function() {
        const productId = this.dataset.productId;
        const productName = this.dataset.productName;
        const productPrice = parseFloat(this.dataset.productPrice);
        const quantity = parseInt(document.querySelector('#quantity').value || '1');
        
        window.dukaanData = window.dukaanData || [];
        dukaanData.push({
          'event': 'add_to_cart',
          'product': {
            'id': productId,
            'name': productName,
            'price': productPrice,
            'quantity': quantity
          }
        });
      });
    });
  });
</script>
<!-- End Auto-Dukaan Ecommerce Tracking -->
    `;
  }
  
  /**
   * Export analytics data to CSV format
   */
  exportAnalyticsToCSV(data: FullAnalyticsData): string {
    // Simple CSV export for visitor data
    const headers = "Date,Visitors,Unique Visitors,Page Views,Bounce Rate,Avg Session Duration\n";
    const rows = data.visitorsByDay.map(day => 
      `${day.date},${day.visitors},${day.uniqueVisitors},${day.pageViews},${day.bounceRate},${day.avgSessionDuration}`
    ).join("\n");
    
    return headers + rows;
  }
  
  /**
   * Generate mock data for development and demonstration
   */
  private generateMockData(timeframe: AnalyticsTimeframe): FullAnalyticsData {
    const days = this.getDaysBetweenDates(timeframe.startDate, timeframe.endDate);
    const visitorsByDay: VisitorData[] = [];
    const conversionsByDay: ConversionData[] = [];
    
    let totalVisitors = 0;
    let totalPageViews = 0;
    let totalOrders = 0;
    let totalRevenue = 0;
    
    // Generate daily data
    for (let i = 0; i < days.length; i++) {
      const date = days[i];
      const visitors = Math.floor(Math.random() * 100) + 20;
      const uniqueVisitors = Math.floor(visitors * 0.8);
      const pageViews = visitors * (Math.floor(Math.random() * 3) + 2);
      const bounceRate = Math.random() * 0.3 + 0.2;
      const avgSessionDuration = Math.random() * 180 + 60;
      
      totalVisitors += visitors;
      totalPageViews += pageViews;
      
      visitorsByDay.push({
        date: date.toISOString().split('T')[0],
        visitors,
        uniqueVisitors,
        pageViews,
        bounceRate,
        avgSessionDuration
      });
      
      const addedToCart = Math.floor(visitors * (Math.random() * 0.3 + 0.1));
      const checkouts = Math.floor(addedToCart * (Math.random() * 0.5 + 0.3));
      const purchases = Math.floor(checkouts * (Math.random() * 0.7 + 0.2));
      const revenue = purchases * (Math.random() * 1000 + 500);
      
      totalOrders += purchases;
      totalRevenue += revenue;
      
      conversionsByDay.push({
        date: date.toISOString().split('T')[0],
        visitors,
        addedToCart,
        checkouts,
        purchases,
        conversionRate: purchases / visitors
      });
    }
    
    // Device distribution
    const deviceDistribution: DeviceData[] = [
      {
        device: 'mobile',
        percentage: 0.65,
        visitors: Math.floor(totalVisitors * 0.65)
      },
      {
        device: 'desktop',
        percentage: 0.28,
        visitors: Math.floor(totalVisitors * 0.28)
      },
      {
        device: 'tablet',
        percentage: 0.07,
        visitors: Math.floor(totalVisitors * 0.07)
      }
    ];
    
    // Traffic sources
    const trafficSources: TrafficSourceData[] = [
      {
        source: 'Direct',
        visitors: Math.floor(totalVisitors * 0.3),
        percentage: 0.3,
        conversion: 0.025
      },
      {
        source: 'Organic Search',
        visitors: Math.floor(totalVisitors * 0.25),
        percentage: 0.25,
        conversion: 0.02
      },
      {
        source: 'Social Media',
        visitors: Math.floor(totalVisitors * 0.2),
        percentage: 0.2,
        conversion: 0.035
      },
      {
        source: 'Referral',
        visitors: Math.floor(totalVisitors * 0.15),
        percentage: 0.15,
        conversion: 0.03
      },
      {
        source: 'Email',
        visitors: Math.floor(totalVisitors * 0.1),
        percentage: 0.1,
        conversion: 0.04
      }
    ];
    
    // Top pages
    const topPages: PagePerformanceData[] = [
      {
        path: '/',
        title: 'Home',
        views: Math.floor(totalPageViews * 0.25),
        avgTimeOnPage: 45,
        bounceRate: 0.35
      },
      {
        path: '/products',
        title: 'All Products',
        views: Math.floor(totalPageViews * 0.2),
        avgTimeOnPage: 60,
        bounceRate: 0.25
      },
      {
        path: '/product/123',
        title: 'Product Detail - Handcrafted Saree',
        views: Math.floor(totalPageViews * 0.1),
        avgTimeOnPage: 90,
        bounceRate: 0.2
      },
      {
        path: '/cart',
        title: 'Shopping Cart',
        views: Math.floor(totalPageViews * 0.08),
        avgTimeOnPage: 30,
        bounceRate: 0.3
      },
      {
        path: '/checkout',
        title: 'Checkout',
        views: Math.floor(totalPageViews * 0.05),
        avgTimeOnPage: 120,
        bounceRate: 0.15
      }
    ];
    
    // Top products
    const topProducts: ProductPerformanceData[] = [
      {
        productId: 'prod-1',
        name: 'Handcrafted Silk Saree',
        views: Math.floor(totalPageViews * 0.1),
        addedToCart: Math.floor(totalPageViews * 0.1 * 0.3),
        purchases: Math.floor(totalPageViews * 0.1 * 0.3 * 0.5),
        conversionRate: 0.015,
        revenue: Math.floor(totalPageViews * 0.1 * 0.3 * 0.5 * 2000)
      },
      {
        productId: 'prod-2',
        name: 'Cotton Kurta',
        views: Math.floor(totalPageViews * 0.08),
        addedToCart: Math.floor(totalPageViews * 0.08 * 0.25),
        purchases: Math.floor(totalPageViews * 0.08 * 0.25 * 0.4),
        conversionRate: 0.008,
        revenue: Math.floor(totalPageViews * 0.08 * 0.25 * 0.4 * 1200)
      },
      {
        productId: 'prod-3',
        name: 'Leather Handbag',
        views: Math.floor(totalPageViews * 0.06),
        addedToCart: Math.floor(totalPageViews * 0.06 * 0.2),
        purchases: Math.floor(totalPageViews * 0.06 * 0.2 * 0.3),
        conversionRate: 0.0036,
        revenue: Math.floor(totalPageViews * 0.06 * 0.2 * 0.3 * 1500)
      },
      {
        productId: 'prod-4',
        name: 'Traditional Jewelry Set',
        views: Math.floor(totalPageViews * 0.05),
        addedToCart: Math.floor(totalPageViews * 0.05 * 0.15),
        purchases: Math.floor(totalPageViews * 0.05 * 0.15 * 0.25),
        conversionRate: 0.0019,
        revenue: Math.floor(totalPageViews * 0.05 * 0.15 * 0.25 * 2500)
      },
      {
        productId: 'prod-5',
        name: 'Decorative Home Items',
        views: Math.floor(totalPageViews * 0.04),
        addedToCart: Math.floor(totalPageViews * 0.04 * 0.12),
        purchases: Math.floor(totalPageViews * 0.04 * 0.12 * 0.2),
        conversionRate: 0.001,
        revenue: Math.floor(totalPageViews * 0.04 * 0.12 * 0.2 * 800)
      }
    ];
    
    // Overview data with change percentages
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      overview: {
        totalVisitors,
        totalPageViews,
        totalOrders,
        totalRevenue,
        conversionRate: totalOrders / totalVisitors,
        avgOrderValue,
        visitorsChange: Math.random() * 0.4 - 0.1, // Between -10% and +30%
        revenueChange: Math.random() * 0.5 - 0.1,  // Between -10% and +40%
        ordersChange: Math.random() * 0.3 - 0.05   // Between -5% and +25%
      },
      visitorsByDay,
      deviceDistribution,
      trafficSources,
      topPages,
      conversionsByDay,
      topProducts
    };
  }
  
  /**
   * Helper method to get all days between two dates
   */
  private getDaysBetweenDates(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }
}

export default new AnalyticsService();
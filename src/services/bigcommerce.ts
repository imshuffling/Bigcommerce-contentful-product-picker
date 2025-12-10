export interface BigCommerceVariant {
  id: number;
  product_id: number;
  sku: string;
  price: number;
  calculated_price?: number;
  inventory_level?: number;
  image_url?: string;
  option_values: Array<{
    id: number;
    label: string;
    option_display_name: string;
  }>;
}

export interface BigCommerceProduct {
  id: number;
  name: string;
  sku: string;
  price: number;
  calculated_price?: number;
  variants: BigCommerceVariant[];
  primary_image?: {
    url_thumbnail?: string;
    url_standard?: string;
  };
  images?: Array<{
    url_thumbnail?: string;
    url_standard?: string;
  }>;
}

export interface BigCommerceConfig {
  storeHash: string;
  accessToken: string;
}

export class BigCommerceService {
  private storeHash: string;
  private accessToken: string;
  private baseUrl: string;
  private useCorsProxy: boolean;
  private corsProxyUrl: string;

  constructor(config: BigCommerceConfig) {
    this.storeHash = config.storeHash;
    this.accessToken = config.accessToken;
    this.baseUrl = `https://api.bigcommerce.com/stores/${this.storeHash}/v3`;
    // Use CORS proxy for browser requests (temporary solution)
    this.useCorsProxy = true;
    this.corsProxyUrl = 'https://corsproxy.io/?';
  }

  private async request<T>(endpoint: string): Promise<T> {
    try {
      const url = this.useCorsProxy
        ? `${this.corsProxyUrl}${encodeURIComponent(this.baseUrl + endpoint)}`
        : `${this.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Auth-Token': this.accessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`BigCommerce API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('BigCommerce API request failed:', error);
      throw new Error(
        'Failed to fetch data from BigCommerce. This may be due to CORS restrictions. ' +
        'Please ensure your BigCommerce store allows requests from Contentful, or consider using a backend proxy.'
      );
    }
  }

  async getProducts(page: number = 1, limit: number = 50): Promise<BigCommerceProduct[]> {
    return this.request<BigCommerceProduct[]>(
      `/catalog/products?page=${page}&limit=${limit}&include=variants,images,primary_image`
    );
  }

  async searchProducts(keyword: string, page: number = 1, limit: number = 50): Promise<BigCommerceProduct[]> {
    return this.request<BigCommerceProduct[]>(
      `/catalog/products?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}&include=variants,images,primary_image`
    );
  }

  async getProductVariants(productId: number): Promise<BigCommerceVariant[]> {
    return this.request<BigCommerceVariant[]>(`/catalog/products/${productId}/variants`);
  }
}

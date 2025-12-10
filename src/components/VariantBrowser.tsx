import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextInput,
  Spinner,
  Paragraph,
  Stack,
  Badge,
  Card,
  Grid,
} from '@contentful/f36-components';
import { css } from 'emotion';
import { BigCommerceService, BigCommerceProduct, BigCommerceVariant } from '../services/bigcommerce';

interface VariantBrowserProps {
  storeHash: string;
  accessToken: string;
  onSelectVariant: (sku: string, variant: BigCommerceVariant, product: BigCommerceProduct) => void;
  selectedSku?: string;
}

export const VariantBrowser = ({
  storeHash,
  accessToken,
  onSelectVariant,
  selectedSku,
}: VariantBrowserProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<BigCommerceProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bcService, setBcService] = useState<BigCommerceService | null>(null);

  useEffect(() => {
    if (storeHash && accessToken) {
      const service = new BigCommerceService({ storeHash, accessToken });
      setBcService(service);
      loadProducts(service);
    }
  }, [storeHash, accessToken]);

  const loadProducts = async (service: BigCommerceService, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = search
        ? await service.searchProducts(search)
        : await service.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (bcService) {
      loadProducts(bcService, searchTerm);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatOptionValues = (variant: BigCommerceVariant) => {
    return variant.option_values
      .map((opt) => `${opt.option_display_name}: ${opt.label}`)
      .join(', ');
  };

  const getProductImage = (product: BigCommerceProduct) => {
    return product.primary_image?.url_thumbnail ||
      product.images?.[0]?.url_thumbnail ||
      'https://via.placeholder.com/150?text=No+Image';
  };

  const formatPrice = (variant: BigCommerceVariant) => {
    const price = variant.calculated_price || variant.price;
    return `£${price.toFixed(2)}`;
  };

  const gridStyles = css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
    maxHeight: '600px',
    overflow: 'auto',
    padding: '8px',
    width: '100%',
    gridAutoRows: '1fr',
  });

  const cardStyles = css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
  });

  const imageContainerStyles = css({
    width: '100%',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: '4px 4px 0 0',
    overflow: 'hidden',
  });

  const imageStyles = css({
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  });

  const contentStyles = css({
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    justifyContent: 'space-between',
  });

  const productNameStyles = css({
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '4px',
  });

  const variantInfoStyles = css({
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px',
  });

  const priceStyles = css({
    fontSize: '16px',
    fontWeight: 700,
    color: '#2e5bff',
    marginTop: 'auto',
    marginBottom: '8px',
  });

  return (
    <Box>
      <Stack flexDirection="column" spacing="spacingM">
        <Stack spacing="spacingS" flexDirection="row" fullWidth>
          <TextInput
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ flex: 1, width: '100%' }}
          />
          <Button onClick={handleSearch} isDisabled={loading}>
            Search
          </Button>
        </Stack>

        {loading && (
          <Box style={{ textAlign: 'center', padding: '2rem' }}>
            <Spinner />
          </Box>
        )}

        {error && (
          <Paragraph style={{ color: 'red' }}>
            Error: {error}
          </Paragraph>
        )}

        {!loading && !error && products.length === 0 && (
          <Paragraph>No products found. Try a different search term.</Paragraph>
        )}

        {!loading && !error && products.length > 0 && (
          <div className={gridStyles}>
            {products.map((product) =>
              product.variants && product.variants.length > 0 ? (
                product.variants.map((variant) => (
                  <Card key={`${product.id}-${variant.id}`} className={cardStyles}>
                    <div className={imageContainerStyles}>
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className={imageStyles}
                      />
                    </div>
                    <div className={contentStyles}>
                      <div>
                        <div className={productNameStyles}>{product.name}</div>
                        <div className={variantInfoStyles}>
                          {variant.option_values && variant.option_values.length > 0
                            ? formatOptionValues(variant)
                            : 'Default Variant'}
                        </div>
                        <div className={variantInfoStyles}>
                          <strong>SKU:</strong> {variant.sku}
                        </div>
                        {selectedSku === variant.sku && (
                          <Badge variant="positive">Currently Selected</Badge>
                        )}
                      </div>
                      <div>
                        <div className={priceStyles}>{formatPrice(variant)}</div>
                        <Button
                          size="small"
                          onClick={() => onSelectVariant(variant.sku, variant, product)}
                          variant={selectedSku === variant.sku ? 'positive' : 'primary'}
                          style={{ width: '100%' }}
                        >
                          {selectedSku === variant.sku ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : null
            )}
          </div>
        )}
      </Stack>
    </Box>
  );
};

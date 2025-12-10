import { useState, useEffect } from 'react';
import { Button, Stack, TextInput, Flex, Note, Card, Box } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { css } from 'emotion';
import { AppInstallationParameters } from './ConfigScreen';
import { BigCommerceProduct, BigCommerceVariant } from '../services/bigcommerce';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [value, setValue] = useState<string>(sdk.field.getValue() || '');
  const [parameters, setParameters] = useState<AppInstallationParameters>({});
  const [selectedVariantInfo, setSelectedVariantInfo] = useState<{
    product: BigCommerceProduct;
    variant: BigCommerceVariant;
  } | null>(null);

  useEffect(() => {
    sdk.window.startAutoResizer();

    // Load app installation parameters from sdk.parameters.installation
    const params = sdk.parameters.installation as AppInstallationParameters;
    if (params) {
      setParameters(params);
    }

    // Try to restore variant info from stored object
    const currentValue = sdk.field.getValue();
    if (currentValue) {
      if (typeof currentValue === 'object' && currentValue.variantSku) {
        // New simplified format
        const reconstructed = {
          variant: {
            id: currentValue.variantId,
            sku: currentValue.variantSku,
            price: currentValue.price,
            option_values: currentValue.options?.map((opt: any) => ({
              option_display_name: opt.name,
              label: opt.value
            })) || []
          } as BigCommerceVariant,
          product: {
            id: currentValue.productId,
            name: currentValue.productName,
            primary_image: currentValue.imageUrl ? { url_thumbnail: currentValue.imageUrl } : undefined
          } as BigCommerceProduct
        };
        setSelectedVariantInfo(reconstructed);
        setValue(currentValue.variantSku);
      } else if (typeof currentValue === 'object' && currentValue.variant) {
        // Old format with nested objects
        setSelectedVariantInfo(currentValue);
        setValue(currentValue.variant.sku);
      } else if (typeof currentValue === 'string') {
        // Legacy SKU string format
        setValue(currentValue);
      }
    }

    const detachValueChangeHandler = sdk.field.onValueChanged((newValue: any) => {
      if (newValue) {
        if (typeof newValue === 'object' && newValue.variantSku) {
          const reconstructed = {
            variant: {
              id: newValue.variantId,
              sku: newValue.variantSku,
              price: newValue.price,
              option_values: newValue.options?.map((opt: any) => ({
                option_display_name: opt.name,
                label: opt.value
              })) || []
            } as BigCommerceVariant,
            product: {
              id: newValue.productId,
              name: newValue.productName,
              primary_image: newValue.imageUrl ? { url_thumbnail: newValue.imageUrl } : undefined
            } as BigCommerceProduct
          };
          setSelectedVariantInfo(reconstructed);
          setValue(newValue.variantSku);
        } else if (typeof newValue === 'object' && newValue.variant) {
          setSelectedVariantInfo(newValue);
          setValue(newValue.variant.sku);
        } else if (typeof newValue === 'string') {
          setValue(newValue);
        }
      } else {
        setValue('');
        setSelectedVariantInfo(null);
      }
    });

    return () => {
      detachValueChangeHandler();
    };
  }, [sdk]);

  const handleOpenDialog = async () => {
    if (!parameters.storeHash || !parameters.accessToken) {
      sdk.notifier.error('Please configure BigCommerce credentials in the app configuration');
      return;
    }

    try {
      const result = await sdk.dialogs.openCurrentApp({
        width: 1200,
        title: 'Bigcommerce product picker',
        parameters: {
          storeHash: parameters.storeHash,
          accessToken: parameters.accessToken,
          currentSku: value
        },
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEscapePress: true,
      });

      if (result) {
        handleSelectVariant(result.sku, result.variant, result.product);
      }
    } catch (error) {
      // Dialog was closed without selection
      console.log('Dialog closed');
    }
  };

  const handleSelectVariant = (sku: string, variant: BigCommerceVariant, product: BigCommerceProduct) => {
    try {
      // Store minimal data structure
      const data = {
        variantId: variant.id,
        variantSku: variant.sku,
        productId: product.id,
        productName: product.name,
        price: variant.calculated_price || variant.price,
        imageUrl: product.primary_image?.url_thumbnail || product.images?.[0]?.url_thumbnail || '',
        options: variant.option_values?.map(opt => ({
          name: opt.option_display_name,
          value: opt.label
        })) || []
      };
      setValue(sku);
      sdk.field.setValue(data);
      setSelectedVariantInfo({ product, variant });
      sdk.notifier.success(`Selected variant: ${sku}`);
    } catch (error) {
      console.error('Error setting field value:', error);
      sdk.notifier.error('Failed to save variant selection');
    }
  };

  const handleClear = () => {
    setValue('');
    sdk.field.setValue(null);
    setSelectedVariantInfo(null);
  };

  const formatOptionValues = (variant: BigCommerceVariant) => {
    return variant.option_values
      .map((opt) => `${opt.option_display_name}: ${opt.label}`)
      .join(', ');
  };

  const getProductImage = (product: BigCommerceProduct) => {
    return product.primary_image?.url_thumbnail ||
      product.images?.[0]?.url_thumbnail ||
      'https://via.placeholder.com/100?text=No+Image';
  };

  const formatPrice = (variant: BigCommerceVariant) => {
    const price = variant.calculated_price || variant.price;
    return `£${price.toFixed(2)}`;
  };

  const previewCardStyles = css({
    display: 'flex',
    gap: '16px',
    padding: '12px',
    alignItems: 'center',
    backgroundColor: '#f7f9fa',
    borderRadius: '6px',
    border: '1px solid #d3dce0',
  });

  const imageStyles = css({
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    borderRadius: '4px',
    backgroundColor: '#fff',
    border: '1px solid #e5ebed',
  });

  const infoStyles = css({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  });

  const nameStyles = css({
    fontSize: '14px',
    fontWeight: 600,
    color: '#1d262d',
  });

  const detailStyles = css({
    fontSize: '13px',
    color: '#536171',
  });

  const priceStyles = css({
    fontSize: '15px',
    fontWeight: 700,
    color: '#2e5bff',
  });

  return (
    <Stack spacing="spacingS">
      {!parameters.storeHash || !parameters.accessToken ? (
        <Note variant="warning">
          Please configure BigCommerce credentials in the app configuration first.
        </Note>
      ) : null}

      {!selectedVariantInfo && (
        <Flex gap="spacingS" alignItems="flex-end">
          <TextInput
            value={value}
            isReadOnly
            placeholder="Select a product..."
            style={{ flex: 1 }}
          />
          <Button onClick={handleOpenDialog} isDisabled={!parameters.storeHash || !parameters.accessToken}>
            Browse
          </Button>
        </Flex>
      )}

      {selectedVariantInfo && (
        <Box>
          <div className={previewCardStyles}>
            <img
              src={getProductImage(selectedVariantInfo.product)}
              alt={selectedVariantInfo.product.name}
              className={imageStyles}
            />
            <div className={infoStyles}>
              <div className={nameStyles}>{selectedVariantInfo.product.name}</div>
              {selectedVariantInfo.variant.option_values && selectedVariantInfo.variant.option_values.length > 0 && (
                <div className={detailStyles}>
                  {formatOptionValues(selectedVariantInfo.variant)}
                </div>
              )}
              <div className={detailStyles}>
                <strong>SKU:</strong> {selectedVariantInfo.variant.sku}
              </div>
              <div className={priceStyles}>{formatPrice(selectedVariantInfo.variant)}</div>
            </div>
            <Flex gap="spacingXs" flexDirection="column">
              <Button size="small" onClick={handleOpenDialog} isDisabled={!parameters.storeHash || !parameters.accessToken}>
                Change
              </Button>
              <Button size="small" variant="secondary" onClick={handleClear}>
                Clear
              </Button>
            </Flex>
          </div>
        </Box>
      )}
    </Stack>
  );
};

export default Field;

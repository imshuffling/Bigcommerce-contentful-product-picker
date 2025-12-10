import { useEffect } from 'react';
import { Box } from '@contentful/f36-components';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { VariantBrowser } from '../components/VariantBrowser';
import { BigCommerceProduct, BigCommerceVariant } from '../services/bigcommerce';

interface DialogParameters {
  storeHash: string;
  accessToken: string;
  currentSku?: string;
}

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const parameters = sdk.parameters.invocation as unknown as DialogParameters;

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk]);

  const handleSelectVariant = (sku: string, variant: BigCommerceVariant, product: BigCommerceProduct) => {
    // Return only serializable data needed by the field
    sdk.close({
      sku,
      variant: {
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        calculated_price: variant.calculated_price,
        option_values: variant.option_values
      },
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        primary_image: product.primary_image,
        images: product.images
      }
    });
  };

  return (
    <Box padding="spacingM">
      <VariantBrowser
        storeHash={parameters.storeHash}
        accessToken={parameters.accessToken}
        selectedSku={parameters.currentSku}
        onSelectVariant={handleSelectVariant}
      />
    </Box>
  );
};

export default Dialog;

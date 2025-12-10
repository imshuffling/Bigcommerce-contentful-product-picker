import { useEffect } from 'react';
import { Box } from '@contentful/f36-components';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { VariantBrowser } from '../components/VariantBrowser';
import { BigCommerceProduct, BigCommerceVariant } from '../services/bigcommerce';

interface PageParameters {
  storeHash: string;
  accessToken: string;
}

const Page = () => {
  const sdk = useSDK<DialogAppSDK>();
  const parameters = sdk.parameters.invocation as unknown as PageParameters;

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk]);

  const handleSelectVariant = (sku: string, variant: BigCommerceVariant, product: BigCommerceProduct) => {
    // Return product data for insertion into rich text
    sdk.close({
      variant,
      product,
    });
  };

  return (
    <Box padding="spacingM">
      <VariantBrowser
        storeHash={parameters.storeHash}
        accessToken={parameters.accessToken}
        onSelectVariant={handleSelectVariant}
      />
    </Box>
  );
};

export default Page;

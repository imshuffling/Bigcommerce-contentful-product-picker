import { useEffect } from 'react';
import { Box } from '@contentful/f36-components';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { VariantBrowser } from '../components/VariantBrowser';
import { BigCommerceProduct, BigCommerceVariant } from '../services/bigcommerce';
import { AppInstallationParameters } from './ConfigScreen';

const EntryEditor = () => {
  const sdk = useSDK<DialogAppSDK>();
  const parameters = sdk.parameters.installation as AppInstallationParameters;

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk]);

  const handleSelectVariant = (sku: string, variant: BigCommerceVariant, product: BigCommerceProduct) => {
    // Return the selected product data
    sdk.close({
      variant,
      product,
    });
  };

  if (!parameters?.storeHash || !parameters?.accessToken) {
    return (
      <Box padding="spacingM">
        <p>Please configure BigCommerce credentials in the app configuration first.</p>
      </Box>
    );
  }

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

export default EntryEditor;

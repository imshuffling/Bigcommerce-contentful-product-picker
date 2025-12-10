import { useEffect } from 'react';
import { Box } from '@contentful/f36-components';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { VariantBrowser } from '../components/VariantBrowser';
import { BigCommerceProduct, BigCommerceVariant } from '../services/bigcommerce';
import { AppInstallationParameters } from './ConfigScreen';

const RichTextEmbed = () => {
  const sdk = useSDK<FieldExtensionSDK>();
  const parameters = sdk.parameters.installation as AppInstallationParameters;

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk]);

  const handleSelectVariant = async (sku: string, variant: BigCommerceVariant, product: BigCommerceProduct) => {
    try {
      // Get the current rich text value
      const currentValue = await sdk.field.getValue();

      // Create product data to embed
      const productData = {
        variantId: variant.id,
        variantSku: variant.sku,
        productId: product.id,
        productName: product.name,
        price: variant.calculated_price || variant.price,
        imageUrl: product.primary_image?.url_thumbnail || product.images?.[0]?.url_thumbnail || '',
        options: variant.option_values?.map(opt => ({
          name: opt.option_display_name,
          value: opt.label,
        })) || [],
      };

      // Create a hyperlink node with product data encoded in the URI
      const productLink = {
        nodeType: 'hyperlink',
        data: {
          uri: `bc-product://${variant.sku}?data=${encodeURIComponent(JSON.stringify(productData))}`,
        },
        content: [
          {
            nodeType: 'text',
            value: `${product.name} - ${variant.sku}`,
            marks: [],
            data: {},
          },
        ],
      };

      // Create a paragraph node containing the link
      const paragraphNode = {
        nodeType: 'paragraph',
        data: {},
        content: [productLink],
      };

      // Add the paragraph to the rich text document
      if (currentValue && currentValue.content) {
        currentValue.content.push(paragraphNode);
        await sdk.field.setValue(currentValue);
      } else {
        // Create a new rich text document
        const newDocument = {
          nodeType: 'document',
          data: {},
          content: [paragraphNode],
        };
        await sdk.field.setValue(newDocument);
      }

      sdk.notifier.success(`Product ${variant.sku} added to content`);
    } catch (error) {
      console.error('Error inserting product:', error);
      sdk.notifier.error(`Failed to insert product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

export default RichTextEmbed;

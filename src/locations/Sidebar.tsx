import { useEffect } from 'react';
import { Box, Button, Stack, Heading, Subheading } from '@contentful/f36-components';
import { SidebarAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { BigCommerceProduct, BigCommerceVariant } from '../services/bigcommerce';
import { AppInstallationParameters } from './ConfigScreen';

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  const parameters = sdk.parameters.installation as AppInstallationParameters;

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk]);

  const handleOpenProductPicker = async () => {
    if (!parameters.storeHash || !parameters.accessToken) {
      sdk.notifier.error('Please configure BigCommerce credentials in the app configuration');
      return;
    }

    try {
      const result = await sdk.dialogs.openCurrentApp({
        width: 1200,
        title: 'Select a product to insert',
        parameters: {
          storeHash: parameters.storeHash,
          accessToken: parameters.accessToken,
        },
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEscapePress: true,
      });

      if (result) {
        await handleSelectVariant(result.sku, result.variant, result.product);
      }
    } catch (error) {
      console.log('Dialog closed without selection');
    }
  };

  const handleSelectVariant = async (sku: string, variant: BigCommerceVariant, product: BigCommerceProduct) => {
    try {
      // Find the rich text field named "content"
      const contentField = sdk.entry.fields.content;

      if (!contentField) {
        sdk.notifier.error('No content field found. Please ensure your content type has a rich text field named "content".');
        return;
      }

      // Get the current rich text value
      const currentValue = await contentField.getValue();

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

      // Create a hyperlink node with product data encoded in the URI and an image
      const productLink = {
        nodeType: 'hyperlink',
        data: {
          uri: `bc-product://${variant.sku}?data=${encodeURIComponent(JSON.stringify(productData))}`,
        },
        content: [
          {
            nodeType: 'text',
            value: `🛒 ${product.name} - ${variant.sku} - £${(variant.calculated_price || variant.price).toFixed(2)}`,
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
        await contentField.setValue(currentValue);
      } else {
        // Create a new rich text document
        const newDocument = {
          nodeType: 'document',
          data: {},
          content: [paragraphNode],
        };
        await contentField.setValue(newDocument);
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
    <Box padding="none">
      <Stack spacing="spacingS" padding='none' flexDirection="column">
        <Button
          variant="primary"
          onClick={handleOpenProductPicker}
          isFullWidth
        >
          Browse products...
        </Button>
      </Stack>
    </Box>
  );
};

export default Sidebar;

const contentful = require('contentful-management');
require('dotenv').config();

async function createBigCommerceProductContentType() {
  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  });

  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
  const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

  try {
    // Check if content type already exists
    try {
      const existing = await environment.getContentType('bigcommerceProduct');
      console.log('Content type "bigcommerceProduct" already exists!');
      console.log('ID:', existing.sys.id);
      return;
    } catch (e) {
      // Content type doesn't exist, continue to create it
    }

    const contentType = await environment.createContentTypeWithId('bigcommerceProduct', {
      name: 'BigCommerce Product',
      displayField: 'title',
      fields: [
        {
          id: 'title',
          name: 'Title',
          type: 'Symbol',
          required: true,
        },
        {
          id: 'variantId',
          name: 'Variant ID',
          type: 'Integer',
          required: true,
        },
        {
          id: 'variantSku',
          name: 'Variant SKU',
          type: 'Symbol',
          required: true,
        },
        {
          id: 'productId',
          name: 'Product ID',
          type: 'Integer',
          required: true,
        },
        {
          id: 'productName',
          name: 'Product Name',
          type: 'Symbol',
          required: true,
        },
        {
          id: 'price',
          name: 'Price',
          type: 'Number',
          required: true,
        },
        {
          id: 'imageUrl',
          name: 'Image URL',
          type: 'Symbol',
          required: false,
        },
        {
          id: 'productData',
          name: 'Product Data',
          type: 'Object',
          required: false,
        },
      ],
    });

    await contentType.publish();

    console.log('✅ Content type "bigcommerceProduct" created successfully!');
    console.log('Content Type ID:', contentType.sys.id);
  } catch (error) {
    console.error('Error creating content type:', error.message);
    process.exit(1);
  }
}

createBigCommerceProductContentType();

# BigCommerce Variant Picker for Contentful

A custom Contentful app that allows you to browse and select BigCommerce product variants, storing the variant SKU in a short text field. This app provides full variant support that is missing from other BigCommerce integrations.

UPDATED
Has the ability now to be served in the sidebar location and the SKU short code stored in the rich text field

## Features

- Browse all BigCommerce products with their variants
- Search products by keyword
- View variant details including options (size, color, etc.), SKU, and price
- Select variants and store their SKU in Contentful short text fields
- Display selected variant information in the field
- Clean, user-friendly interface using Contentful's Forma 36 design system

## Prerequisites

Before installing this app, you need:

1. A BigCommerce store with API access
2. BigCommerce API credentials:
   - **Store Hash**: Found in your BigCommerce store URL (e.g., if your URL is `https://store-abc123.mybigcommerce.com`, your store hash is `abc123`)
   - **Access Token**: Generate from your BigCommerce store's API settings with at least read access to Products

### Getting BigCommerce API Credentials

1. Log in to your BigCommerce store admin
2. Go to **Settings** > **API** > **API Accounts**
3. Click **Create API Account**
4. Select **V2/V3 API Token**
5. Set OAuth Scopes:
   - **Products**: Set to **Read-only** (minimum required)
6. Save and copy your **Access Token** (you won't be able to see it again)
7. Note your **Store Hash** from the store URL

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

This will create or update your app definition in Contentful and run the app in development mode.

### 3. Configure the App in Contentful

1. Go to your Contentful space
2. Navigate to **Settings** > **Apps** > **Manage Apps**
3. Find your "BC Variant Picker" app and click **Configure**
4. Enter your BigCommerce credentials:
   - **Store Hash**: Your BigCommerce store hash
   - **Access Token**: Your BigCommerce API access token
5. Click **Save**

### 4. Add to Content Type

1. Go to **Content model** and select the content type you want to use
2. Add a new field or edit an existing **Short text** field
3. Go to the **Appearance** tab
4. Select **BC Variant Picker** from the list of apps
5. Save your content type

## Usage

### Selecting a Variant

1. Open an entry that uses the BC Variant Picker field
2. Click the **Browse Variants** button
3. A dialog will open showing all your BigCommerce products and their variants
4. Use the search box to find specific products
5. Click **Select** next to the variant you want to use
6. The variant's SKU will be saved to the field
7. The field will display the product name, variant options, and price

### Clearing a Selection

Click the **Clear** button next to the field to remove the selected variant.

## Development

### Build for Production

```bash
npm run build
```

Builds the app for production to the `build` folder.

### Upload to Contentful

```bash
npm run upload
```

Uploads the build folder to Contentful and creates a bundle that is automatically activated.

### CI Deployment

```bash
npm run upload-ci
```

For CI/CD pipelines. Requires these environment variables:

- `CONTENTFUL_ORG_ID` - Your Contentful organization ID
- `CONTENTFUL_APP_DEF_ID` - The app definition ID
- `CONTENTFUL_ACCESS_TOKEN` - A personal access token

## Project Structure

```
src/
├── components/
│   ├── VariantBrowser.tsx      # Main variant browsing UI
│   └── LocalhostWarning.tsx    # Development warning
├── locations/
│   ├── ConfigScreen.tsx         # App configuration (API credentials)
│   ├── Field.tsx                # Field editor location
│   └── Dialog.tsx               # Dialog for variant selection
├── services/
│   └── bigcommerce.ts           # BigCommerce API client
└── index.tsx                    # App entry point
```

## API Reference

### BigCommerce API

This app uses the BigCommerce V3 Catalog API to fetch products and variants:

- `GET /catalog/products` - List all products with variants
- `GET /catalog/products?keyword=search` - Search products

Required API scopes:
- Products: Read-only

## Troubleshooting

### "Please configure BigCommerce credentials"

Make sure you've entered both the Store Hash and Access Token in the app configuration screen.

### "BigCommerce API error: 401"

Your Access Token is invalid or expired. Generate a new one in BigCommerce.

### "BigCommerce API error: 403"

Your API token doesn't have the required permissions. Ensure it has at least read access to Products.

### No products showing

- Check that your BigCommerce store has products with variants
- Try searching for a specific product name
- Verify your API credentials are correct

## Technologies Used

- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Contentful App SDK](https://www.contentful.com/developers/docs/extensibility/app-framework/) - Contentful integration
- [Forma 36](https://f36.contentful.com/) - Contentful's design system
- [Vite](https://vitejs.dev/) - Build tool
- [BigCommerce V3 API](https://developer.bigcommerce.com/api-reference) - Product data

## License

This project was bootstrapped with [Create Contentful App](https://github.com/contentful/create-contentful-app).

## Learn More

- [Contentful App Framework Documentation](https://www.contentful.com/developers/docs/extensibility/app-framework/)
- [BigCommerce API Documentation](https://developer.bigcommerce.com/api-reference)
- [Forma 36 Design System](https://f36.contentful.com/)

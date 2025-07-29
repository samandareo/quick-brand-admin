const config = {
  // IMPORTANT: Update this URL to match where your backend API is actually running
  // Test the URLs below in your browser to find the correct one:
  // Option 1: Same domain with /api path
  // apiUrl: import.meta.env.VITE_BACKEND || "https://adminquickbondplush.aspshopping.com/api",
  
  // Option 2: Different subdomain
  // apiUrl: import.meta.env.VITE_BACKEND || "https://api.quickbondplush.aspshopping.com",
  
  // Option 3: Different port
  // apiUrl: import.meta.env.VITE_BACKEND || "https://adminquickbondplush.aspshopping.com:3001",
  
  // Current configuration (update this):
  apiUrl: import.meta.env.VITE_BACKEND || "https://adminquickbondplush.aspshopping.com",
};

export default config;

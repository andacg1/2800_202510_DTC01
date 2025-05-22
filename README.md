# Table of Contents
   1. Project Title
   2. Project Description
   3. Technologies used
   4. Project Structure
   5. Installation and Setup
   6. Features
   7. Credits, References, Licence
   8. AI & API Usage
   9. Contact Information

## PROJECT TITLE
Comparify



## PROJECT DESCRIPTION
A Shopify app that enables merchants to create and manage product comparison tables, helping customers make informed purchasing decisions by comparing product features, specifications, and prices side by side.



## TECHNOLOGIES USED

   ### Frontend:
   - React
     - Shopify Polaris UI Framework
     - Tailwind CSS
     - Storybook for component development
     - TypeScript
     - Vite for build tooling
   
   ### Backend:
   - Node.js
     - Remix Framework
     - Prisma ORM
     - GraphQL
     - SQLite
   
   ### Other Tech Tools:
   - Fly.io for deployment
     - ngrok for development tunneling
     - ESLint & Prettier for code formatting
     - Git for version control



## PROJECT STRUCTURE
```
product-comparison/
├── app/                # Main application code
├── frontend/           # Frontend specific code
├── prisma/             # Database schema and migrations
├── extensions/         # Shopify app extensions
├── stories/            # Storybook stories
├── public/             # Static assets
└── build/              # Build output
```



## INSTALLATION AND SETUP

   ### Prerequisites:
   1. Node.js (v18.20 or v20.10+)
   2. npm or yarn package manager
   3. Git
   4. Shopify Partner account
   5. Shopify CLI
   6. Docker (optional, for containerized deployment)
   7. ngrok (for development tunneling)
   
   ### Required Software & Tools:
   1. IDE: WebStorm (recommended) or VSCode
      2. Database: SQLite
      3. API Keys:
         - Shopify API credentials
         - OpenAI API key (for AI features)
   
   ### Installation Steps:
   1. Clone the repository:
      ```bash
      git clone [repository-url]
      cd product-comparison
      ```
   
   2. Install dependencies:
      ```bash
      npm install
      ```
   
   3. Set up environment variables:
      Create a `.env` file inside `/product-comparison/` with:
      ```
      SHOPIFY_API_KEY=your_api_key
      SHOPIFY_API_SECRET=your_api_secret
      SHOPIFY_APP_URL=your_app_url
      OPENAI_API_KEY=your_openai_key
      ```
      
   4. Initialize the database:
      ```bash
      npm run setup
      ```
   
   5. Start the development server:
      ```bash
      npm run dev
      ```

   ### Configuration:
   - Configure your Shopify app in the Shopify Partner dashboard
     - Set up your development store
     - Configure ngrok for local development
     - Set up Fly.io for deployment (optional)



## FEATURES
- Create and manage product comparison tables
- Customizable comparison attributes
- Real-time price and inventory updates
- Mobile-responsive design
- AI-powered product descriptions
- Analytics dashboard
- Bulk import/export functionality



## CREDITS, REFERENCES, LICENSE

   ### References:
   - Shopify App Bridge for integration
   - Prisma for database management
   - Remix for the web framework
   - OpenAI for AI features
   - Fly.io for hosting
   
   ### License:
   - This project is licensed under the MIT License - see the LICENSE file for details.



## AI & API USAGE
- OpenAI API: Used for generating product descriptions and comparison summaries
- Shopify Storefront API: Used for fetching product data and inventory
- Shopify Admin API: Used for managing app settings and configurations



## CONTACT INFORMATION
Team DTC-01:

| Name              | Set   | Email                |
|-------------------|-------|----------------------|
| Deniz Gunay       | Set F | dgunay@my.bcit.ca    |
| Stanislav Rudenko | Set E | srudenko@my.bcit.ca  |
| Allen Rosales     | Set F | arosales9@my.bcit.ca |
| Connor Brown      | Set F | cbrown277@my.bcit.ca |
| Brandon Berge     | Set F | bberge1@my.bcit.ca   |



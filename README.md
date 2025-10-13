# Paylo GUI

A modern React-based frontend for the Paylo cryptocurrency payment gateway system.

## Features

- **P2P Transfers**: Send and receive Bitcoin, Ethereum, and Solana
- **Merchant Dashboard**: Accept crypto payments and manage business transactions  
- **Admin Panel**: System monitoring and user management
- **Real-time Updates**: WebSocket integration for live transaction updates
- **Responsive Design**: Mobile-first approach with Material-UI

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Material-UI (MUI)** for component library and theming
- **Redux Toolkit** for state management
- **React Router** for navigation
- **ESLint & Prettier** for code quality
- **Husky** for Git hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
├── config/             # Configuration files
├── theme/              # Material-UI theme
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── services/           # API services
└── assets/             # Static assets
```

## Environment Variables

See `.env.example` for all available environment variables:

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_WS_BASE_URL` - WebSocket URL
- `VITE_APP_ENV` - Environment (development/staging/production)
- Blockchain network configurations

## Development Guidelines

- Use TypeScript for all new code
- Follow the established folder structure
- Write meaningful commit messages
- Use Material-UI components when possible
- Implement proper error handling
- Add proper TypeScript types

## Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting  
- **Husky** for pre-commit hooks
- **lint-staged** for staged file linting

Code is automatically formatted and linted on commit.

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass and code is properly formatted
4. Submit a pull request

## License

This project is proprietary and confidential.
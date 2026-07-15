# Reporead

Reporead is an intelligent, AI-powered documentation generator designed to analyze public GitHub repositories and automatically produce structured, professional README files. By leveraging advanced generative AI, it streamlines the developer experience by transforming repository metadata and codebase structure into comprehensive project documentation.

## Features

*   **Automated Analysis**: Fetches and interprets repository metadata to generate context-aware documentation.
*   **Interactive Workspace**: Features a built-in Markdown editor and real-time preview for refining generated content.
*   **Intelligent Prompting**: Utilizes specialized prompt engineering to ensure generated READMEs follow industry best practices.
*   **Responsive UI**: Built with React and Tailwind CSS for a seamless, modern user experience.
*   **Extensible Architecture**: Modular design with dedicated utilities for GitHub API integration and content storage.

## Tech Stack

*   **Framework**: Next.js, React
*   **Language**: TypeScript, JavaScript
*   **Styling**: Tailwind CSS
*   **AI Integration**: Google Generative AI SDK
*   **Testing**: Vitest
*   **Tooling**: ESLint, PostCSS

## Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (or your preferred package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/P0SSIBLE-0/reporead.git
   cd reporead
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Structure

```text
├── app/              # Next.js app router and API routes
├── components/       # Reusable UI components (Editor, Preview, Forms)
├── lib/              # Core logic, API clients, and utility functions
├── public/           # Static assets
├── vitest.config.ts  # Test configuration
└── ...
```

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint to check code quality |
| `npm run test` | Executes the test suite using Vitest |

## Environment Variables

To run this project, you will need to configure your environment variables. Create a `.env.local` file in the root directory and add the necessary API keys required by the application (e.g., Google GenAI API keys).

## License

This project is provided as-is. Please check the repository for any specific license files or contact the maintainers for usage permissions.

## Homepage

Visit the live application at [https://reporead-liard.vercel.app](https://reporead-liard.vercel.app).
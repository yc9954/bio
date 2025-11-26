# Bioinformatics Data Portal

This is a code bundle for Bioinformatics Data Portal. The original project is available at https://www.figma.com/design/hWoPsU6kXaEkSIv4RZ2V2C/Bioinformatics-Data-Portal.

## Setup

### Backend Server

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

The backend server will run on http://localhost:3001

### Frontend

1. In the root directory, install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3000

## Features

- **Unified Search**: Search across multiple bioinformatics databases (GEO, SRA, ENA, BioProject)
- **Advanced Filtering**: Filter by organism, experiment type, platform, year, author, journal, and more
- **AI Assistant**: Get AI-powered summaries and recommendations
- **Study Details**: View detailed information about studies including samples and files
- **Export**: Download search results in CSV or JSON format

## API Documentation

See [server/README.md](server/README.md) for detailed API documentation.

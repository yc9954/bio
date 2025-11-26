# Bioinformatics Data Portal - Backend Server

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will run on http://localhost:3001

## API Endpoints

### GET /api/studies
Search and filter studies.

Query parameters:
- `q` - Search query
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `sort` - Sort order: `relevant`, `recent`, or `samples`
- `organisms` - Filter by organisms (array)
- `expTypes` - Filter by experiment types (array)
- `platforms` - Filter by platforms (array)
- `yearMin` - Minimum year
- `yearMax` - Maximum year
- `author` - Filter by author
- `journal` - Filter by journal
- `studyTypes` - Filter by study types (array)

### GET /api/studies/:id
Get detailed information about a specific study.

### GET /api/studies/:id/samples
Get samples for a specific study.

### GET /api/studies/:id/files
Get files for a specific study.

### POST /api/assistant/chat
Chat with the AI assistant.

Body:
```json
{
  "message": "Your question",
  "contextStudy": "GSE123456" // optional
}
```

### GET /api/assistant/recommendations
Get AI recommendations.

Query parameters:
- `studyId` - Optional study ID for context-specific recommendations

### POST /api/export
Export studies to CSV or JSON.

Body:
```json
{
  "studyIds": ["GSE123456", "GSE98765"],
  "columns": ["id", "title", "organism"],
  "format": "csv" // or "json"
}
```

### GET /api/filters/options
Get available filter options (organisms, experiment types, platforms, etc.)


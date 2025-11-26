import express from 'express';
import cors from 'cors';
import { studies, getSampleData, getFileData } from './data/studies.js';
import { searchNCBI, getNCBIStudyDetail, getNCBISamples } from './services/ncbi.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper function to filter studies
function filterStudies(studies, filters) {
  let filtered = [...studies];

  if (filters.organisms && filters.organisms.length > 0) {
    filtered = filtered.filter(s => filters.organisms.includes(s.organism));
  }

  if (filters.expTypes && filters.expTypes.length > 0) {
    filtered = filtered.filter(s => filters.expTypes.includes(s.expType));
  }

  if (filters.platforms && filters.platforms.length > 0) {
    filtered = filtered.filter(s => filters.platforms.includes(s.platform));
  }

  if (filters.yearRange && filters.yearRange.length === 2) {
    const [minYear, maxYear] = filters.yearRange;
    filtered = filtered.filter(s => s.year >= minYear && s.year <= maxYear);
  }

  if (filters.author) {
    const authorLower = filters.author.toLowerCase();
    filtered = filtered.filter(s => 
      s.submitter.toLowerCase().includes(authorLower) ||
      s.authors.some(a => a.toLowerCase().includes(authorLower))
    );
  }

  if (filters.journal) {
    const journalLower = filters.journal.toLowerCase();
    filtered = filtered.filter(s => 
      s.journal.toLowerCase().includes(journalLower)
    );
  }

  if (filters.studyTypes && filters.studyTypes.length > 0) {
    filtered = filtered.filter(s => filters.studyTypes.includes(s.studyType));
  }

  return filtered;
}

// Helper function to search studies
function searchStudies(studies, query) {
  if (!query || query.trim() === '') return studies;

  const queryLower = query.toLowerCase();
  return studies.filter(study => {
    return (
      study.id.toLowerCase().includes(queryLower) ||
      study.title.toLowerCase().includes(queryLower) ||
      study.abstract.toLowerCase().includes(queryLower) ||
      study.organism.toLowerCase().includes(queryLower) ||
      study.expType.toLowerCase().includes(queryLower) ||
      study.disease?.toLowerCase().includes(queryLower) ||
      study.tissue.toLowerCase().includes(queryLower) ||
      study.submitter.toLowerCase().includes(queryLower) ||
      study.journal.toLowerCase().includes(queryLower) ||
      study.authors.some(a => a.toLowerCase().includes(queryLower))
    );
  });
}

// Helper function to sort studies
function sortStudies(studies, sortBy) {
  const sorted = [...studies];
  
  switch (sortBy) {
    case 'recent':
      return sorted.sort((a, b) => b.year - a.year);
    case 'samples':
      return sorted.sort((a, b) => b.samples - a.samples);
    case 'relevant':
    default:
      // Keep original order for relevance (could be improved with scoring)
      return sorted;
  }
}

// GET /api/studies - Search and filter studies
app.get('/api/studies', async (req, res) => {
  try {
    const { 
      q, // search query
      page = 1,
      limit = 10,
      sort = 'relevant',
      organisms,
      expTypes,
      platforms,
      yearMin,
      yearMax,
      author,
      journal,
      studyTypes,
      useNCBI = 'true' // Always use NCBI API - no local data
    } = req.query;

    let filtered = [];

    // Always use NCBI API - require search query
    if (!q || !q.trim()) {
      return res.json({
        studies: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0
      });
    }

    try {
      // Search multiple NCBI databases and combine results
      const databases = ['gds', 'sra']; // GEO Datasets and SRA
      const allResults = [];
      
      for (const db of databases) {
        try {
          // Get more results for filtering (multiply by 5 to get enough data)
          const ncbiResults = await searchNCBI(q, db, parseInt(limit) * 5);
          if (ncbiResults.studies && ncbiResults.studies.length > 0) {
            allResults.push(...ncbiResults.studies);
          }
        } catch (dbError) {
          console.error(`NCBI API error for ${db}:`, dbError);
          // Continue with other databases
        }
      }

      // Remove duplicates based on ID
      const uniqueResults = [];
      const seenIds = new Set();
      for (const study of allResults) {
        if (!seenIds.has(study.id)) {
          seenIds.add(study.id);
          uniqueResults.push(study);
        }
      }

      filtered = uniqueResults;
    } catch (ncbiError) {
      console.error('NCBI API error:', ncbiError);
      // Return empty results instead of local data
      return res.json({
        studies: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0
      });
    }

    // Build filters object
    const filters = {};
    if (organisms) filters.organisms = Array.isArray(organisms) ? organisms : [organisms];
    if (expTypes) filters.expTypes = Array.isArray(expTypes) ? expTypes : [expTypes];
    if (platforms) filters.platforms = Array.isArray(platforms) ? platforms : [platforms];
    if (yearMin || yearMax) {
      filters.yearRange = [
        yearMin ? parseInt(yearMin) : 2005,
        yearMax ? parseInt(yearMax) : 2025
      ];
    }
    if (author) filters.author = author;
    if (journal) filters.journal = journal;
    if (studyTypes) filters.studyTypes = Array.isArray(studyTypes) ? studyTypes : [studyTypes];

    // Apply filters
    filtered = filterStudies(filtered, filters);

    // Sort
    filtered = sortStudies(filtered, sort);

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginated = filtered.slice(startIndex, endIndex);

    res.json({
      studies: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum)
    });
  } catch (error) {
    console.error('Error fetching studies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/studies/:id - Get study details
app.get('/api/studies/:id', async (req, res) => {
  try {
    const { useNCBI = 'true' } = req.query;
    let study = null;
    
    // Always try NCBI first
    if (useNCBI === 'true') {
      try {
        study = await getNCBIStudyDetail(req.params.id, 'gds');
      } catch (ncbiError) {
        console.error('NCBI API error:', ncbiError);
      }
    }
    
    // If NCBI fails, don't fall back to local data
    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    // Similar studies would require additional NCBI API calls
    // For now, return empty array since we don't have local data
    const similarStudies = [];

    res.json({
      ...study,
      similarStudies: similarStudies
    });
  } catch (error) {
    console.error('Error fetching study:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/studies/:id/samples - Get samples for a study
app.get('/api/studies/:id/samples', async (req, res) => {
  try {
    // Fetch samples from NCBI
    let samples = [];
    try {
      samples = await getNCBISamples(req.params.id);
    } catch (error) {
      console.error('Error fetching samples from NCBI:', error);
    }

    res.json({ samples });
  } catch (error) {
    console.error('Error fetching samples:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/studies/:id/files - Get files for a study
app.get('/api/studies/:id/files', async (req, res) => {
  try {
    // Try to get study from NCBI first
    let study = null;
    try {
      study = await getNCBIStudyDetail(req.params.id, 'gds');
    } catch (error) {
      console.error('Error fetching study from NCBI:', error);
    }
    
    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    // For now, return empty files array
    // In production, this would fetch actual file data from NCBI
    res.json({ files: [] });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/assistant/chat - AI Assistant chat
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, contextStudy } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Mock AI response (in production, this would call an actual LLM)
    let response = "I'm here to help you understand studies and find relevant datasets. ";

    if (contextStudy) {
      // Try to get study from NCBI
      try {
        const study = await getNCBIStudyDetail(contextStudy, 'gds');
        if (study) {
          response = `Based on the study ${study.id} (${study.title}), `;
          
          if (message.toLowerCase().includes('explain') || message.toLowerCase().includes('what')) {
            response += `this study investigates ${study.disease || study.tissue} using ${study.expType}. `;
            response += `The researchers analyzed ${study.samples} samples and found key insights about ${study.abstract.substring(0, 100)}...`;
          } else if (message.toLowerCase().includes('findings') || message.toLowerCase().includes('key')) {
            response += `key findings include significant changes in gene expression patterns related to ${study.disease || study.tissue}. `;
            response += `The study used ${study.platform} platform and identified potential therapeutic targets.`;
          } else if (message.toLowerCase().includes('similar') || message.toLowerCase().includes('related')) {
            response += `I can help you find similar studies. Try searching for related terms in the search bar.`;
          } else {
            response += `this study focuses on ${study.abstract.substring(0, 150)}...`;
          }
        }
      } catch (error) {
        console.error('Error fetching study for assistant:', error);
      }
    } else {
      if (message.toLowerCase().includes('breast cancer')) {
        response += "I found several breast cancer studies. GSE123456 focuses on hypoxic conditions in breast cancer cell lines, while GSE9876 analyzes triple-negative breast cancer patient samples.";
      } else if (message.toLowerCase().includes('rna-seq')) {
        response += "There are multiple RNA-seq studies available. GSE123456 profiles breast cancer cell lines, GSE98765 uses single-cell RNA-seq for colorectal cancer, and GSE43210 analyzes C. elegans response to stress.";
      } else if (message.toLowerCase().includes('similar') || message.toLowerCase().includes('suggest')) {
        response += "Based on your search, I recommend checking out GSE123456 for breast cancer studies, GSE98765 for single-cell analysis, or GSE87654 for epigenetic studies.";
      } else {
        response += "I can help you search for studies, explain research findings, or suggest similar datasets. What would you like to know?";
      }
    }

    // Simulate some delay
    setTimeout(() => {
      res.json({ response });
    }, 500);
  } catch (error) {
    console.error('Error in assistant chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/assistant/recommendations - Get AI recommendations
app.get('/api/assistant/recommendations', async (req, res) => {
  try {
    const { studyId } = req.query;
    
    let recommendations = [];
    
    if (studyId) {
      // Try to get similar studies from NCBI
      // For now, return empty array - would need additional NCBI API calls
      try {
        const study = await getNCBIStudyDetail(studyId, 'gds');
        if (study) {
          // Could search for similar studies based on keywords
          // For now, return empty
        }
      } catch (error) {
        console.error('Error fetching study for recommendations:', error);
      }
    } else {
      // General recommendations - would need to search NCBI
      // For now, return empty array
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/export - Export studies
app.post('/api/export', (req, res) => {
  try {
    const { studyIds, columns, format = 'csv' } = req.body;

    // If no studyIds provided, export all studies
    const selectedStudies = studyIds && studyIds.length > 0
      ? studies.filter(s => studyIds.includes(s.id))
      : studies;
    
    if (format === 'json') {
      const data = selectedStudies.map(study => {
        const row = {};
        columns.forEach(col => {
          row[col] = study[col] || '';
        });
        return row;
      });
      
      res.json({ data, format: 'json' });
    } else {
      // CSV format
      const headers = columns.join(',');
      const rows = selectedStudies.map(study => {
        return columns.map(col => {
          const value = study[col] || '';
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',');
      });
      
      const csv = [headers, ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=bioscope_export_${Date.now()}.csv`);
      res.send(csv);
    }
  } catch (error) {
    console.error('Error exporting studies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/filters/options - Get filter options
app.get('/api/filters/options', (req, res) => {
  try {
    const organisms = [...new Set(studies.map(s => s.organism))].sort();
    const expTypes = [...new Set(studies.map(s => s.expType))].sort();
    const platforms = [...new Set(studies.map(s => s.platform))].sort();
    const years = [...new Set(studies.map(s => s.year))].sort((a, b) => b - a);
    const studyTypes = [...new Set(studies.map(s => s.studyType))].sort();

    res.json({
      organisms,
      expTypes,
      platforms,
      years: {
        min: Math.min(...years),
        max: Math.max(...years)
      },
      studyTypes
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});


import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { gemini } from "./services/geminiClient.js";
import { searchNCBI, getNCBIStudyDetail, getNCBISamples } from './services/ncbi.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Bioinformatics Data Portal API',
    version: '1.0.0',
    endpoints: {
      studies: '/api/studies',
      studyDetail: '/api/studies/:id',
      samples: '/api/studies/:id/samples',
      files: '/api/studies/:id/files',
      filters: '/api/filters/options',
      assistant: '/api/assistant/chat',
      recommendations: '/api/assistant/recommendations'
    }
  });
});

// Helper function to filter studies
function filterStudies(studies, filters) {
  let filtered = [...studies];

  if (filters.organisms && filters.organisms.length > 0) {
    filtered = filtered.filter(s => s.organism && filters.organisms.includes(s.organism));
  }

  if (filters.expTypes && filters.expTypes.length > 0) {
    filtered = filtered.filter(s => s.expType && filters.expTypes.includes(s.expType));
  }

  if (filters.platforms && filters.platforms.length > 0) {
    filtered = filtered.filter(s => s.platform && filters.platforms.includes(s.platform));
  }

  if (filters.yearRange && filters.yearRange.length === 2) {
    const [minYear, maxYear] = filters.yearRange;
    filtered = filtered.filter(s => s.year >= minYear && s.year <= maxYear);
  }

  if (filters.author) {
    const authorLower = filters.author.toLowerCase();
    filtered = filtered.filter(s => {
      const submitterMatch = s.submitter && s.submitter.toLowerCase().includes(authorLower);
      const authorsMatch = s.authors && s.authors.some(a => a.toLowerCase().includes(authorLower));
      return submitterMatch || authorsMatch;
    });
  }

  if (filters.journal) {
    const journalLower = filters.journal.toLowerCase();
    filtered = filtered.filter(s => s.journal && s.journal.toLowerCase().includes(journalLower));
  }

  if (filters.studyTypes && filters.studyTypes.length > 0) {
    filtered = filtered.filter(s => s.studyType && filters.studyTypes.includes(s.studyType));
  }

  return filtered;
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
      studyTypes
    } = req.query;

    let searchQuery = q?.trim();

    // 자연어 쿼리 > Gemini
    if (searchQuery && searchQuery.length > 3) {
      try {
        console.log("원본 쿼리:", searchQuery);
        const enhanced = await enhanceQueryWithGemini(searchQuery);
        if (enhanced && enhanced.trim() && enhanced !== searchQuery) {
          searchQuery = enhanced;
          console.log("Gemini 변환 쿼리:", searchQuery);
        }
      } catch (geminiError) {
        console.warn("Gemini 변환 실패 → 원본 쿼리 사용:", geminiError.message);
      }
    }

    let filtered = [];

    // Always use NCBI API - require search query
    if (!searchQuery) {
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
          const ncbiResults = await searchNCBI(searchQuery, db, parseInt(limit) * 5);
          if (ncbiResults.studies && ncbiResults.studies.length > 0) {
            allResults.push(...ncbiResults.studies);
          }
        } catch (dbError) {
          console.error(`NCBI API error for ${db}:`, dbError);
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
    let study = null;

    try {
      study = await getNCBIStudyDetail(req.params.id, 'gds');
    } catch (ncbiError) {
      console.error('NCBI API error:', ncbiError);
    }

    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }

    res.json({
      ...study,
      similarStudies: []
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
    // Return empty files array - file data not available from NCBI E-utilities
    res.json({ files: [] });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/assistant/chat - AI Assistant chat
app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, contextStudy } = req.body; // contextStudy is likely the ID (e.g., GSE12345)

    if (!message?.trim()) {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    let studyData = null;

    // Fetch study data HERE, not inside the AI class
    if (contextStudy) {
      try {
         // Assuming this function exists in your code
         studyData = await getNCBIStudyDetail(contextStudy, 'gds'); 
      } catch (err) {
         console.warn("Failed to fetch context study for chat:", err.message);
         // We continue without context rather than failing the chat
      }
    }

    // Pass the actual object, not the ID
    const response = await gemini.chat(message, studyData);

    res.json({ 
      response: response.trim(),
      model: "gemini-1.5-flash"
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      error: 'AI 응답 생성 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

// GET /api/assistant/recommendations - Get AI recommendations
app.get('/api/assistant/recommendations', async (req, res) => {
  try {
    const { studyId, query } = req.query;
    let contextStudy = null;

    // 1. studyId가 있으면 DB/API에서 정보만 가져옴 (프롬프트 생성은 안 함)
    if (studyId) {
      try {
        contextStudy = await getNCBIStudyDetail(studyId, 'gds');
      } catch (err) {
        console.log(`Study ID ${studyId} not found, proceeding with query only.`);
      }
    }

    // 2. Gemini에게 데이터(query, contextStudy)만 던짐
    const result = await gemini.recommend({ query, contextStudy });

    // 3. 결과 바로 반환
    res.json(result);

  } catch (error) {
    console.error('Recommendation Controller Error:', error);
    res.status(500).json({ 
      error: '추천 정보를 가져오는 중 오류가 발생했습니다.',
      recommendations: [] 
    });
  }
});

// POST /api/export - Export studies (removed - client-side export only)

// GET /api/filters/options - Get filter options
app.get('/api/filters/options', (req, res) => {
  try {
    // Return common filter options (can be extended based on NCBI data)
    res.json({
      organisms: [
        'Homo sapiens',
        'Mus musculus',
        'Rattus norvegicus',
        'Drosophila melanogaster',
        'Caenorhabditis elegans',
        'Saccharomyces cerevisiae',
        'Arabidopsis thaliana',
        'Danio rerio',
        'Escherichia coli'
      ],
      expTypes: [
        'RNA-seq',
        'scRNA-seq',
        'ChIP-seq',
        'ATAC-seq',
        'WGS',
        'Exome-seq',
        'Methylation',
        'Microarray',
        'Proteomics',
        'Metagenomics'
      ],
      platforms: [
        'Illumina',
        'Illumina HiSeq',
        'Illumina NextSeq',
        'Illumina NovaSeq',
        'Illumina MiSeq',
        'PacBio',
        'Oxford Nanopore',
        'Ion Torrent'
      ],
      years: {
        min: 2005,
        max: new Date().getFullYear()
      },
      studyTypes: [
        'In vivo',
        'In vitro',
        'In silico'
      ]
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});


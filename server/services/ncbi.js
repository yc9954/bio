// NCBI API Service
// Using Entrez E-utilities API

const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * Search NCBI databases (GEO, SRA, etc.)
 */
export async function searchNCBI(query, database = 'gds', retmax = 20) {
  try {
    console.log(`Searching NCBI ${database} for: ${query}, max results: ${retmax}`);
    
    // Step 1: ESearch - Search for IDs
    // Increase retmax to get more results
    const esearchUrl = `${NCBI_BASE_URL}/esearch.fcgi?db=${database}&term=${encodeURIComponent(query)}&retmax=${Math.min(retmax, 10000)}&retmode=json&usehistory=y`;
    
    const esearchResponse = await fetch(esearchUrl);
    if (!esearchResponse.ok) {
      throw new Error(`NCBI API error: ${esearchResponse.status}`);
    }
    
    const esearchData = await esearchResponse.json();
    
    if (!esearchData.esearchresult || !esearchData.esearchresult.idlist) {
      console.log('No results from NCBI');
      return { studies: [], total: 0 };
    }

    const ids = esearchData.esearchresult.idlist;
    const total = parseInt(esearchData.esearchresult.count) || 0;

    console.log(`Found ${ids.length} IDs, total available: ${total}`);

    if (ids.length === 0) {
      return { studies: [], total: 0 };
    }

    // Step 2: ESummary - Get summaries for the IDs
    // NCBI allows max 500 IDs per request, so we need to batch
    const batchSize = 500;
    const allStudies = [];
    
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const idString = batch.join(',');
      const esummaryUrl = `${NCBI_BASE_URL}/esummary.fcgi?db=${database}&id=${idString}&retmode=json`;
      
      const esummaryResponse = await fetch(esummaryUrl);
      if (!esummaryResponse.ok) {
        console.error(`NCBI ESummary error for batch ${i}: ${esummaryResponse.status}`);
        continue;
      }
      
      const esummaryData = await esummaryResponse.json();
      const batchStudies = transformNCBIResults(esummaryData, database);
      allStudies.push(...batchStudies);
    }

    console.log(`Transformed ${allStudies.length} studies from NCBI`);
    return { studies: allStudies, total };
  } catch (error) {
    console.error('NCBI API Error:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific study
 */
export async function getNCBIStudyDetail(accessionId, database = 'gds') {
  try {
    // First, search for the accession ID
    const searchUrl = `${NCBI_BASE_URL}/esearch.fcgi?db=${database}&term=${encodeURIComponent(accessionId)}&retmode=json`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.esearchresult || !searchData.esearchresult.idlist || searchData.esearchresult.idlist.length === 0) {
      return null;
    }

    const id = searchData.esearchresult.idlist[0];
    
    // Get detailed summary
    const summaryUrl = `${NCBI_BASE_URL}/esummary.fcgi?db=${database}&id=${id}&retmode=json`;
    const summaryResponse = await fetch(summaryUrl);
    const summaryData = await summaryResponse.json();

    return transformNCBIStudyDetail(summaryData, database, accessionId);
  } catch (error) {
    console.error('NCBI API Error:', error);
    throw error;
  }
}

/**
 * Transform NCBI GEO/SRA results to our format
 */
function transformNCBIResults(data, database) {
  const results = [];
  
  if (!data.result || !data.result.uids) {
    return results;
  }

  const uids = data.result.uids;
  
  for (const uid of uids) {
    const item = data.result[uid];
    if (!item) continue;

    const study = {
      id: item.accession || item.ids?.accession || `GSE${uid}`,
      title: item.title || item.summary || 'No title available',
      abstract: item.summary || item.title || 'No abstract available',
      organism: extractOrganism(item),
      expType: extractExpType(item),
      platform: extractPlatform(item),
      year: extractYear(item),
      samples: parseInt(item.samples || item.sample_count || '0') || 0,
      disease: extractDisease(item),
      tissue: extractTissue(item),
      conditions: extractConditions(item),
      instrument: extractInstrument(item),
      libraryStrategy: extractLibraryStrategy(item),
      submitter: extractSubmitter(item),
      journal: extractJournal(item),
      authors: extractAuthors(item),
      studyType: extractStudyType(item),
      accession: item.accession || item.ids?.accession,
      geoAccession: database === 'gds' ? (item.accession || item.ids?.accession) : null,
      sraAccession: database === 'sra' ? (item.accession || item.ids?.accession) : null,
    };

    results.push(study);
  }

  return results;
}

/**
 * Transform NCBI study detail
 */
function transformNCBIStudyDetail(data, database, accessionId) {
  if (!data.result || !data.result.uids || data.result.uids.length === 0) {
    return null;
  }

  const uid = data.result.uids[0];
  const item = data.result[uid];
  if (!item) return null;

  return {
    id: accessionId || item.accession || item.ids?.accession || `GSE${uid}`,
    title: item.title || item.summary || 'No title available',
    abstract: item.summary || item.title || 'No abstract available',
    organism: extractOrganism(item),
    expType: extractExpType(item),
    platform: extractPlatform(item),
    year: extractYear(item),
    samples: parseInt(item.samples || item.sample_count || '0') || 0,
    disease: extractDisease(item),
    tissue: extractTissue(item),
    conditions: extractConditions(item),
    replicates: extractReplicates(item),
    instrument: extractInstrument(item),
    libraryStrategy: extractLibraryStrategy(item),
    submitter: extractSubmitter(item),
    journal: extractJournal(item),
    authors: extractAuthors(item),
    studyType: extractStudyType(item),
    accession: item.accession || item.ids?.accession,
    geoAccession: database === 'gds' ? (item.accession || item.ids?.accession) : null,
    sraAccession: database === 'sra' ? (item.accession || item.ids?.accession) : null,
    similarStudies: [], // Would need additional API call
  };
}

// Helper functions to extract data from NCBI response
function extractOrganism(item) {
  return item.organism || item.taxonomy || 'Unknown';
}

function extractExpType(item) {
  const type = item.type || item.experiment_type || '';
  if (type.toLowerCase().includes('rna')) return 'RNA-seq';
  if (type.toLowerCase().includes('chip')) return 'ChIP-seq';
  if (type.toLowerCase().includes('atac')) return 'ATAC-seq';
  if (type.toLowerCase().includes('single')) return 'scRNA-seq';
  if (type.toLowerCase().includes('wgs') || type.toLowerCase().includes('whole genome')) return 'WGS';
  if (type.toLowerCase().includes('exome')) return 'Exome-seq';
  return type || 'Unknown';
}

function extractPlatform(item) {
  return item.platform || item.instrument || 'Unknown';
}

function extractYear(item) {
  const pubDate = item.pubdate || item.release_date || '';
  const yearMatch = pubDate.match(/\d{4}/);
  return yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
}

function extractDisease(item) {
  return item.disease || item.condition || null;
}

function extractTissue(item) {
  return item.tissue || item.source || item.sample_type || 'Unknown';
}

function extractConditions(item) {
  return item.condition || item.treatment || null;
}

function extractReplicates(item) {
  return parseInt(item.replicates || item.replicate_count || '0') || 0;
}

function extractInstrument(item) {
  return item.instrument || item.platform || 'Unknown';
}

function extractLibraryStrategy(item) {
  return item.library_strategy || item.strategy || 'Unknown';
}

function extractSubmitter(item) {
  return item.submitter || item.contact || item.author || 'Unknown';
}

function extractJournal(item) {
  return item.journal || item.publication || null;
}

function extractAuthors(item) {
  if (item.authors) {
    return Array.isArray(item.authors) ? item.authors : item.authors.split(',').map(a => a.trim());
  }
  if (item.author) {
    return item.author.split(',').map(a => a.trim());
  }
  return [];
}

function extractStudyType(item) {
  const type = item.study_type || '';
  if (type.toLowerCase().includes('in vivo')) return 'In vivo';
  if (type.toLowerCase().includes('in vitro')) return 'In vitro';
  if (type.toLowerCase().includes('in silico')) return 'In silico';
  return null;
}


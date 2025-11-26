// NCBI API Service
// Using Entrez E-utilities API

const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Helper function to fetch with retry logic
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      if (response.status === 429) {
        // Rate limit - wait longer
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1) * 2));
        continue;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Search NCBI databases (GEO, SRA, etc.)
 */
export async function searchNCBI(query, database = 'gds', retmax = 20) {
  try {
    console.log(`Searching NCBI ${database} for: ${query}, max results: ${retmax}`);

    // Step 1: ESearch - Search for IDs
    // Increase retmax to get more results
    const esearchUrl = `${NCBI_BASE_URL}/esearch.fcgi?db=${database}&term=${encodeURIComponent(query)}&retmax=${Math.min(retmax, 10000)}&retmode=json&usehistory=y`;

    const esearchResponse = await fetchWithRetry(esearchUrl);
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

      try {
        const esummaryResponse = await fetchWithRetry(esummaryUrl);
        const esummaryData = await esummaryResponse.json();
        const batchStudies = transformNCBIResults(esummaryData, database);
        allStudies.push(...batchStudies);

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < ids.length) {
          await new Promise(resolve => setTimeout(resolve, 334)); // ~3 requests per second
        }
      } catch (error) {
        console.error(`NCBI ESummary error for batch ${i}:`, error);
        continue;
      }
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
    const searchResponse = await fetchWithRetry(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.esearchresult || !searchData.esearchresult.idlist || searchData.esearchresult.idlist.length === 0) {
      return null;
    }

    const id = searchData.esearchresult.idlist[0];

    // Get detailed summary
    const summaryUrl = `${NCBI_BASE_URL}/esummary.fcgi?db=${database}&id=${id}&retmode=json`;
    const summaryResponse = await fetchWithRetry(summaryUrl);
    const summaryData = await summaryResponse.json();

    return transformNCBIStudyDetail(summaryData, database, accessionId);
  } catch (error) {
    console.error('NCBI API Error:', error);
    throw error;
  }
}

/**
 * Get samples for a GEO study
 */
export async function getNCBISamples(accessionId) {
  try {
    console.log(`Fetching samples for ${accessionId}`);

    // Search for GSM (GEO Sample) records linked to this GSE
    const searchUrl = `${NCBI_BASE_URL}/esearch.fcgi?db=gds&term=${encodeURIComponent(accessionId)}[Accession]&retmode=json`;
    const searchResponse = await fetchWithRetry(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.esearchresult || !searchData.esearchresult.idlist || searchData.esearchresult.idlist.length === 0) {
      return [];
    }

    const id = searchData.esearchresult.idlist[0];

    // Get the full record to find sample IDs
    const summaryUrl = `${NCBI_BASE_URL}/esummary.fcgi?db=gds&id=${id}&retmode=json`;
    const summaryResponse = await fetchWithRetry(summaryUrl);
    const summaryData = await summaryResponse.json();

    // Extract sample information from the summary
    const samples = [];
    if (summaryData.result && summaryData.result[id]) {
      const record = summaryData.result[id];

      // Try to extract samples from the record
      // GEO datasets have sample information in various fields
      if (record.samples) {
        const sampleList = Array.isArray(record.samples) ? record.samples : [record.samples];
        for (let i = 0; i < sampleList.length; i++) {
          const sample = sampleList[i];
          samples.push({
            id: sample.accession || `Sample ${i + 1}`,
            condition: sample.title || sample.description || 'N/A',
            tissue: sample.source || extractTissue(record),
            reads: 'N/A',
            size: 'N/A'
          });
        }
      }

      // If no samples found, create placeholder samples
      if (samples.length === 0 && record.n_samples) {
        const numSamples = parseInt(record.n_samples) || 0;
        for (let i = 0; i < Math.min(numSamples, 10); i++) {
          samples.push({
            id: `Sample ${i + 1}`,
            condition: 'N/A',
            tissue: extractTissue(record),
            reads: 'N/A',
            size: 'N/A'
          });
        }
      }
    }

    console.log(`Found ${samples.length} samples for ${accessionId}`);
    return samples;
  } catch (error) {
    console.error('Error fetching NCBI samples:', error);
    return [];
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

    // Extract more detailed information based on database type
    const accession = item.accession || item.ids?.accession || (database === 'gds' ? `GDS${uid}` : `SRA${uid}`);

    const study = {
      id: accession,
      title: item.title || item.caption || item.summary || 'No title available',
      abstract: item.summary || item.description || item.title || 'No abstract available',
      organism: extractOrganism(item),
      expType: extractExpType(item),
      platform: extractPlatform(item),
      year: extractYear(item),
      samples: extractSampleCount(item),
      disease: extractDisease(item),
      tissue: extractTissue(item),
      conditions: extractConditions(item),
      instrument: extractInstrument(item),
      libraryStrategy: extractLibraryStrategy(item),
      submitter: extractSubmitter(item),
      journal: extractJournal(item),
      authors: extractAuthors(item),
      studyType: extractStudyType(item),
      accession: accession,
      geoAccession: database === 'gds' ? accession : (item.geo_accession || null),
      sraAccession: database === 'sra' ? accession : (item.sra_accession || null),
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
  // Try multiple fields for organism information
  if (item.organism) return item.organism;
  if (item.taxon) return item.taxon;

  // Parse from ExtRelations or other metadata
  if (item.extrelations && Array.isArray(item.extrelations)) {
    for (const rel of item.extrelations) {
      if (rel.relationtype === 'Taxonomy' && rel.targetobject) {
        return rel.targetobject;
      }
    }
  }

  // Try to extract from summary or title
  const text = (item.summary || item.title || '').toLowerCase();
  const organisms = ['homo sapiens', 'mus musculus', 'rattus norvegicus', 'drosophila melanogaster',
                    'caenorhabditis elegans', 'saccharomyces cerevisiae', 'arabidopsis thaliana',
                    'danio rerio', 'escherichia coli'];

  for (const org of organisms) {
    if (text.includes(org)) {
      return org.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  return item.taxonomy || 'Unknown';
}

function extractExpType(item) {
  const type = item.type || item.experiment_type || item.entrytype || '';
  const summary = (item.summary || item.title || '').toLowerCase();

  // Check both type field and summary text
  const combined = (type + ' ' + summary).toLowerCase();

  if (combined.includes('single-cell') || combined.includes('scrna') || combined.includes('single cell rna')) return 'scRNA-seq';
  if (combined.includes('rna-seq') || combined.includes('rna seq') || combined.includes('transcriptome')) return 'RNA-seq';
  if (combined.includes('chip-seq') || combined.includes('chip seq') || combined.includes('chromatin immunoprecipitation')) return 'ChIP-seq';
  if (combined.includes('atac-seq') || combined.includes('atac seq')) return 'ATAC-seq';
  if (combined.includes('wgs') || combined.includes('whole genome sequencing')) return 'WGS';
  if (combined.includes('exome') || combined.includes('whole exome')) return 'Exome-seq';
  if (combined.includes('methylation') || combined.includes('bisulfite')) return 'Methylation';
  if (combined.includes('microarray') || combined.includes('expression profiling by array')) return 'Microarray';
  if (combined.includes('proteom')) return 'Proteomics';
  if (combined.includes('metagenom')) return 'Metagenomics';

  return type || 'Unknown';
}

function extractPlatform(item) {
  // Try multiple platform fields
  const platform = item.platform || item.gpl || item.instrument_model || item.platform_title || '';

  // Common platform mappings
  if (platform.toLowerCase().includes('illumina')) {
    if (platform.includes('HiSeq')) return 'Illumina HiSeq';
    if (platform.includes('NextSeq')) return 'Illumina NextSeq';
    if (platform.includes('NovaSeq')) return 'Illumina NovaSeq';
    if (platform.includes('MiSeq')) return 'Illumina MiSeq';
    return 'Illumina';
  }
  if (platform.toLowerCase().includes('pacbio')) return 'PacBio';
  if (platform.toLowerCase().includes('oxford') || platform.toLowerCase().includes('nanopore')) return 'Oxford Nanopore';
  if (platform.toLowerCase().includes('ion torrent')) return 'Ion Torrent';
  if (platform.toLowerCase().includes('454')) return 'Roche 454';

  return platform || 'Unknown';
}

function extractYear(item) {
  // Try multiple date fields
  const pubDate = item.pubdate || item.pdat || item.release_date || item.createdate || item.updatedate || '';
  const yearMatch = pubDate.match(/\d{4}/);
  return yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
}

function extractSampleCount(item) {
  // Try multiple sample count fields
  const count = item.n_samples || item.samples || item.sample_count || item.samplecount || '0';
  return parseInt(count) || 0;
}

function extractDisease(item) {
  // Try multiple disease/condition fields
  if (item.disease) return item.disease;

  // Check in summary or description
  const text = (item.summary || item.description || '').toLowerCase();
  const diseases = ['cancer', 'alzheimer', 'diabetes', 'covid', 'tumor', 'carcinoma',
                   'leukemia', 'lymphoma', 'disease', 'infection', 'inflammation'];

  for (const disease of diseases) {
    if (text.includes(disease)) {
      // Extract context around the disease mention
      const idx = text.indexOf(disease);
      const context = text.substring(Math.max(0, idx - 20), Math.min(text.length, idx + 50));
      return context.trim();
    }
  }

  return item.condition || null;
}

function extractTissue(item) {
  // Try multiple tissue/source fields
  if (item.tissue) return item.tissue;
  if (item.source_name) return item.source_name;
  if (item.biosource) return item.biosource;

  // Common tissue types to look for
  const text = (item.summary || item.title || '').toLowerCase();
  const tissues = ['brain', 'liver', 'kidney', 'heart', 'lung', 'blood', 'muscle',
                  'skin', 'bone', 'pancreas', 'spleen', 'thymus', 'lymph node',
                  'cell line', 'pbmc', 'fibroblast', 'neuron'];

  for (const tissue of tissues) {
    if (text.includes(tissue)) {
      return tissue.charAt(0).toUpperCase() + tissue.slice(1);
    }
  }

  return item.sample_type || 'Unknown';
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


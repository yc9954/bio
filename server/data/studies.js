// Sample studies data
export const studies = [
  {
    id: "GSE123456",
    title: "Transcriptomic profiling of breast cancer cell lines under hypoxic conditions reveals novel therapeutic targets",
    abstract: "Hypoxia is a critical factor in tumor progression and therapeutic resistance. We performed RNA-seq analysis on MCF-7 and MDA-MB-231 breast cancer cell lines under normoxic and hypoxic conditions to identify differentially expressed genes and pathways.",
    organism: "Human",
    expType: "RNA-seq",
    platform: "Illumina",
    year: 2023,
    samples: 48,
    disease: "Breast cancer",
    tissue: "MCF-7, MDA-MB-231",
    conditions: "Normoxia (21% O₂) vs Hypoxia (1% O₂)",
    replicates: 8,
    instrument: "Illumina NovaSeq 6000",
    libraryStrategy: "RNA-Seq",
    submitter: "Smith JA, Johnson MB",
    journal: "Nature Communications",
    authors: ["Smith JA", "Johnson MB", "Williams CD"],
    studyType: "In vitro",
    accession: "GSE123456",
    geoAccession: "GSE123456",
    sraAccession: "SRP123456",
    similarStudies: ["GSE98765", "GSE87654", "GSE76543"]
  },
  {
    id: "GSE98765",
    title: "Single-cell RNA sequencing reveals immune cell heterogeneity in colorectal cancer tumor microenvironment",
    abstract: "The tumor microenvironment plays a crucial role in cancer progression. We used scRNA-seq to profile 15 colorectal cancer samples, identifying distinct immune cell populations and their interactions with tumor cells.",
    organism: "Human",
    expType: "scRNA-seq",
    platform: "Illumina",
    year: 2024,
    samples: 15,
    disease: "Colorectal cancer",
    tissue: "Tumor biopsy",
    conditions: "Tumor vs Normal adjacent tissue",
    replicates: 3,
    instrument: "Illumina NovaSeq 6000",
    libraryStrategy: "RNA-Seq",
    submitter: "Brown KL, Davis RM",
    journal: "Cell",
    authors: ["Brown KL", "Davis RM", "Miller SA"],
    studyType: "In vivo",
    accession: "GSE98765",
    geoAccession: "GSE98765",
    sraAccession: "SRP98765",
    similarStudies: ["GSE123456", "GSE87654", "GSE65432"]
  },
  {
    id: "GSE87654",
    title: "ChIP-seq analysis of histone modifications in embryonic stem cells during differentiation",
    abstract: "Epigenetic modifications regulate gene expression during development. We performed ChIP-seq for H3K4me3, H3K27me3, and H3K27ac in mouse embryonic stem cells across a differentiation time course.",
    organism: "Mouse",
    expType: "ChIP-seq",
    platform: "Illumina",
    year: 2022,
    samples: 36,
    disease: null,
    tissue: "Embryonic stem cells",
    conditions: "Day 0, 2, 4, 6, 8, 10 of differentiation",
    replicates: 6,
    instrument: "Illumina HiSeq 4000",
    libraryStrategy: "ChIP-Seq",
    submitter: "Wilson AB, Taylor EF",
    journal: "Nature",
    authors: ["Wilson AB", "Taylor EF", "Anderson LM"],
    studyType: "In vitro",
    accession: "GSE87654",
    geoAccession: "GSE87654",
    sraAccession: "SRP87654",
    similarStudies: ["GSE76543", "GSE65432", "GSE123456"]
  },
  {
    id: "GSE76543",
    title: "ATAC-seq mapping of chromatin accessibility in neural progenitor cells",
    abstract: "Chromatin accessibility is a key regulator of cell fate decisions. We used ATAC-seq to profile open chromatin regions in neural progenitor cells during neuronal differentiation in zebrafish.",
    organism: "Zebrafish",
    expType: "ATAC-seq",
    platform: "Illumina",
    year: 2023,
    samples: 24,
    disease: null,
    tissue: "Neural progenitors",
    conditions: "Neural progenitor vs Differentiated neurons",
    replicates: 4,
    instrument: "Illumina NovaSeq 6000",
    libraryStrategy: "ATAC-Seq",
    submitter: "Martinez CG, Lee HJ",
    journal: "Science",
    authors: ["Martinez CG", "Lee HJ", "Park SY"],
    studyType: "In vitro",
    accession: "GSE76543",
    geoAccession: "GSE76543",
    sraAccession: "SRP76543",
    similarStudies: ["GSE65432", "GSE87654", "GSE98765"]
  },
  {
    id: "GSE65432",
    title: "Whole genome sequencing identifies rare variants in familial Alzheimer's disease",
    abstract: "Genetic factors contribute significantly to Alzheimer's disease risk. We performed WGS on 120 families with early-onset Alzheimer's disease to identify rare pathogenic variants.",
    organism: "Human",
    expType: "WGS",
    platform: "Illumina",
    year: 2024,
    samples: 360,
    disease: "Alzheimer's disease",
    tissue: "Blood",
    conditions: "Affected vs Unaffected family members",
    replicates: 1,
    instrument: "Illumina NovaSeq 6000",
    libraryStrategy: "WGS",
    submitter: "Thompson RS, White NP",
    journal: "Nature Genetics",
    authors: ["Thompson RS", "White NP", "Harris DL"],
    studyType: "In vivo",
    accession: "GSE65432",
    geoAccession: "GSE65432",
    sraAccession: "SRP65432",
    similarStudies: ["GSE123456", "GSE98765", "GSE87654"]
  },
  {
    id: "GSE54321",
    title: "Exome sequencing of pediatric brain tumors reveals novel driver mutations",
    abstract: "Pediatric brain tumors represent a diverse group of malignancies with distinct molecular profiles. We performed exome sequencing on 50 pediatric brain tumor samples to identify driver mutations.",
    organism: "Human",
    expType: "Exome-seq",
    platform: "Illumina",
    year: 2023,
    samples: 50,
    disease: "Brain tumor",
    tissue: "Brain tumor tissue",
    conditions: "Tumor vs Normal brain tissue",
    replicates: 1,
    instrument: "Illumina HiSeq 4000",
    libraryStrategy: "WXS",
    submitter: "Garcia ML, Rodriguez JP",
    journal: "Cancer Cell",
    authors: ["Garcia ML", "Rodriguez JP", "Lopez AM"],
    studyType: "In vivo",
    accession: "GSE54321",
    geoAccession: "GSE54321",
    sraAccession: "SRP54321",
    similarStudies: ["GSE65432", "GSE123456", "GSE98765"]
  },
  {
    id: "GSE43210",
    title: "RNA-seq analysis of C. elegans response to oxidative stress",
    abstract: "Oxidative stress is a key factor in aging and age-related diseases. We used RNA-seq to profile gene expression changes in C. elegans exposed to various oxidative stress conditions.",
    organism: "C. elegans",
    expType: "RNA-seq",
    platform: "Illumina",
    year: 2022,
    samples: 30,
    disease: null,
    tissue: "Whole organism",
    conditions: "Control vs H2O2 treatment vs Paraquat treatment",
    replicates: 5,
    instrument: "Illumina HiSeq 4000",
    libraryStrategy: "RNA-Seq",
    submitter: "Chen X, Wang Y",
    journal: "PLOS Genetics",
    authors: ["Chen X", "Wang Y", "Zhang L"],
    studyType: "In vivo",
    accession: "GSE43210",
    geoAccession: "GSE43210",
    sraAccession: "SRP43210",
    similarStudies: ["GSE87654", "GSE76543", "GSE65432"]
  },
  {
    id: "GSE32109",
    title: "ChIP-seq profiling of transcription factors in Drosophila development",
    abstract: "Transcription factors orchestrate developmental gene expression programs. We performed ChIP-seq for key transcription factors across Drosophila embryonic development stages.",
    organism: "Drosophila",
    expType: "ChIP-seq",
    platform: "Illumina",
    year: 2023,
    samples: 42,
    disease: null,
    tissue: "Embryos",
    conditions: "Stage 5, 7, 9, 11, 13, 15 embryos",
    replicates: 7,
    instrument: "Illumina NovaSeq 6000",
    libraryStrategy: "ChIP-Seq",
    submitter: "Kim SJ, Park JH",
    journal: "Developmental Cell",
    authors: ["Kim SJ", "Park JH", "Lee KH"],
    studyType: "In vivo",
    accession: "GSE32109",
    geoAccession: "GSE32109",
    sraAccession: "SRP32109",
    similarStudies: ["GSE87654", "GSE76543", "GSE43210"]
  },
  {
    id: "GSE21098",
    title: "Single-cell ATAC-seq of mouse hematopoietic stem cells",
    abstract: "Hematopoietic stem cells maintain blood cell production throughout life. We used scATAC-seq to profile chromatin accessibility in HSCs and their differentiated progeny.",
    organism: "Mouse",
    expType: "scRNA-seq",
    platform: "Illumina",
    year: 2024,
    samples: 20,
    disease: null,
    tissue: "Bone marrow",
    conditions: "HSC vs Progenitor vs Differentiated cells",
    replicates: 4,
    instrument: "Illumina NovaSeq 6000",
    libraryStrategy: "ATAC-Seq",
    submitter: "Anderson JM, Clark RT",
    journal: "Cell Stem Cell",
    authors: ["Anderson JM", "Clark RT", "Moore KL"],
    studyType: "In vivo",
    accession: "GSE21098",
    geoAccession: "GSE21098",
    sraAccession: "SRP21098",
    similarStudies: ["GSE98765", "GSE87654", "GSE76543"]
  },
  {
    id: "GSE10987",
    title: "Whole genome sequencing of rat models of hypertension",
    abstract: "Hypertension is a complex trait influenced by genetic and environmental factors. We performed WGS on 200 rats from hypertensive and normotensive strains.",
    organism: "Rat",
    expType: "WGS",
    platform: "Illumina",
    year: 2023,
    samples: 200,
    disease: "Hypertension",
    tissue: "Blood",
    conditions: "Hypertensive vs Normotensive strains",
    replicates: 1,
    instrument: "Illumina NovaSeq 6000",
    libraryStrategy: "WGS",
    submitter: "Jackson DL, Moore PS",
    journal: "Hypertension",
    authors: ["Jackson DL", "Moore PS", "Taylor MJ"],
    studyType: "In vivo",
    accession: "GSE10987",
    geoAccession: "GSE10987",
    sraAccession: "SRP10987",
    similarStudies: ["GSE65432", "GSE54321", "GSE43210"]
  },
  {
    id: "GSE9876",
    title: "RNA-seq analysis of triple-negative breast cancer patient samples",
    abstract: "Triple-negative breast cancer is an aggressive subtype with limited treatment options. We performed RNA-seq on 60 TNBC patient samples to identify therapeutic targets.",
    organism: "Human",
    expType: "RNA-seq",
    platform: "Illumina",
    year: 2024,
    samples: 60,
    disease: "Breast cancer",
    tissue: "Tumor biopsy",
    conditions: "TNBC vs Normal breast tissue",
    replicates: 2,
    instrument: "Illumina NovaSeq 6000",
    libraryStrategy: "RNA-Seq",
    submitter: "Lewis AM, Walker BT",
    journal: "Oncogene",
    authors: ["Lewis AM", "Walker BT", "Young SC"],
    studyType: "In vivo",
    accession: "GSE9876",
    geoAccession: "GSE9876",
    sraAccession: "SRP9876",
    similarStudies: ["GSE123456", "GSE98765", "GSE87654"]
  }
];

// Generate sample data for each study
export function getSampleData(studyId) {
  const samples = [];
  const study = studies.find(s => s.id === studyId);
  if (!study) return samples;

  const conditions = study.conditions.split(" vs ");
  const tissues = study.tissue.split(", ");
  
  for (let i = 0; i < study.samples; i++) {
    const condition = conditions[i % conditions.length];
    const tissue = tissues[i % tissues.length];
    const sampleId = `SRR${String(100000 + i).padStart(6, '0')}`;
    const reads = (40 + Math.random() * 15).toFixed(1) + "M";
    const size = (7 + Math.random() * 2).toFixed(1) + " GB";
    
    samples.push({
      id: sampleId,
      condition: condition,
      tissue: tissue,
      reads: reads,
      size: size
    });
  }
  
  return samples;
}

// Generate file data for each study
export function getFileData(studyId) {
  const files = [];
  const study = studies.find(s => s.id === studyId);
  if (!study) return files;

  const numFiles = Math.min(study.samples * 2, 20); // Limit to 20 files for demo
  
  for (let i = 0; i < numFiles; i++) {
    const sampleId = `SRR${String(100000 + i).padStart(6, '0')}`;
    const pair = (i % 2) + 1;
    const size = (3.5 + Math.random() * 1.5).toFixed(1) + " GB";
    
    files.push({
      name: `${sampleId}_${pair}.fastq.gz`,
      size: size,
      type: "FASTQ"
    });
  }
  
  return files;
}


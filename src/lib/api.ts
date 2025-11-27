const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-node-bio.onrender.com/api';

export interface Study {
  id: string;
  title: string;
  abstract: string;
  organism: string;
  expType: string;
  platform: string;
  year: number;
  samples: number;
  disease?: string;
  tissue: string;
  conditions?: string;
  replicates?: number;
  instrument?: string;
  libraryStrategy?: string;
  submitter?: string;
  journal?: string;
  authors?: string[];
  studyType?: string;
  accession?: string;
  geoAccession?: string;
  sraAccession?: string;
  similarStudies?: string[];
}

export interface StudyDetail extends Study {
  similarStudies: Array<{ id: string; title: string }>;
}

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  sort?: 'relevant' | 'recent' | 'samples';
  organisms?: string[];
  expTypes?: string[];
  platforms?: string[];
  yearMin?: number;
  yearMax?: number;
  author?: string;
  journal?: string;
  studyTypes?: string[];
}

export interface SearchResponse {
  studies: Study[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Sample {
  id: string;
  condition: string;
  tissue: string;
  reads: string;
  size: string;
}

export interface File {
  name: string;
  size: string;
  type: string;
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantResponse {
  response: string;
}

export interface ExportParams {
  studyIds: string[];
  columns: string[];
  format: 'csv' | 'json';
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchStudies(params: SearchParams, useNCBI: boolean = false): Promise<SearchResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.organisms) params.organisms.forEach(org => queryParams.append('organisms', org));
    if (params.expTypes) params.expTypes.forEach(type => queryParams.append('expTypes', type));
    if (params.platforms) params.platforms.forEach(plat => queryParams.append('platforms', plat));
    if (params.yearMin) queryParams.append('yearMin', params.yearMin.toString());
    if (params.yearMax) queryParams.append('yearMax', params.yearMax.toString());
    if (params.author) queryParams.append('author', params.author);
    if (params.journal) queryParams.append('journal', params.journal);
    if (params.studyTypes) params.studyTypes.forEach(type => queryParams.append('studyTypes', type));
    if (useNCBI) queryParams.append('useNCBI', 'true');

    return this.request<SearchResponse>(`/studies?${queryParams.toString()}`);
  }

  async getStudy(id: string, useNCBI: boolean = false): Promise<StudyDetail> {
    const query = useNCBI ? '?useNCBI=true' : '';
    return this.request<StudyDetail>(`/studies/${id}${query}`);
  }

  async getSamples(studyId: string): Promise<{ samples: Sample[] }> {
    return this.request<{ samples: Sample[] }>(`/studies/${studyId}/samples`);
  }

  async getFiles(studyId: string): Promise<{ files: File[] }> {
    return this.request<{ files: File[] }>(`/studies/${studyId}/files`);
  }

  async chatAssistant(message: string, contextStudy?: string): Promise<AssistantResponse> {
    return this.request<AssistantResponse>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, contextStudy }),
    });
  }

  async getRecommendations(studyId?: string): Promise<{ recommendations: Array<{ id: string; title: string }> }> {
    const query = studyId ? `?studyId=${studyId}` : '';
    return this.request<{ recommendations: Array<{ id: string; title: string }> }>(`/assistant/recommendations${query}`);
  }

  async exportStudies(params: ExportParams): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Export error: ${response.statusText}`);
    }

    return response.blob();
  }

  async getFilterOptions(): Promise<{
    organisms: string[];
    expTypes: string[];
    platforms: string[];
    years: { min: number; max: number };
    studyTypes: string[];
  }> {
    return this.request('/filters/options');
  }
}

export const api = new ApiClient();


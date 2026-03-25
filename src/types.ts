export interface Worker {
  name: string;
  rank: string;
}

export interface WorkPlan {
  id: string;
  department: string;
  projectName: string;
  date: string; // e.g., "2026-03-21"
  isImplemented: boolean;
  content: string;
  workers: Worker[];
  authorUid?: string;
  createdAt?: string;
}

export interface ContactInfo {
  role: string;
  name: string;
  phone: string;
  type: 'internal' | 'external';
  category?: string; // e.g., '사업담당', '공사담당', '감리단', '시공사'
}

export interface ProjectContact {
  id: string;
  department: string;
  projectName: string;
  contacts: ContactInfo[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  externalUrl: string | null;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  university: string | null;
  career: string | null;
  cycle: number | null;
  bio: string | null;
  skills: string[];
  serviceCategories: string[];
  ratingAverage: number | null;
  ratingCount: number;
  newInPlatform: boolean;
  certificateCount: number;
  complete: boolean;
  portfolio: PortfolioItem[];
}

export interface ClientProfile {
  id: string;
  userId: string;
  displayName: string;
  businessName: string | null;
  district: string | null;
  ratingAverage: number | null;
  ratingCount: number;
}

export interface UpdateClientProfileRequest {
  displayName: string;
  businessName: string | null;
  district: string | null;
}

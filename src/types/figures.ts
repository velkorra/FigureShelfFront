export type FigureStatus = "Preorder" | "Available" | "Archived";

export interface FigureCardData {
  id: string;
  name: string;
  imageUrl: string;
  manufacturerName: string;
  isSealed: boolean;
  status: FigureStatus;
}

export interface Dimensions {
  heightCm?: number;
  widthCm?: number;
  lengthCm?: number;
}

export interface FigureDetails {
  id: string;
  name: string;
  characterName: string;
  manufacturerName: string;
  description: string | null;
  figureType: string;
  isSealed: boolean; 
  dimensions: Dimensions | null;
  status: string;
  weight: number | null;
  imageUrl: string | null;
  scaleRatio: string | null;
}

export interface CreateFigureDto {
  name: string;
  characterId: string;
  manufacturerId: string;
  description?: string;
  status: string;
  figureType: string;
  dimensions?: Dimensions;
  weight?: number;
  imageUrl?: string;
  scaleRatio?: string;
}

export type UpdateFigureDto = Partial<CreateFigureDto>;

export interface FigureType {
  name: string;
  description: string;
}

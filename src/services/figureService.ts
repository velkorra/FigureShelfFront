import "server-only";
import { apiClient } from "@/lib/apiClient";
import type {
  FigureCardData,
  FigureDetails,
  CreateFigureDto,
  UpdateFigureDto,
  FigureType,
  FigureStatus,
} from "@/types/figures";
import { z } from "zod";

const FigureSchema = z.object({
  id: z.string(),
  name: z.string(),
  manufacturerName: z.string(),
  status: z.string(),
  imageUrl: z.string().nullable().optional(),
  isSealed: z.boolean().default(false),
});

const ApiResponseSchema = z.object({
  items: z.array(FigureSchema),
  pageNumber: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  totalCount: z.number(),
});

const DimensionsSchema = z.object({
  heightCm: z.number().nullable().optional(),
  widthCm: z.number().nullable().optional(),
  lengthCm: z.number().nullable().optional(),
});

const FigureDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  characterName: z.string(),
  manufacturerName: z.string(),
  description: z.string().nullable(),
  figureType: z.string(),
  isSealed: z.boolean(),
  dimensions: DimensionsSchema.nullable(),
  status: z.string(),
  weight: z.number().nullable(),
  imageUrl: z.string().nullable(),
  scaleRatio: z.string().nullable(),
});

const FigureTypeSchema = z.object({
  name: z.string(),
  description: z.string(),
});
const FigureTypesApiResponseSchema = z.array(FigureTypeSchema);

const CreateFigureDtoSchema = z.object({
  name: z.string(),
  characterId: z.string(),
  manufacturerId: z.string(),
  description: z.string().optional(),
  status: z.string(),
  figureType: z.string(),
  dimensions: DimensionsSchema.optional(),
  weight: z.number().optional(),
  imageUrl: z.string().optional(),
  scaleRatio: z.string().optional(),
});

const UpdateFigureDtoSchema = CreateFigureDtoSchema.partial();

type PaginatedFiguresResponse =
  | {
      success: true;
      data: {
        figures: FigureCardData[];
        pagination: {
          currentPage: number;
          hasMore: boolean;
          totalCount: number;
          totalPages: number;
        };
      };
    }
  | {
      success: false;
      error: string;
    };

type SingleFigureResponse =
  | { success: true; data: FigureDetails }
  | { success: false; error: string };

type FigureTypesResponse =
  | { success: true; data: FigureType[] }
  | { success: false; error: string };

interface GetFiguresParams {
  page?: number;
  limit?: number;
}

async function getPaginatedFigures({
  page = 1,
  limit = 8,
}: GetFiguresParams): Promise<PaginatedFiguresResponse> {
  try {
    const endpoint = `/api/figures?page=${page}&pageSize=${limit}`;
    const apiResponse = await apiClient.get(endpoint, {}, ApiResponseSchema);

    const figures: FigureCardData[] = apiResponse.items.map((item) => ({
      id: item.id,
      name: item.name,
      manufacturerName: item.manufacturerName,
      status: item.status as FigureStatus,
      isSealed: item.isSealed ?? false,
      imageUrl:
        item.imageUrl ??
        "https://via.placeholder.com/300x400.png?text=No+Image",
    }));

    const hasMore = page < apiResponse.totalPages;

    return {
      success: true,
      data: {
        figures,
        pagination: {
          currentPage: apiResponse.pageNumber,
          hasMore,
          totalCount: apiResponse.totalCount,
          totalPages: apiResponse.totalPages,
        },
      },
    };
  } catch (error) {
    console.error("Ошибка при запросе к .NET API:", error);
    return {
      success: false,
      error: "Не удалось получить данные о фигурках с сервера",
    };
  }
}

async function getFigureById(id: string): Promise<SingleFigureResponse> {
  try {
    const figure = await apiClient.get(
      `/api/figures/${id}`,
      {},
      FigureDetailsSchema
    );
    return { success: true, data: figure as FigureDetails };
  } catch (error) {
    console.error(`Ошибка при получении фигурки ${id}:`, error);
    return {
      success: false,
      error: "Фигурка не найдена или произошла ошибка",
    };
  }
}

async function getFigureTypes(): Promise<FigureTypesResponse> {
  try {
    const types = await apiClient.get(
      "/api/figures/types",
      {},
      FigureTypesApiResponseSchema
    );
    return { success: true, data: types };
  } catch (error) {
    console.error("Ошибка при получении типов фигурок:", error);
    return {
      success: false,
      error: "Не удалось загрузить типы фигурок",
    };
  }
}

async function createFigure(
  figureData: CreateFigureDto
): Promise<SingleFigureResponse> {
  try {
    const newFigure = await apiClient.post(
      "/api/figures",
      figureData,
      {},
      FigureDetailsSchema
    );
    return { success: true, data: newFigure as FigureDetails };
  } catch (error) {
    console.error("Ошибка при создании фигурки:", error);
    return {
      success: false,
      error: "Не удалось создать фигурку. Проверьте введенные данные.",
    };
  }
}

async function updateFigure(
  id: string,
  figureData: UpdateFigureDto
): Promise<SingleFigureResponse> {
  try {
    const updatedFigure = await apiClient.put(
      `/api/figures/${id}`,
      figureData,
      {},
      FigureDetailsSchema
    );
    return { success: true, data: updatedFigure as FigureDetails };
  } catch (error) {
    console.error(`Ошибка при обновлении фигурки ${id}:`, error);
    return {
      success: false,
      error: "Не удалось обновить фигурку. Проверьте данные.",
    };
  }
}
async function sealFigure(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post(`/api/figures/${id}/seal`, {});
    return { success: true };
  } catch (error) {
    console.error(`Ошибка при запечатывании фигурки ${id}:`, error);
    return { success: false, error: "Не удалось запечатать фигурку." };
  }
}

export const figureService = {
  getPaginatedFigures,
  getFigureById,
  createFigure,
  getFigureTypes,
  updateFigure,
  sealFigure,
};

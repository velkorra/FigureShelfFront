import "server-only";
import { apiClient } from "@/lib/apiClient";
import { z } from "zod";

const ManufacturerSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const ManufacturersApiResponseSchema = z.array(ManufacturerSchema);

export type Manufacturer = z.infer<typeof ManufacturerSchema>;

async function getAll() {
  try {
    const manufacturers = await apiClient.get('/api/manufacturers', {}, ManufacturersApiResponseSchema);
    return { success: true, data: manufacturers };
  } catch (error) {
    console.error("Ошибка при получении производителей:", error);
    return { success: false, error: "Не удалось загрузить список производителей" };
  }
}

export const manufacturerService = {
  getAll,
};
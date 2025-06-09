import "server-only";
import { apiClient } from "@/lib/apiClient";
import { z } from "zod";

const CharacterSchema = z.object({
  id: z.string(), 
  name: z.string(),
  franchiseName: z.string(),
});

const CharactersApiResponseSchema = z.array(CharacterSchema);

export type Character = z.infer<typeof CharacterSchema>;

async function getAll() {
  try {
    const characters = await apiClient.get('/api/characters', {}, CharactersApiResponseSchema);
    return { success: true, data: characters };
  } catch (error) {
    console.error("Ошибка при получении персонажей:", error);
    return { success: false, error: "Не удалось загрузить список персонажей" };
  }
}

export const characterService = {
  getAll,
};
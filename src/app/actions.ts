"use server";

import { characterService } from "@/services/characterService";
import { figureService } from "@/services/figureService";
import { manufacturerService } from "@/services/manufacturerService";
import { CreateFigureDto, UpdateFigureDto } from "@/types/figures";
import { revalidatePath } from "next/cache";

export async function getFiguresAction(page: number) {
  const result = await figureService.getPaginatedFigures({ page });
  return result;
}

export async function getInitialFiguresAction() {
  const result = await figureService.getPaginatedFigures({ page: 1 });
  return result;
}

export async function getCharactersAction() {
  return await characterService.getAll();
}

export async function getManufacturersAction() {
  return await manufacturerService.getAll();
}

export async function getFigureByIdAction(id: string) {
  return await figureService.getFigureById(id);
}

export async function getFigureTypesAction() {
  return await figureService.getFigureTypes();
}

export async function createFigureAction(data: CreateFigureDto) {
  const result = await figureService.createFigure(data);

  if (result.success && result.data) {
    revalidatePath("/");
    revalidatePath(`/figures/${result.data.id}`);
  }

  return result;
}

export async function updateFigureAction(id: string, data: UpdateFigureDto) {
  const result = await figureService.updateFigure(id, data);

  if (result.success) {
    revalidatePath(`/figures/${id}`);
    revalidatePath("/");
  }

  return result;
}

export async function sealFigureAction(id: string) {
  const result = await figureService.sealFigure(id);

  if (result.success) {
    revalidatePath(`/figures/${id}`);
    revalidatePath("/");
  }

  return result;
}

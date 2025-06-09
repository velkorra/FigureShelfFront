import {
  getCharactersAction,
  getFigureByIdAction,
  getFigureTypesAction,
  getManufacturersAction,
} from "@/app/actions";
import Image from "next/image";
import styles from "./figurePage.module.scss";
import { FigurePageClient } from "./FigurePageClient";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const result = await getFigureByIdAction(params.id);
  if (result.success && result.data) {
    return {
      title: `${result.data.name} | MyFigureShelf`,
    };
  }
  return {
    title: "Фигурка не найдена | MyFigureShelf",
  };
}

export default async function FigurePage({ params }: PageProps) {
  const [
    figureResult,
    charactersResult,
    manufacturersResult,
    figureTypesResult,
  ] = await Promise.all([
    getFigureByIdAction(params.id),
    getCharactersAction(),
    getManufacturersAction(),
    getFigureTypesAction(),
  ]);

  if (!figureResult.success) {
    return (
      <div className="container">
        <h1>Упс...</h1>
        <p>{figureResult.error}</p>
      </div>
    );
  }
  if (
    !charactersResult.success ||
    !manufacturersResult.success ||
    !figureTypesResult.success
  ) {
    return (
      <div className="container">
        <h1>Упс...</h1>
        <p>Не удалось загрузить данные для редактирования.</p>
      </div>
    );
  }

  return (
    <FigurePageClient
      figure={figureResult.data}
      characters={charactersResult.data!}
      manufacturers={manufacturersResult.data!}
      figureTypes={figureTypesResult.data}
    />
  );
}

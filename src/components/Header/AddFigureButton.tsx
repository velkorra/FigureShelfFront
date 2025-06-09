"use client";

import { useState } from "react";
import { CreateFigureModal } from "../CreateFigureModal/CreateFigureModal";
import { type Character } from "@/services/characterService";
import { type Manufacturer } from "@/services/manufacturerService";
import styles from "./Header.module.scss";
import { FigureType } from "@/types/figures";

interface Props {
  characters: Character[];
  manufacturers: Manufacturer[];
  figureTypes: FigureType[];
}

export function AddFigureButton({
  characters,
  manufacturers,
  figureTypes,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={styles.addFigureButton}
      >
        Добавить фигурку
      </button>
      <CreateFigureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        characters={characters}
        manufacturers={manufacturers}
        figureTypes={figureTypes}
      />
    </>
  );
}

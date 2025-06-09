"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import styles from "./figurePage.module.scss";
import { type Character } from "@/services/characterService";
import { type Manufacturer } from "@/services/manufacturerService";
import { EditFigureModal } from "@/components/EditFigureModal/EditFigureModal";
import { FigureDetails, FigureType } from "@/types/figures";
import { sealFigureAction } from "@/app/actions";

interface Props {
  figure: FigureDetails;
  characters: Character[];
  manufacturers: Manufacturer[];
  figureTypes: FigureType[];
}

export function FigurePageClient({
  figure,
  characters,
  manufacturers,
  figureTypes,
}: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSeal = () => {
    if (
      confirm(
        "Вы уверены, что хотите запечатать эту фигурку? Это действие необратимо."
      )
    ) {
      startTransition(async () => {
        await sealFigureAction(figure.id);
      });
    }
  };
  return (
    <>
      <div className={`${styles.pageContainer} container`}>
        <div className={styles.imageWrapper}>
          <Image
            src={
              figure.imageUrl ??
              "https://via.placeholder.com/600x800.png?text=No+Image"
            }
            alt={`Фото фигурки ${figure.name}`}
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
        <div className={styles.details}>
          <div className={styles.header}>
            <div>
              <span className={styles.manufacturer}>
                {figure.manufacturerName}
              </span>
              <h1 className={styles.name}>{figure.name}</h1>
            </div>
            {!figure.isSealed && (
              <div className={styles.actionButtons}>
                <button
                  className={styles.editButton}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Редактировать
                </button>
                <button
                  className={styles.sealButton}
                  onClick={handleSeal}
                  disabled={isPending}
                >
                  {isPending ? "..." : "Запечатать"}
                </button>
              </div>
            )}
          </div>

          <p className={styles.character}>Персонаж: {figure.characterName}</p>

          <div className={styles.badge}>{figure.status}</div>

          {figure.description && (
            <div className={styles.section}>
              <h2>Описание</h2>
              <p>{figure.description}</p>
            </div>
          )}

          <div className={styles.section}>
            <h2>Характеристики</h2>
            <ul>
              <li>
                <strong>Тип:</strong> {figure.figureType}
              </li>
              {figure.scaleRatio && (
                <li>
                  <strong>Масштаб:</strong> {figure.scaleRatio}
                </li>
              )}
              {figure.dimensions?.heightCm && (
                <li>
                  <strong>Высота:</strong> {figure.dimensions.heightCm} см
                </li>
              )}
              {figure.weight && (
                <li>
                  <strong>Вес:</strong> {figure.weight} г
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <EditFigureModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        figure={figure}
        characters={characters}
        manufacturers={manufacturers}
        figureTypes={figureTypes}
      />
    </>
  );
}

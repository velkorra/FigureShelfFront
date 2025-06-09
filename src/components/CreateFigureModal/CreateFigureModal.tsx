"use client";

import { useState, useTransition } from "react";
import styles from "./CreateFigureModal.module.scss";
import { type Character } from "@/services/characterService";
import { type Manufacturer } from "@/services/manufacturerService";
import { createFigureAction } from "@/app/actions";
import { CreateFigureDto, FigureType } from "@/types/figures";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  manufacturers: Manufacturer[];
  figureTypes: FigureType[];
}

export function CreateFigureModal({
  isOpen,
  onClose,
  characters,
  manufacturers,
  figureTypes,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    const name = formData.get("name") as string;
    const characterId = formData.get("characterId") as string;
    const manufacturerId = formData.get("manufacturerId") as string;

    if (!name || !characterId || !manufacturerId) {
      setError("Имя, персонаж и производитель обязательны.");
      return;
    }

    const heightStr = formData.get("heightCm") as string;
    const widthStr = formData.get("widthCm") as string;
    const lengthStr = formData.get("lengthCm") as string;

    let dimensions: CreateFigureDto["dimensions"] | undefined = undefined;
    if (heightStr || widthStr || lengthStr) {
      dimensions = {
        heightCm: heightStr ? parseFloat(heightStr) : undefined,
        widthCm: widthStr ? parseFloat(widthStr) : undefined,
        lengthCm: lengthStr ? parseFloat(lengthStr) : undefined,
      };
    }

    const weightStr = formData.get("weight") as string;

    const data: CreateFigureDto = {
      name,
      characterId,
      manufacturerId,
      status: formData.get("status") as string,
      figureType: formData.get("figureType") as string,
      description: (formData.get("description") as string) || undefined,
      imageUrl: (formData.get("imageUrl") as string) || undefined,
      scaleRatio: (formData.get("scaleRatio") as string) || undefined,
      weight: weightStr ? parseFloat(weightStr) : undefined,
      dimensions,
    };

    startTransition(async () => {
      const result = await createFigureAction(data);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Произошла неизвестная ошибка.");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Добавить новую фигурку</h2>
        <form action={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Название</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="characterId">Персонаж</label>
              <select id="characterId" name="characterId" required>
                <option value="">Выберите персонажа</option>
                {characters.map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.name} ({char.franchiseName})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="manufacturerId">Производитель</label>
              <select id="manufacturerId" name="manufacturerId" required>
                <option value="">Выберите производителя</option>
                {manufacturers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="figureType">Тип фигурки</label>
              <select id="figureType" name="figureType" required>
                {figureTypes.map((t) => (
                  <option key={t.name} value={t.name} title={t.description}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status">Статус</label>
              <select id="status" name="status" defaultValue="Available">
                <option value="Available">Available</option>
                <option value="Preorder">Preorder</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="imageUrl">URL изображения</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="scaleRatio">Масштаб</label>
              <input
                type="text"
                id="scaleRatio"
                name="scaleRatio"
                placeholder="1/7"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="weight">Вес (граммы)</label>
              <input
                type="number"
                step="0.1"
                id="weight"
                name="weight"
                placeholder="300"
              />
            </div>
          </div>

          <label>Размеры (см)</label>
          <div className={styles.formGridTriple}>
            <div className={styles.formGroup}>
              <input
                type="number"
                step="0.1"
                id="heightCm"
                name="heightCm"
                placeholder="Высота"
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="number"
                step="0.1"
                id="widthCm"
                name="widthCm"
                placeholder="Ширина"
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="number"
                step="0.1"
                id="lengthCm"
                name="lengthCm"
                placeholder="Длина"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Описание</label>
            <textarea
              style={{ fontFamily: "-apple-system" }}
              id="description"
              name="description"
              rows={3}
            ></textarea>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={styles.submitButton}
            >
              {isPending ? "Сохранение..." : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition, useEffect } from "react";
import styles from "../CreateFigureModal/CreateFigureModal.module.scss";
import { type Character } from "@/services/characterService";
import { type Manufacturer } from "@/services/manufacturerService";
import { updateFigureAction } from "@/app/actions";
import { FigureDetails, FigureType, UpdateFigureDto } from "@/types/figures";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  figure: FigureDetails;
  characters: Character[];
  manufacturers: Manufacturer[];
  figureTypes: FigureType[];
}

export function EditFigureModal({
  isOpen,
  onClose,
  figure,
  characters,
  manufacturers,
  figureTypes,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FigureDetails>>(figure);

  useEffect(() => {
    if (isOpen) {
      setFormData(figure);
    }
  }, [isOpen, figure]);

  const handleSubmit = async (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    setError(null);

    const form = new FormData(formEvent.currentTarget);

    const heightStr = form.get("heightCm") as string;
    const widthStr = form.get("widthCm") as string;
    const lengthStr = form.get("lengthCm") as string;

    const data: UpdateFigureDto = {
      name: form.get("name") as string,
      description: form.get("description") as string,
      status: form.get("status") as string,
      figureType: form.get("figureType") as string,
      imageUrl: form.get("imageUrl") as string,
      scaleRatio: form.get("scaleRatio") as string,
      weight: form.get("weight")
        ? parseFloat(form.get("weight") as string)
        : undefined,
      dimensions: {
        heightCm: heightStr ? parseFloat(heightStr) : undefined,
        widthCm: widthStr ? parseFloat(widthStr) : undefined,
        lengthCm: lengthStr ? parseFloat(lengthStr) : undefined,
      },
    };

    startTransition(async () => {
      const result = await updateFigureAction(figure.id, data);
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
        <h2>Редактировать фигурку</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Название</label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={formData.name}
              required
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="figureType">Тип фигурки</label>
              <select
                id="figureType"
                name="figureType"
                defaultValue={formData.figureType}
                required
              >
                {figureTypes.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status">Статус</label>
              <select id="status" name="status" defaultValue={formData.status}>
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
              defaultValue={formData.imageUrl ?? ""}
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
                defaultValue={formData.scaleRatio ?? ""}
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
                defaultValue={formData.weight ?? ""}
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
                defaultValue={formData.dimensions?.heightCm ?? ""}
                placeholder="Высота"
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="number"
                step="0.1"
                id="widthCm"
                name="widthCm"
                defaultValue={formData.dimensions?.widthCm ?? ""}
                placeholder="Ширина"
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="number"
                step="0.1"
                id="lengthCm"
                name="lengthCm"
                defaultValue={formData.dimensions?.lengthCm ?? ""}
                placeholder="Длина"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              style={{fontFamily: "-apple-system"}}
              defaultValue={formData.description ?? ""}
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
              {isPending ? "Обновление..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

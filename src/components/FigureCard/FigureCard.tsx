import Image from "next/image";
import styles from "./FigureCard.module.scss";
import { FigureCardData, FigureStatus } from "@/types/figures";
import Link from "next/link";

const statusStyles: Record<FigureStatus, string> = {
  Preorder: styles.preorder,
  Available: styles.available,
  Archived: styles.archived,
};

export const FigureCard = ({ figure }: { figure: FigureCardData }) => {
  const { id, name, imageUrl, manufacturerName, status } = figure;

  return (
    <Link href={`/figures/${id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <Image
            src={imageUrl}
            alt={`Фигурка ${name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            className={styles.image}
          />
        </div>

        <span className={styles.manufacturer}>{manufacturerName}</span>
        <h3 className={styles.title}>{name}</h3>

        <div className={`${styles.tag} ${statusStyles[status]}`}>{status}</div>
      </div>
    </Link>
  );
};

import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.scss";
import {
  getCharactersAction,
  getFigureTypesAction,
  getManufacturersAction,
} from "@/app/actions";
import { AddFigureButton } from "./AddFigureButton";

// const navLinks = [
//   { href: "/figures", label: "Фигурки" },
//   { href: "/collections", label: "Коллекции" },
//   { href: "/characters", label: "Персонажи" },
// ];
// const navLinks: {href: string, label: string} = [] as
export const Header = async () => {
  const [charactersResult, manufacturersResult, figureTypesResult] =
    await Promise.all([
      getCharactersAction(),
      getManufacturersAction(),
      getFigureTypesAction(),
    ]);

  return (
    <header className={styles.header}>
      <div className={`${styles.headerContent} container`}>
        <Link href="/" className={styles.logo}>
          MYFIGURESHELF
        </Link>

        {/* <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav> */}

        <div className={styles.rightControls}>
          <div className={styles.controls}>
            {charactersResult.success &&
              manufacturersResult.success &&
              figureTypesResult.success && (
                <AddFigureButton
                  characters={charactersResult.data!}
                  manufacturers={manufacturersResult.data!}
                  figureTypes={figureTypesResult.data}
                />
              )}
          </div>

          <div className={styles.profile}>
            <Image
              src="/Avatar.jpg"
              alt="Аватар пользователя"
              width={40}
              height={40}
              className={styles.avatar}
            />
            <span>Коллекционер</span>
            <span className={styles.arrow}>▼</span>
          </div>
        </div>
      </div>
    </header>
  );
};

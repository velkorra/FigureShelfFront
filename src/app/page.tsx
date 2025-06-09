import FigureList from "@/components/FigureList";
import SearchBar from "@/components/SearchBar/SearchBar";
import { getInitialFiguresAction } from "@/app/actions";

export default async function HomePage() {
  const initialData = await getInitialFiguresAction();

  return (
    <div className="container">
      <SearchBar />
      {initialData.success ? (
        <FigureList
          initialFigures={initialData.data.figures}
          initialHasMore={initialData.data.pagination.hasMore}
        />
      ) : (
        <div>
          <h2>Упс, что-то пошло не так...</h2>
          <p>{initialData.error}</p>
        </div>
      )}
    </div>
  );
}

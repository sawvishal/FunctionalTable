import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primeicons/primeicons.css";
import { OverlayPanel } from "primereact/overlaypanel";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const FunctionalTable = () => {
  const [data, setData] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[] | null>(
    null
  );

  const [inputValue, setInputValue] = useState("");
  const [highlightCount, setHighlightCount] = useState<number>(0);

  const op = useRef<OverlayPanel>(null);

  const rowsPerPage = 10;

  const fetchArtworks = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber + 1}`
      );
      const result = await res.json();
      setData(result.data);
      setTotalRecords(result.pagination.total);
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(page);
  }, [page]);

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg max-w-6xl mx-auto">
      <DataTable
        value={data}
        lazy
        paginator
        rows={rowsPerPage}
        totalRecords={totalRecords}
        loading={loading}
        onPage={(e) => setPage(e.page!)}
        first={page * rowsPerPage}
        stripedRows
        scrollable
        showGridlines
        selection={selectedArtworks}
        onSelectionChange={(e) => setSelectedArtworks(e.value as Artwork[])}
        dataKey="id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column
          field="title"
          header={
            <div className="flex items-center gap-x-4">
              <span>Title</span>

              <i
                className="pi pi-chevron-down text-sm text-gray-600 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  op.current?.toggle(e);
                }}
              />

              <OverlayPanel ref={op}>
                <div className="bg-white w-64 p-4 shadow rounded">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter number of rows to select"
                    className="p-2 border border-gray-300 rounded w-full mb-3"
                  />
                  <button
                    onClick={() => {
                      const number = parseInt(inputValue);
                      if (!isNaN(number) && number > 0) {
                        const selected = data.slice(0, number);
                        setSelectedArtworks(selected);
                        setHighlightCount(number);
                        op.current?.hide();
                      }
                    }}
                    className="w-full text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Submit
                  </button>
                </div>
              </OverlayPanel>
            </div>
          }
        />

        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Year" />
        <Column field="date_end" header="End Year" />
      </DataTable>
    </div>
  );
};

export default FunctionalTable;

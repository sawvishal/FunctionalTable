import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import "primeicons/primeicons.css";

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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const op = useRef<OverlayPanel>(null);

  const rowsPerPage = 10;

  const fetchFirst10Pages = async () => {
    setLoading(true);
    try {
      const collected: Artwork[] = [];

      for (let i = 1; i <= 10; i++) {
        const res = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${i}&limit=${rowsPerPage}`
        );
        const result = await res.json();
        collected.push(...(result.data as Artwork[]));
      }

      setData(collected);
      setTotalRecords(rowsPerPage * 10); // 10 pages × 10 = 100
    } catch (err) {
      console.error("Failed to fetch first 10 pages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirst10Pages();
  }, []);

  // Function to handle selection change
  const onSelectionChange = (e: { value: Artwork[] }) => {
    setSelectedArtworks(e.value);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg max-w-6xl mx-auto">
      <DataTable
        selectionMode="multiple"
        value={data}
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
        onSelectionChange={onSelectionChange}
        dataKey="id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column
          field="title"
          header={
            <div className="flex items-center gap-x-4">
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
                    placeholder="Enter number of rows.."
                    className="p-2 border border-gray-300 rounded w-full mb-3"
                  />
                  <button
                    onClick={() => {
                      const number = parseInt(inputValue);
                      if (!isNaN(number) && number > 0) {
                        const selected = data.slice(0, number);
                        setSelectedArtworks(selected);
                        op.current?.hide();
                      }
                    }}
                    className="w-full text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Submit
                  </button>
                </div>
              </OverlayPanel>
              <span>Title</span>
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

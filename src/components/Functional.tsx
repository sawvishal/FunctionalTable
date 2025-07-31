import { useEffect, useRef, useState } from "react";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";

import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
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
  const [globalSelected, setGlobalSelected] = useState<Record<number, Artwork>>(
    {}
  );
  const [inputValue, setInputValue] = useState("");
  const op = useRef<OverlayPanel>(null);

  const rowsPerPage = 10;
  const maxPages = 10;
  const totalRecords = maxPages * rowsPerPage;

  const fetchData = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${
          pageNumber + 1
        }&limit=${rowsPerPage}`
      );
      const result = await res.json();
      setData(result.data);
    } catch (err) {
      console.error("API Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(0);
  }, []);

  const onPageChange = (e: DataTablePageEvent) => {
    const pageNumber = e.page ?? 0;
    setPage(pageNumber);
    fetchData(pageNumber);
  };

  const getCurrentPageSelection = () =>
    data.filter((row) => !!globalSelected[row.id]);

  const onSelectionChange = (e: { value: Artwork[] }) => {
    const updated = { ...globalSelected };

    data.forEach((row) => {
      delete updated[row.id];
    });

    e.value.forEach((row) => {
      updated[row.id] = row;
    });

    setGlobalSelected(updated);
  };

  const onSelectAllChange = async (e: { checked: boolean }) => {
    if (e.checked) {
      setLoading(true);
      try {
        const updated = { ...globalSelected };
        for (let i = 0; i < maxPages; i++) {
          const res = await fetch(
            `https://api.artic.edu/api/v1/artworks?page=${
              i + 1
            }&limit=${rowsPerPage}`
          );
          const result = await res.json();
          result.data.forEach((row: Artwork) => {
            updated[row.id] = row;
          });
        }
        setGlobalSelected(updated);
      } catch (err) {
        console.error("Error selecting rows from 10 pages:", err);
      } finally {
        setLoading(false);
      }
    } else {
      const updated = { ...globalSelected };
      const idsToRemove = new Set<number>();
      for (let i = 0; i < maxPages; i++) {
        const res = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${
            i + 1
          }&limit=${rowsPerPage}`
        );
        const result = await res.json();
        result.data.forEach((row: Artwork) => {
          idsToRemove.add(row.id);
        });
      }

      idsToRemove.forEach((id) => delete updated[id]);
      setGlobalSelected(updated);
    }
  };

  const selectedOnCurrentPage = getCurrentPageSelection();

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg max-w-6xl mx-auto">
      <DataTable
        value={data}
        selection={selectedOnCurrentPage}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
        onSelectAllChange={onSelectAllChange}
        selectAll={data.every((row) => globalSelected[row.id])}
        dataKey="id"
        paginator
        rows={rowsPerPage}
        totalRecords={totalRecords}
        loading={loading}
        onPage={onPageChange}
        first={page * rowsPerPage}
        stripedRows
        scrollable
        showGridlines
        lazy
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
                    placeholder="Enter number of rows to select..."
                    className="p-2 border border-gray-300 rounded w-full mb-3"
                  />
                  <button
                    onClick={async () => {
                      const number = parseInt(inputValue);
                      if (!isNaN(number) && number > 0) {
                        setLoading(true);
                        try {
                          const pagesNeeded = Math.ceil(number / rowsPerPage);
                          const updated = { ...globalSelected };

                          for (
                            let i = 0;
                            i < pagesNeeded && i < maxPages;
                            i++
                          ) {
                            const res = await fetch(
                              `https://api.artic.edu/api/v1/artworks?page=${
                                i + 1
                              }&limit=${rowsPerPage}`
                            );
                            const result = await res.json();
                            result.data.forEach((row: Artwork) => {
                              if (Object.keys(updated).length < number) {
                                updated[row.id] = row;
                              }
                            });
                            if (Object.keys(updated).length >= number) break;
                          }

                          setGlobalSelected(updated);
                          op.current?.hide();
                        } catch (err) {
                          console.error("Error selecting rows:", err);
                        } finally {
                          setLoading(false);
                        }
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

      <div className="mt-4">
        <strong>Total Selected Across Pages:</strong>{" "}
        {Object.keys(globalSelected).length}
      </div>
    </div>
  );
};

export default FunctionalTable;

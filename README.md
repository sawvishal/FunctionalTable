# 📊 FunctionalTable

A React + PrimeReact component that renders a paginated, multi-selectable table of artwork data from the Art Institute of Chicago API. This project emphasizes pagination, persistent row selection across pages, and memory efficiency by avoiding large dataset storage in memory.


 Tech Stack

* **React** 
* **TypeScript**
* **PrimeReact** (DataTable, OverlayPanel, Icons)
* **Art Institute of Chicago API**

## 🚀 Features

✅ **Server-side pagination** — Fetches 10 records per page only when needed.
✅ **Fixed dataset scope** — Fetches a maximum of 100 records across 10 pages.
✅ **Persistent row selection** — Selected rows stay selected even when navigating pages.
✅ **Select all functionality** — Header checkbox selects all records across all pages.
✅ **Dynamic row selection** — Select a specific number of rows using a custom input panel.
✅ **Memory efficiency** — Only keeps current page data in memory.

---

## 🧩 Functional Breakdown

### 1. Pagination

* Uses `rowsPerPage = 10` and `maxPages = 10`.
* On every page change, it fetches 10 rows using:

  `https://api.artic.edu/api/v1/artworks?page=${page + 1}&limit=10`
* Ensures no pre-fetching of all records, improving load speed.

### 2. Row Selection

* Each row includes a checkbox for selection.
* Selections persist across page navigation using a global state object (`globalSelected`) keyed by record `id`.

#### Row Selection Features:

* **Select all**: Selects all 100 rows across 10 pages.
* **Input-based selection**: User inputs a number (e.g., 25) to select that many rows starting from page 1.
* **Deselect all**: Clears all selected rows.

### 3. Memory Safety

* Only keeps **current page data** (`data`) in state.
* Avoids storing previously fetched pages to reduce memory footprint.
* Efficient even when user selects many rows.

### 4. Custom OverlayPanel

* Clicking on the title header opens an input popup.
* Allows user to enter how many rows to select (e.g., 20).
* Fetches required number of rows from API and selects them dynamically.

### 5. Header Checkbox Functionality

* Header checkbox (in selection column) is used to select or deselect all 100 records.
* When selecting all, it programmatically fetches data from all 10 pages and updates the global selection.


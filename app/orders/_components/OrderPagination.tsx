import React from "react";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

interface OrderPaginationProps {
  pagination: PaginationInfo;
  setPagination: (pagination: PaginationInfo) => void;
}

const OrderPagination: React.FC<OrderPaginationProps> = ({
  pagination,
  setPagination,
}) => {
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setPagination({
      ...pagination,
      currentPage: newPage,
    });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (pagination.totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than or equal to maxPagesToShow
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of page range
      let start = Math.max(2, pagination.currentPage - 1);
      let end = Math.min(pagination.totalPages - 1, pagination.currentPage + 1);

      // Adjust if we're at the beginning
      if (pagination.currentPage <= 2) {
        end = Math.min(pagination.totalPages - 1, maxPagesToShow - 1);
      }

      // Adjust if we're at the end
      if (pagination.currentPage >= pagination.totalPages - 1) {
        start = Math.max(2, pagination.totalPages - maxPagesToShow + 2);
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < pagination.totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      if (pagination.totalPages > 1) {
        pages.push(pagination.totalPages);
      }
    }

    return pages;
  };

  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            显示第{" "}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
            </span>{" "}
            到
            <span className="font-medium">
              {Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalItems
              )}
            </span>{" "}
            条， 共 <span className="font-medium">{pagination.totalItems}</span>{" "}
            条
          </p>
        </div>
        <div>
          <nav
            className="inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-l-md ${
                pagination.currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">上一页</span>
              &laquo;
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() =>
                  typeof page === "number" ? handlePageChange(page) : null
                }
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                  page === pagination.currentPage
                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                } ${typeof page !== "number" ? "cursor-default" : ""}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-r-md ${
                pagination.currentPage === pagination.totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">下一页</span>
              &raquo;
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default OrderPagination;

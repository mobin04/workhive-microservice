import { useMemo } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({totalPages, isDark, currentPage, pageFilter }) => {
  const pageNumbers = useMemo(() => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is 5 or less
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const current = currentPage;
    let start, end;

    if (current <= Math.floor(maxVisible / 2) + 1) {
      // Show first 5 pages when current is near the beginning
      start = 1;
      end = maxVisible;
    } else if (current >= totalPages - Math.floor(maxVisible / 2)) {
      // Show last 5 pages when current is near the end
      start = totalPages - maxVisible + 1;
      end = totalPages;
    } else {
      // Show current page in the middle with 2 pages on each side
      start = current - Math.floor(maxVisible / 2);
      end = current + Math.floor(maxVisible / 2);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const showStartEllipsis = pageNumbers[0] > 1;
  const showEndEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages;

  const handlePageChange = (page) => {
    pageFilter(page);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 w-full  z-50 ${
        isDark
          ? "bg-gray-500/10 backdrop-blur-2xl"
          : "bg-gray-400/10 backdrop-blur-2xl text-black"
      } flex justify-center items-center space-x-2 py-4 shadow-md`}
    >
      {/* Previous Arrow */}
      <button
        type="button"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? "hover:bg-gray-700" : "hover:bg-gray-400"
        } ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* First page if not visible */}
      {showStartEllipsis && (
        <>
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            className={`px-2 md:px-3 py-1 rounded-lg transition-colors ${
              currentPage === 1
                ? "bg-blue-600 text-white"
                : isDark
                ? "hover:bg-gray-700"
                : "hover:bg-gray-300"
            }`}
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span className="px-2 opacity-50">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          )}
        </>
      )}

      {/* Visible Page Numbers */}
      {pageNumbers.map((page) => (
        <button
          type="button"
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-2 md:px-3 py-1 rounded-lg transition-colors ${
            currentPage === page
              ? "bg-blue-600 text-white"
              : isDark
              ? "hover:bg-gray-700"
              : "hover:bg-gray-300"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last page if not visible */}
      {showEndEllipsis && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="px-1 md:px-2 opacity-50">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          )}
          <button
            type="button"
            onClick={() => handlePageChange(totalPages)}
            className={`px-3 py-1 rounded-lg transition-colors ${
              currentPage === totalPages
                ? "bg-blue-600 text-white"
                : isDark
                ? "hover:bg-gray-700"
                : "hover:bg-gray-300"
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Arrow */}
      <button
        type="button"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? "hover:bg-gray-700" : "hover:bg-gray-300"
        } ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Page info */}
      <div
        className={`ml-4 hidden md:block text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
      >
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;

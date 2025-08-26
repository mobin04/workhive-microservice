import { useContext, useMemo } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { ThemeContext } from "../../../contexts/ThemeContext";

const Pagination = ({ totalPages, currentPage, pageFilter }) => {
  const { allUserThemeClasses, isDark } = useContext(ThemeContext);
  const pageNumbers = useMemo(() => {
    const maxVisible = 3;

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
    <>
      <div
        className={`mt-8 flex justify-center md:justify-between items-center space-x-2 py-4 shadow-md ${allUserThemeClasses.cardBackground} rounded-xl p-4 border ${allUserThemeClasses.border}`}
      >
        <div
          className={`hidden md:block text-sm ${allUserThemeClasses.textSecondary}`}
        >
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed ${
              isDark
                ? "hover:bg-gray-700"
                : "text-black disabled:text-gray-600  disabled:hover:bg-gray-300 hover:bg-gray-400"
            } ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {showStartEllipsis && (
            <div className="flex justify-center items-center">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                className={`px-2 md:px-3 py-1 cursor-pointer rounded-lg transition-colors ${
                  currentPage === 1
                    ? "bg-blue-600"
                    : isDark
                    ? "hover:bg-gray-700 text-gray-200"
                    : "hover:bg-gray-300 text-gray-600"
                }`}
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="px-1 md:px-2 relative -bottom-1  opacity-50">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              )}
            </div>
          )}

          {pageNumbers.map((page) => (
            <button
              type="button"
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-2 md:px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                currentPage === page
                  ? "bg-blue-600"
                  : isDark
                  ? "hover:bg-gray-700"
                  : "hover:bg-gray-300 text-gray-800"
              }`}
            >
              {page}
            </button>
          ))}

          {showEndEllipsis && (
            <div className="flex justify-center items-center">
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-1 md:px-2 relative -bottom-1  opacity-50">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              )}
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                  currentPage === totalPages
                    ? "bg-blue-600 "
                    : isDark
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-300 text-gray-800"
                }`}
              >
                {totalPages}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed ${
              isDark
                ? "hover:bg-gray-700"
                : "text-black disabled:text-gray-600 disabled:hover:bg-gray-300 hover:bg-gray-300"
            } ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Pagination;

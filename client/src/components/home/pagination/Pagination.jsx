import { useForm } from "react-hook-form";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  totalPages = 5,
  isDark,
  currentPage = 1,
  pageFilter,
}) => {
  const { register, setValue, handleSubmit, watch } = useForm({
    defaultValues: { page: currentPage },
  });

  const selectedPage = watch("page");

  const onSubmit = (data) => {
    pageFilter(Number(data.page)); // Call parent function with selected page
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`fixed bottom-0 left-0 w-full z-50 ${isDark ? 'bg-gray-500/10 backdrop-blur-2xl' : 'bg-gray-400/10 backdrop-blur-2xl text-black'} flex justify-center items-center space-x-4 py-4 shadow-md`}
    >
      <input type="hidden" {...register("page")} />

      {/* Previous Arrow */}
      <button
        type="button"
        onClick={() => {
          setValue("page", Math.max(1, selectedPage - 1));
          handleSubmit(onSubmit)();
        }}
        disabled={selectedPage === 1}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? "hover:bg-gray-700" : "hover:bg-gray-400"
        } ${selectedPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          type="button"
          key={page}
          onClick={() => {
            setValue("page", page);
            handleSubmit(onSubmit)();
          }}
          className={`px-3 py-1 rounded-lg transition-colors ${
            selectedPage === page
              ? "bg-blue-600 text-white"
              : isDark
              ? "hover:bg-gray-700"
              : "hover:bg-gray-300"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Arrow */}
      <button
        type="button"
        onClick={() => {
          setValue("page", Math.min(totalPages, selectedPage + 1));
          handleSubmit(onSubmit)();
        }}
        disabled={selectedPage === totalPages}
        className={`p-2 rounded-lg transition-colors ${
          isDark ? "hover:bg-gray-700" : "hover:bg-gray-300"
        } ${
          selectedPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </form>
  );
};

export default Pagination;

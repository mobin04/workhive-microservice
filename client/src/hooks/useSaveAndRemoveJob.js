import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

export default function useSaveAndRemoveJob(mutationFn, refetch) {
  const [pendingJobs, setPendingJobs] = useState({});

  const mutation = useMutation({
    mutationFn,
    onError: (err) => console.error("Save failed:", err),
  });

  const handleSave = async (id) => {
    setPendingJobs((prev) => ({ ...prev, [id]: true }));
    try {
      await mutation.mutateAsync(id);
      await refetch();
    } finally {
      setPendingJobs((prev) => ({ ...prev, [id]: false }));
    }
  };

  return {
    handleSave,
    pendingJobs,
  };
}
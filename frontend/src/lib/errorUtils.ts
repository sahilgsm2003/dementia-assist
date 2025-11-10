// Helper function to extract error message from API responses
export const getErrorMessage = (error: any): string => {
  if (!error?.response?.data) {
    return error?.message || "An unexpected error occurred";
  }

  const data = error.response.data;
  
  // Handle FastAPI validation errors (422) - array of validation errors
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((err: any) => {
        if (typeof err === "string") return err;
        if (err.msg) {
          const field = err.loc?.slice(-1)[0] || "Field";
          return `${field}: ${err.msg}`;
        }
        return JSON.stringify(err);
      })
      .join(", ");
  }
  
  // Handle simple string error messages
  if (typeof data.detail === "string") {
    return data.detail;
  }
  
  // Handle object error messages
  if (data.detail && typeof data.detail === "object") {
    return JSON.stringify(data.detail);
  }
  
  // Fallback
  return error.message || "An error occurred";
};


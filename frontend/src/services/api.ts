import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove from storage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      // Redirect to login page
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await api.post("/token", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  register: async (username: string, password: string) => {
    const response = await api.post("/users/", {
      username,
      password,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },
};

// Chat/RAG API functions
export const chatAPI = {
  sendQuestion: async (question: string) => {
    const response = await api.post("/rag/chat/query", { question });
    return response;
  },

  getChatHistory: async (limit?: number) => {
    const params = limit ? { limit } : {};
    const response = await api.get("/rag/chat/history", { params });
    return response;
  },

  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/rag/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  getDocuments: async () => {
    const response = await api.get("/rag/documents/");
    return response;
  },

  deleteDocument: async (documentId: number) => {
    const response = await api.delete(`/rag/documents/${documentId}`);
    return response;
  },

  resetKnowledgeBase: async () => {
    const response = await api.delete("/rag/knowledge-base/reset");
    return response;
  },

  initializeDemo: async () => {
    const response = await api.post("/rag/initialize-demo");
    return response;
  },
};

// Memory Vault API
export const memoriesAPI = {
  uploadPhoto: async (formData: FormData) => {
    const response = await api.post("/memories/photos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  listPhotos: async () => {
    const response = await api.get("/memories/photos");
    return response.data;
  },

  searchByPhoto: async (formData: FormData) => {
    const response = await api.post("/memories/photos/search", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Reminders API
export const remindersAPI = {
  listReminders: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await api.get("/reminders/", { params });
    return response.data;
  },

  createReminder: async (payload: {
    title: string;
    description?: string;
    date: string;
    time: string;
    notification_sound?: string | null;
  }) => {
    const response = await api.post("/reminders/", payload);
    return response.data;
  },

  updateReminder: async (
    reminderId: number,
    payload: Partial<{
      title: string;
      description: string;
      date: string;
      time: string;
      notification_sound?: string | null;
    }>
  ) => {
    const response = await api.put(`/reminders/${reminderId}`, payload);
    return response.data;
  },

  deleteReminder: async (reminderId: number) => {
    await api.delete(`/reminders/${reminderId}`);
  },

  completeReminder: async (reminderId: number) => {
    const response = await api.post(`/reminders/${reminderId}/complete`);
    return response.data;
  },

  snoozeReminder: async (reminderId: number, minutes: number = 5) => {
    const response = await api.post(`/reminders/${reminderId}/snooze`, null, {
      params: { snooze_minutes: minutes },
    });
    return response.data;
  },
};

// Locations API
export const locationsAPI = {
  listPlaces: async () => {
    const response = await api.get("/locations/");
    return response.data;
  },

  createPlace: async (payload: {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
  }) => {
    const response = await api.post("/locations/", payload);
    return response.data;
  },

  updatePlace: async (
    placeId: number,
    payload: Partial<{
      name: string;
      description: string;
      latitude: number;
      longitude: number;
    }>
  ) => {
    const response = await api.patch(`/locations/${placeId}`, payload);
    return response.data;
  },

  deletePlace: async (placeId: number) => {
    await api.delete(`/locations/${placeId}`);
  },

  getLiveLocation: async () => {
    const response = await api.get("/locations/live");
    return response.data;
  },

  updateLiveLocation: async (payload: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  }) => {
    const response = await api.post("/locations/live", payload);
    return response.data;
  },
};

export default api;

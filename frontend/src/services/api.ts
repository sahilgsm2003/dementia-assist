import axios from "axios";
import { navigateTo } from "@/lib/navigation";
import { API_ENDPOINTS } from "@/lib/constants";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
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
      // Redirect to login page using navigation helper
      navigateTo("/auth");
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
    date?: string;
    time?: string;
    notification_sound?: string;
    reminder_type?: string;
    trigger_conditions?: Record<string, unknown>;
  }) => {
    const response = await api.post(API_ENDPOINTS.REMINDERS.CREATE, payload);
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

// Medications API
export const medicationsAPI = {
  listMedications: async () => {
    const response = await api.get("/medications/");
    return response.data;
  },

  getTodayMedications: async () => {
    const response = await api.get("/medications/today");
    return response.data;
  },

  createMedication: async (payload: {
    name: string;
    dosage: string;
    frequency: string;
    time: string; // HH:MM format
    times?: string[];
    purpose?: string;
    doctor_name?: string;
    pharmacy?: string;
    refill_date?: string;
  }) => {
    // Convert time string to time object
    const [hours, minutes] = payload.time.split(":");
    const timeObj = `${hours}:${minutes}:00`;

    const response = await api.post("/medications/", {
      ...payload,
      time: timeObj,
    });
    return response.data;
  },

  updateMedication: async (
    medicationId: number,
    payload: Partial<{
      name: string;
      dosage: string;
      frequency: string;
      time: string;
      times: string[];
      purpose: string;
      doctor_name: string;
      pharmacy: string;
      refill_date: string;
    }>
  ) => {
    // Remove undefined and empty string values
    const updatePayload: Record<string, unknown> = {};
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        updatePayload[key] = value;
      }
    });

    // Convert time string to HH:MM:SS format if provided
    if (updatePayload.time && typeof updatePayload.time === "string") {
      const [hours, minutes] = updatePayload.time.split(":");
      updatePayload.time = `${hours}:${minutes}:00`;
    }

    const response = await api.put(
      `/medications/${medicationId}`,
      updatePayload
    );
    return response.data;
  },

  deleteMedication: async (medicationId: number) => {
    await api.delete(`/medications/${medicationId}`);
  },

  trackMedication: async (
    medicationId: number,
    taken: boolean,
    date?: string
  ) => {
    const response = await api.post(`/medications/${medicationId}/track`, {
      taken,
      date,
    });
    return response.data;
  },
};

// Emergency Info API
export const emergencyAPI = {
  getEmergencyInfo: async () => {
    const response = await api.get("/emergency/");
    return response.data;
  },

  createEmergencyInfo: async (payload: {
    person_name: string;
    emergency_contacts: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
    medical_conditions?: string;
    allergies?: string;
    medications?: string;
    doctor_name?: string;
    doctor_phone?: string;
    home_address?: string;
  }) => {
    const response = await api.post("/emergency/", payload);
    return response.data;
  },

  updateEmergencyInfo: async (payload: {
    person_name?: string;
    emergency_contacts?: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
    medical_conditions?: string;
    allergies?: string;
    medications?: string;
    doctor_name?: string;
    doctor_phone?: string;
    home_address?: string;
  }) => {
    const response = await api.put("/emergency/", payload);
    return response.data;
  },
};

// Voice Notes API
export const voiceNotesAPI = {
  createVoiceNote: async (
    audioBlob: Blob,
    metadata?: {
      memory_id?: number;
      person_id?: string;
      reminder_id?: number;
      description?: string;
    }
  ) => {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "voice-note.webm");
    if (metadata?.memory_id) {
      formData.append("memory_id", metadata.memory_id.toString());
    }
    if (metadata?.person_id) {
      formData.append("person_id", metadata.person_id);
    }
    if (metadata?.reminder_id) {
      formData.append("reminder_id", metadata.reminder_id.toString());
    }
    if (metadata?.description) {
      formData.append("description", metadata.description);
    }

    const response = await api.post(
      API_ENDPOINTS.VOICE_NOTES.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getVoiceNote: async (voiceNoteId: number) => {
    const response = await api.get(
      API_ENDPOINTS.VOICE_NOTES.GET(voiceNoteId.toString()),
      {
        responseType: "blob",
      }
    );
    // Return blob URL for playback
    const blob = response.data;
    return URL.createObjectURL(blob);
  },

  listVoiceNotes: async (filters?: {
    memory_id?: number;
    person_id?: string;
    reminder_id?: number;
  }) => {
    const params = filters || {};
    const response = await api.get(API_ENDPOINTS.VOICE_NOTES.LIST, { params });
    return response.data;
  },

  deleteVoiceNote: async (voiceNoteId: number) => {
    await api.delete(API_ENDPOINTS.VOICE_NOTES.DELETE(voiceNoteId.toString()));
  },
};

// Quick Facts API
export const quickFactsAPI = {
  getQuickFacts: async () => {
    const response = await api.get(API_ENDPOINTS.QUICK_FACTS.GET);
    return response.data;
  },

  updateQuickFacts: async (facts: {
    name?: string;
    address?: string;
    birthday?: string;
    phone?: string;
  }) => {
    const response = await api.put(API_ENDPOINTS.QUICK_FACTS.UPDATE, facts);
    return response.data;
  },
};

// Search API
export const searchAPI = {
  globalSearch: async (query: string, types?: string[]) => {
    const params: Record<string, string> = { q: query };
    if (types && types.length > 0) {
      params.type = types.join(",");
    }
    const response = await api.get(API_ENDPOINTS.SEARCH.GLOBAL, { params });
    return response.data;
  },
};

// Family API
export const familyAPI = {
  inviteMember: async (data: {
    username?: string;
    email?: string;
    role?: string;
  }) => {
    const response = await api.post(API_ENDPOINTS.FAMILY.INVITE, data);
    return response.data;
  },

  listMembers: async () => {
    const response = await api.get(API_ENDPOINTS.FAMILY.MEMBERS);
    return response.data;
  },

  getActivity: async (limit: number = 20) => {
    const response = await api.get(API_ENDPOINTS.FAMILY.ACTIVITY, {
      params: { limit },
    });
    return response.data;
  },

  acceptInvite: async (memberId: number) => {
    const response = await api.post(
      API_ENDPOINTS.FAMILY.ACCEPT_INVITE(memberId)
    );
    return response.data;
  },

  removeMember: async (memberId: number) => {
    await api.delete(API_ENDPOINTS.FAMILY.REMOVE_MEMBER(memberId));
  },
};

export default api;

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

// Family API functions
export const familyAPI = {
  getMembers: async () => {
    const response = await api.get("/family/members/");
    return response.data;
  },

  createMember: async (memberData: {
    name: string;
    relationship_name?: string | null;
  }) => {
    const response = await api.post("/family/members/", memberData);
    return response.data;
  },

  deleteMember: async (memberId: number) => {
    const response = await api.delete(`/family/members/${memberId}`);
    return response.data;
  },

  uploadPhoto: async (memberId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/family/members/${memberId}/photos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};

// Quiz API functions
export const quizAPI = {
  getQuestion: async () => {
    const response = await api.get("/quiz/question");
    return response.data;
  },

  submitAnswer: async (
    promptedFamilyMemberId: number,
    selectedFamilyMemberId: number
  ) => {
    const response = await api.post("/quiz/answer", {
      prompted_family_member_id: promptedFamilyMemberId,
      selected_family_member_id: selectedFamilyMemberId,
    });
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

  getKnowledgeBaseStats: async () => {
    const response = await api.get("/rag/knowledge-base/stats");
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

export default api;

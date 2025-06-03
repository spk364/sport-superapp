import { create } from "zustand";
import { Client, TrainingSession, Payment, TrainingProgram, ChatMessage } from "../types";
import { mockClients, mockSessions, mockPayments, mockMessages, mockPrograms } from "../data/mockData";

interface AppState {
  clients: Client[];
  sessions: TrainingSession[];
  payments: Payment[];
  programs: TrainingProgram[];
  messages: ChatMessage[];
  selectedClientId: string | null;

  initializeData: () => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  setSelectedClient: (id: string | null) => void;
  
  addSession: (session: TrainingSession) => void;
  updateSession: (id: string, updates: Partial<TrainingSession>) => void;
  
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  
  addProgram: (program: TrainingProgram) => void;
  updateProgram: (id: string, updates: Partial<TrainingProgram>) => void;
  
  addMessage: (message: ChatMessage) => void;
  markMessageAsRead: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  clients: [],
  sessions: [],
  payments: [],
  programs: [],
  messages: [],
  selectedClientId: null,

  initializeData: () => set({
    clients: mockClients,
    sessions: mockSessions,
    payments: mockPayments,
    programs: mockPrograms,
    messages: mockMessages
  }),

  addClient: (client) => set((state) => ({
    clients: [...state.clients, client]
  })),

  updateClient: (id, updates) => set((state) => ({
    clients: state.clients.map((client) =>
      client.id === id ? { ...client, ...updates } : client
    )
  })),

  setSelectedClient: (id) => set({ selectedClientId: id }),

  addSession: (session) => set((state) => ({
    sessions: [...state.sessions, session]
  })),

  updateSession: (id, updates) => set((state) => ({
    sessions: state.sessions.map((session) =>
      session.id === id ? { ...session, ...updates } : session
    )
  })),

  addPayment: (payment) => set((state) => ({
    payments: [...state.payments, payment]
  })),

  updatePayment: (id, updates) => set((state) => ({
    payments: state.payments.map((payment) =>
      payment.id === id ? { ...payment, ...updates } : payment
    )
  })),

  addProgram: (program) => set((state) => ({
    programs: [...state.programs, program]
  })),

  updateProgram: (id, updates) => set((state) => ({
    programs: state.programs.map((program) =>
      program.id === id ? { ...program, ...updates } : program
    )
  })),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  markMessageAsRead: (id) => set((state) => ({
    messages: state.messages.map((message) =>
      message.id === id ? { ...message, read: true } : message
    )
  }))
}));

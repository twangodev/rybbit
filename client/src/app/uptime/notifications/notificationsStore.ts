import { create } from "zustand";
import { NotificationChannel } from "@/api/uptime/notifications";

type ChannelType = NotificationChannel["type"];

interface NotificationsStore {
  // Dialog state
  isDialogOpen: boolean;
  selectedType: ChannelType | null;
  
  // Actions
  openDialog: (type: ChannelType) => void;
  closeDialog: () => void;
  resetForm: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  // Initial state
  isDialogOpen: false,
  selectedType: null,
  
  // Actions
  openDialog: (type) => set({ isDialogOpen: true, selectedType: type }),
  
  closeDialog: () => set({ isDialogOpen: false }),
  
  resetForm: () => 
    set({ 
      selectedType: null 
    }),
}));
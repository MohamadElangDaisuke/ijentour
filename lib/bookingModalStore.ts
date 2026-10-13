'use client';

import { create } from 'zustand';

export interface BookingModalInitialData {
  packageName?: string;
  tourDate?: string;
  participants?: number;
  pickupLocation?: string;
  fullName?: string;
  nationality?: string;
  email?: string;
  whatsapp?: string;
  specialRequests?: string;
}

interface BookingModalStore {
  isOpen: boolean;
  initialData: BookingModalInitialData;
  openBookingModal: (data?: BookingModalInitialData) => void;
  closeBookingModal: () => void;
}

export const useBookingModal = create<BookingModalStore>((set) => ({
  isOpen: false,
  initialData: {},
  openBookingModal: (data = {}) => set({ isOpen: true, initialData: data }),
  closeBookingModal: () => set({ isOpen: false, initialData: {} }),
}));

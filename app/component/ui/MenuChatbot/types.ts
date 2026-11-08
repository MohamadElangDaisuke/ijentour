export type ScreenType = "MAIN_MENU" | "SUBMENU" | "ITEM_SELECT" | "ANSWER" | "WHATSAPP";
export type MenuAction = "MAIN_MENU" | "CATEGORY" | "ITEM_LIST" | "ITEM_DETAIL" | "FAQ_ANSWER" | "WHATSAPP_HANDOFF";
export type CategoryId = "destinations" | "packages" | "prices" | "booking" | "transport" | "safety" | "weather" | "about" | "support";

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  action: MenuAction;
  categoryId?: CategoryId;
  itemId?: string;
  subAction?: string;
}

export interface NavigationButton {
  label: string;
  action: "back" | "main_menu" | "whatsapp";
  whatsappLink?: string;
}

export interface PackageSummary {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: string;
  basePrice: number;
  duration: string;
  difficulty: string;
  badge?: string | null;
  coverImage: string;
  meetingPoint?: string | null;
  rating: number;
}

export interface DestinationSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  tag?: string | null;
  isFeatured: boolean;
}

export interface MenuChatbotRequest {
  action: MenuAction;
  categoryId?: CategoryId;
  itemId?: string;
  subAction?: string;
  context?: {
    selectedPackageTitle?: string;
    selectedDestinationName?: string;
    categoryId?: CategoryId;
  };
}

export interface MenuChatbotResponse {
  screen: ScreenType;
  title: string;
  subtitle?: string;
  answerText?: string;
  menuItems?: MenuItem[];
  packages?: PackageSummary[];
  destinations?: DestinationSummary[];
  navigation: NavigationButton[];
  whatsappLink?: string;
  whatsappMessage?: string;
  error?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: MenuChatbotResponse;
  error?: string;
}

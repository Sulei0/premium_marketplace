export const ROUTE_PATHS = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/product/:id",
  PROFILE: "/profile/:id",
  CHATS: "/messages",
  CHAT_DETAIL: "/messages/:id",
} as const;

export interface User {
  id: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  whisperCount: number;
  location: string;
  joinedDate: string;
  bio?: string;
}

export interface ProductExtra {
  id: string;
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  seller: User;
  price: number;
  story: string;
  images: string[];
  category: "Çorap" | "İç Giyim" | "Aksesuar" | "Özel Parçalar";
  isVerified: boolean;
  baseDuration: number;
  maxDuration: number;
  availableExtras: ProductExtra[];
  stats: {
    views: number;
    likes: number;
  };
}

export interface CartItem {
  cartId: string;
  product: Product;
  selectedDuration: number;
  selectedExtras: ProductExtra[];
  totalPrice: number;
  personalNote?: string;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const cn = (...classes: (string | undefined | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export const getProductPath = (id: string): string => {
  return ROUTE_PATHS.PRODUCT_DETAIL.replace(":id", id);
};

export const getProfilePath = (id: string): string => {
  return ROUTE_PATHS.PROFILE.replace(":id", id);
};

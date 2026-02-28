/**
 * Giyenden — Merkezi Kategori Yapılandırması
 * 
 * Tüm kategori tanımları bu dosyada yapılır.
 * AddProductModal, Products sayfası ve diğer bileşenler bu dosyayı kullanır.
 * 
 * Mevcut ilanlar için eski kategoriler (İç Giyim, Çorap, Aksesuar, Özel Parçalar, Diğer)
 * otomatik olarak yeni yapıya map'lenir.
 */

export interface CategoryDefinition {
    id: string;
    label: string;
    icon: string;
}

/**
 * Ana kategori listesi — ilan verirken ve filtrelerken kullanılır
 */
export const CATEGORIES: CategoryDefinition[] = [
    { id: "ust_giyim", label: "Üst Giyim", icon: "👕" },
    { id: "alt_giyim", label: "Alt Giyim", icon: "👖" },
    { id: "elbise", label: "Elbise & Tulum", icon: "👗" },
    { id: "dis_giyim", label: "Dış Giyim", icon: "🧥" },
    { id: "ayakkabi", label: "Ayakkabı", icon: "👠" },
    { id: "canta", label: "Çanta", icon: "👜" },
    { id: "aksesuar", label: "Aksesuar & Takı", icon: "💍" },
    { id: "spor", label: "Spor & Athleisure", icon: "🏃" },
    { id: "ic_giyim", label: "İç Giyim & Pijama", icon: "🌙" },
    { id: "diger", label: "Diğer", icon: "✨" },
];

/**
 * Kategori label'ları — select dropdown ve filtre butonlarında kullanılır
 */
export const CATEGORY_LABELS = CATEGORIES.map(c => c.label);

/**
 * "Tümü" dahil label listesi — filtre sayfalarında kullanılır
 */
export const CATEGORY_LABELS_WITH_ALL = ["Tümü", ...CATEGORY_LABELS] as const;

/**
 * Eski kategori → yeni kategori eşleme tablosu
 * 
 * Mevcut ilanların eski kategorileri (İç Giyim, Çorap, Aksesuar, Özel Parçalar)
 * bu tablo üzerinden yeni label'lara çevrilir.
 * Bilinmeyen bir kategori gelirse "Diğer" olarak gösterilir.
 */
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
    "İç Giyim": "İç Giyim & Pijama",
    "Çorap": "Aksesuar & Takı",
    "Aksesuar": "Aksesuar & Takı",
    "Özel Parçalar": "Diğer",
    "Diğer": "Diğer",
};

/**
 * Bir kategori label'ını normalize eder.
 * Eski kategoriler yeni karşılığına dönüştürülür.
 * Zaten yeni sistemde olan kategoriler olduğu gibi döner.
 */
export function normalizeCategoryLabel(raw: string): string {
    // Zaten yeni sistemde mi?
    if (CATEGORY_LABELS.includes(raw)) return raw;
    // Eski sistemden mi?
    if (raw in LEGACY_CATEGORY_MAP) return LEGACY_CATEGORY_MAP[raw];
    // Bilinmeyen → Diğer
    return "Diğer";
}

/**
 * Belirli bir label için icon döner
 */
export function getCategoryIcon(label: string): string {
    const normalized = normalizeCategoryLabel(label);
    return CATEGORIES.find(c => c.label === normalized)?.icon ?? "✨";
}

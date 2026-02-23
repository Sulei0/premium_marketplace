import { Product } from "@/lib/index";
import { IMAGES } from "@/assets/images";

/**
 * Giyenden Pazaryeri için örnek ürün verileri.
 * Kadınlara özel 2. el moda platformu.
 */
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "giy-001",
    name: "Vintage Denim Ceket",
    seller: {
      id: "seller-1",
      username: "Stil_Avcisi",
      avatar: IMAGES.ACCENT_GLOW_1,
      isVerified: true,
      rating: 4.9,
      whisperCount: 156,
      location: "İstanbul, Nişantaşı",
      joinedDate: "2025-05-12",
      bio: "Gardırobumu yenilerken, en sevdiklerimi sizinle paylaşıyorum."
    },
    price: 450,
    story: "Bu vintage denim ceket, Kadıköy'deki bir butikten yıllar önce aldığım en sevdiğim parçaydı. Her mevsim kombinlerimin vazgeçilmeziydi. Artık yeni bir gardıroba taşınma vakti geldi. Kalitesi ve dokusu hâlâ ilk günkü gibi.",
    images: [IMAGES.PRODUCT_BG_1, IMAGES.TEXTURE_BG_1, IMAGES.TEXTURE_BG_5],
    category: "İç Giyim",
    isVerified: true,
    baseDuration: 1,
    maxDuration: 7,
    availableExtras: [
      {
        id: "ex-1",
        label: "Detaylı Ürün Fotoğrafı (4K)",
        price: 50
      },
      {
        id: "ex-2",
        label: "Hediye Paketi",
        price: 100
      },
      {
        id: "ex-3",
        label: "El Yazısı Not",
        price: 30
      }
    ],
    stats: {
      views: 2450,
      likes: 312
    }
  },
  {
    id: "giy-002",
    name: "İpek Bluz - Pastel Tonlar",
    seller: {
      id: "seller-2",
      username: "Moda_Dolabi",
      avatar: IMAGES.ACCENT_GLOW_2,
      isVerified: true,
      rating: 4.7,
      whisperCount: 89,
      location: "Ankara, Çankaya",
      joinedDate: "2025-08-20",
      bio: "Minimalist ve zamansız parçalar koleksiyonum."
    },
    price: 350,
    story: "Pastel tonlardaki bu ipek bluz, ofis kombinlerimde şıklığımı tamamlayan parçaydı. Harika bir dokuya sahip ve neredeyse hiç giyilmedi. İş hayatından casual şıklığa kadar her yerde kullanabilirsiniz.",
    images: [IMAGES.PRODUCT_BG_2, IMAGES.TEXTURE_BG_2],
    category: "Çorap",
    isVerified: true,
    baseDuration: 2,
    maxDuration: 5,
    availableExtras: [
      {
        id: "ex-4",
        label: "Kombin Önerisi Fotoğrafları",
        price: 50
      },
      {
        id: "ex-5",
        label: "Özel Kutu Paketi",
        price: 75
      }
    ],
    stats: {
      views: 1890,
      likes: 245
    }
  },
  {
    id: "giy-003",
    name: "Bohem Tarz Maksi Etek",
    seller: {
      id: "seller-3",
      username: "Vintage_Ruh",
      avatar: IMAGES.ACCENT_GLOW_3,
      isVerified: false,
      rating: 4.5,
      whisperCount: 42,
      location: "İzmir, Karşıyaka",
      joinedDate: "2026-01-05",
      bio: "Doğal kumaşları ve vintage parçaları seviyorum."
    },
    price: 280,
    story: "Bu maksi etek, yaz akşamları sahilde yürüyüşlerime eşlik etti. Hafif kumaşı ve bohem desenleri her zaman iltifat aldı. Gardırobumu sadeleştirirken seninle paylaşmak istedim.",
    images: [IMAGES.PRODUCT_BG_3, IMAGES.TEXTURE_BG_3, IMAGES.TEXTURE_BG_7],
    category: "İç Giyim",
    isVerified: true,
    baseDuration: 1,
    maxDuration: 3,
    availableExtras: [
      {
        id: "ex-6",
        label: "Detaylı Durum Fotoğrafı",
        price: 30
      },
      {
        id: "ex-7",
        label: "Hızlı Kargo (1 Gün)",
        price: 75
      }
    ],
    stats: {
      views: 3100,
      likes: 567
    }
  },
  {
    id: "giy-004",
    name: "Deri Omuz Çantası",
    seller: {
      id: "seller-4",
      username: "Chic_Corner",
      avatar: IMAGES.ACCENT_GLOW_4,
      isVerified: true,
      rating: 5.0,
      whisperCount: 210,
      location: "Antalya",
      joinedDate: "2024-11-30",
      bio: "Kaliteli ve zamansız aksesuarlar koleksiyonum."
    },
    price: 600,
    story: "Bu hakiki deri omuz çantası, özel bir tasarımcı markasına ait. Geniş iç hacmi ve zarif dikişleriyle günlük kullanımdan iş toplantılarına kadar her yere uyum sağlar. Çok az kullanıldı, neredeyse sıfır durumunda.",
    images: [IMAGES.PRODUCT_BG_4, IMAGES.TEXTURE_BG_4],
    category: "Aksesuar",
    isVerified: true,
    baseDuration: 1,
    maxDuration: 10,
    availableExtras: [
      {
        id: "ex-8",
        label: "Orijinallik Belgesi Fotoğrafı",
        price: 30
      }
    ],
    stats: {
      views: 4500,
      likes: 890
    }
  },
  {
    id: "giy-005",
    name: "Triko Hırka - Oversize",
    seller: {
      id: "seller-5",
      username: "Pastel_Gardrop",
      avatar: IMAGES.ACCENT_GLOW_5,
      isVerified: true,
      rating: 4.8,
      whisperCount: 134,
      location: "Muğla, Bodrum",
      joinedDate: "2025-03-15",
      bio: "Rahat ve şık parçalarla gardırobunuzu yenileyin."
    },
    price: 320,
    story: "Yumuşacık dokusuyla kış aylarında en çok tercih ettiğim parçaydı. Oversize kalıbı sayesinde her beden için uygun. Kahve içerken, kitap okurken, yürüyüşe çıkarken hep yanımdaydı. Sıcacık bir arkadaş arıyorsa, doğru adres burası.",
    images: [IMAGES.PRODUCT_BG_5, IMAGES.TEXTURE_BG_8],
    category: "Özel Parçalar",
    isVerified: true,
    baseDuration: 1,
    maxDuration: 4,
    availableExtras: [
      {
        id: "ex-9",
        label: "Hediye Paketi",
        price: 50
      },
      {
        id: "ex-10",
        label: "El Yazısı Teşekkür Notu",
        price: 20
      }
    ],
    stats: {
      views: 2200,
      likes: 421
    }
  }
];
import { Product } from "@/lib/index";
import { IMAGES } from "@/assets/images";

/**
 * Giyenden Pazaryeri için örnek ürün verileri.
 * Dijital Boudoir atmosferine uygun, hikaye odaklı ve premium içerikler.
 */
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "giy-001",
    name: "Gece Yarısı Danteli",
    seller: {
      id: "seller-1",
      username: "Gece_Perisi",
      avatar: IMAGES.ACCENT_GLOW_1,
      isVerified: true,
      rating: 4.9,
      whisperCount: 156,
      location: "İstanbul, Nişantaşı",
      joinedDate: "2025-05-12",
      bio: "Zarafet ve gizemin buluştuğu noktada, tenine değen her dokunuşun bir hikayesi var."
    },
    price: 1850,
    story: "Bu siyah dantel takım, yağmurlu bir İstanbul gecesinde mum ışığında bana eşlik etti. Tenimdeki sıcaklığı ve o gecenin huzurunu üzerinde taşıyor. Kumaşın yumuşaklığı, ipek çarşaflar arasındaki o sessiz anları hatırlatıyor. Sadece bir kıyafet değil, yaşanmış bir anın yansıması.",
    images: [IMAGES.PRODUCT_BG_1, IMAGES.TEXTURE_BG_1, IMAGES.TEXTURE_BG_5],
    category: "İç Giyim",
    isVerified: true,
    baseDuration: 1,
    maxDuration: 7,
    availableExtras: [
      {
        id: "ex-1",
        label: "Hazırlık Videosu (4K)",
        price: 750
      },
      {
        id: "ex-2",
        label: "Özel Parfüm İmzası",
        price: 200
      },
      {
        id: "ex-3",
        label: "El Yazısı Not",
        price: 100
      }
    ],
    stats: {
      views: 2450,
      likes: 312
    }
  },
  {
    id: "giy-002",
    name: "İpek Dokunuşlu Dizüstü",
    seller: {
      id: "seller-2",
      username: "Siyah_Kugu",
      avatar: IMAGES.ACCENT_GLOW_2,
      isVerified: true,
      rating: 4.7,
      whisperCount: 89,
      location: "Ankara, Çankaya",
      joinedDate: "2025-08-20",
      bio: "Klasik tarzın kışkırtıcı detaylarla birleşimi."
    },
    price: 950,
    story: "İncecik dokusuyla bacaklarımı saran bu çoraplar, yoğun bir iş gününün ardından akşam yemeğinde bana eşlik etti. Topuklu ayakkabıların içindeki o baskıyı ve tenimin ipekle olan dansını hissettim. Şimdi bu yoğun enerjiyi seninle paylaşıyorum.",
    images: [IMAGES.PRODUCT_BG_2, IMAGES.TEXTURE_BG_2],
    category: "Çorap",
    isVerified: true,
    baseDuration: 2,
    maxDuration: 5,
    availableExtras: [
      {
        id: "ex-4",
        label: "Giyim Anı Fotoğrafı (3 Adet)",
        price: 300
      },
      {
        id: "ex-5",
        label: "Lüks Kutu Paketi",
        price: 150
      }
    ],
    stats: {
      views: 1890,
      likes: 245
    }
  },
  {
    id: "giy-003",
    name: "Kızıl Saten Gecelik",
    seller: {
      id: "seller-3",
      username: "Velvet_Muse",
      avatar: IMAGES.ACCENT_GLOW_3,
      isVerified: false,
      rating: 4.5,
      whisperCount: 42,
      location: "İzmir, Karşıyaka",
      joinedDate: "2026-01-05",
      bio: "Tutkunun rengini teninde hisset."
    },
    price: 2200,
    story: "Bu kızıl saten, en cesur anlarımda yanımdaydı. Parlaklığı loş ışıkta adeta bir ateş gibi parlıyor. Vücudumun hatlarını nazikçe takip eden bu parça, her hareketimde tenime fısıldayan bir rüzgar gibiydi. Senin için yeniden o enerjiyi yükleyeceğim.",
    images: [IMAGES.PRODUCT_BG_3, IMAGES.TEXTURE_BG_3, IMAGES.TEXTURE_BG_7],
    category: "İç Giyim",
    isVerified: true,
    baseDuration: 1,
    maxDuration: 3,
    availableExtras: [
      {
        id: "ex-6",
        label: "Polaroid Fotoğraf (Islak İmzalı)",
        price: 500
      },
      {
        id: "ex-7",
        label: "Özel Ses Kaydı",
        price: 400
      }
    ],
    stats: {
      views: 3100,
      likes: 567
    }
  },
  {
    id: "giy-004",
    name: "Deri Detaylı Boyunluk",
    seller: {
      id: "seller-4",
      username: "Aura_Mist",
      avatar: IMAGES.ACCENT_GLOW_4,
      isVerified: true,
      rating: 5.0,
      whisperCount: 210,
      location: "Antalya",
      joinedDate: "2024-11-30",
      bio: "Sınırları zorlamayı sevenler için özel koleksiyon."
    },
    price: 1400,
    story: "Yumuşak derinin soğuk metal ile buluşması... Bu aksesuar, otorite ve teslimiyetin ince çizgisinde yürüdüğüm bir geceden kalma. Boynumdaki o hafif baskı ve derinin kendine has kokusu hala üzerinde. Koleksiyonun en çarpıcı parçalarından biri.",
    images: [IMAGES.PRODUCT_BG_4, IMAGES.TEXTURE_BG_4],
    category: "Aksesuar",
    isVerified: true,
    baseDuration: 1,
    maxDuration: 10,
    availableExtras: [
      {
        id: "ex-8",
        label: "Kullanım Kanıtı (Kısa Video)",
        price: 600
      }
    ],
    stats: {
      views: 4500,
      likes: 890
    }
  },
  {
    id: "giy-005",
    name: "Tül ve Çiçekli Body",
    seller: {
      id: "seller-5",
      username: "Luna_Noir",
      avatar: IMAGES.ACCENT_GLOW_5,
      isVerified: true,
      rating: 4.8,
      whisperCount: 134,
      location: "Muğla, Bodrum",
      joinedDate: "2025-03-15",
      bio: "Doğallık ve kışkırtıcılığın transparan dengesi."
    },
    price: 1650,
    story: "Baharın tazeliğini ve vücudumun en saf halini temsil ediyor. Şeffaf dokusu hiçbir şeyi gizlemezken, çiçek nakışları hayal gücüne yer bırakıyor. Deniz kenarındaki evimde, rüzgarın içeri süzüldüğü o sakin öğleden sonra boyunca üzerimdeydi.",
    images: [IMAGES.PRODUCT_BG_5, IMAGES.TEXTURE_BG_8],
    category: "Özel Parçalar",
    isVerified: true,
    baseDuration: 1,
    maxDuration: 4,
    availableExtras: [
      {
        id: "ex-9",
        label: "Canlı Yayın Giyimi",
        price: 1500
      },
      {
        id: "ex-10",
        label: "Kurutulmuş Çiçekli Paket",
        price: 100
      }
    ],
    stats: {
      views: 2200,
      likes: 421
    }
  }
];
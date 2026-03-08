# Giyenden — Kadınlara Özel 2. El Moda Platformu

> **Kadın kadına, gardıroptan gardıroba.**

Giyenden, Türkiye'nin kadınlara özel butik ikinci el moda platformudur. Kullanıcılar gardıroplarındaki hazineleri güvenli bir ortamda alıp satabilir, kadın dayanışmasının gücüne güç katabilir.

🌐 **Canlı:** [https://giyenden.com](https://giyenden.com)

---

## 📌 Proje Hakkında

Giyenden, kadınların birbirleriyle güvenli ve şeffaf bir şekilde ikinci el moda ürünlerini alıp satabileceği bir marketplace'tir. Platform, butik bir deneyim sunmayı hedefler: onaylı gardıroplar, yüksek kaliteli ilan standartları ve topluluk odaklı bir yaklaşım.

### Temel Özellikler

- **Alıcı / Satıcı Rol Sistemi** — Kullanıcılar alıcı veya satıcı olarak kaydolabilir, roller arası geçiş yapabilir
- **Ürün İlan Yönetimi** — Çoklu fotoğraf yükleme, detaylı açıklama, kategori/beden/fiyat, ekstra hizmetler (hediye paketi, kombin önerisi vb.)
- **Gerçek Zamanlı Mesajlaşma** — Supabase Realtime ile alıcı-satıcı arası anlık sohbet
- **Teklif Sistemi** — Chat üzerinden fiyat teklifi gönderme/kabul etme
- **Favori & Beğeni** — Ürünleri favorilere ekleme, beğeni sayaçları
- **Takip Sistemi** — Satıcıları takip etme, takipçi/takip edilen sayaçları
- **Değerlendirme & Yorum** — Satıcıları puanlama ve yorum bırakma
- **Bildirim Sistemi** — Favori, takip, mesaj ve teklif bildirimleri
- **Admin Paneli** — Kullanıcı yönetimi, ürün onaylama, şikayet/rapor takibi, rozet yönetimi
- **Blog Sistemi** — Markdown destekli, zengin içerikli blog yayınlama altyapısı
- **Gelişmiş Kategori Yapısı** — Moda odaklı, detaylı ve ölçeklenebilir kategori/alt kategori sistemi
- **Görsel Optimizasyonu** — İstemci taraflı sıkıştırma ve Supabase Image Transformation ile yüksek performans
- **SEO Optimizasyonu** — Schema.org, Open Graph, canonical URL, dinamik sitemap
- **Google Analytics** — Ziyaretçi takibi (GA4)
- **Google OAuth** — Google hesabıyla giriş/kayıt
- **Responsive Tasarım** — Mobile-first, tüm cihazlara uyumlu
- **Dark Mode** — Varsayılan koyu tema ile premium görünüm

---
## 🛠️ Teknoloji Stack

### Frontend
| Teknoloji | Açıklama |
|---|---|
| **React 18** | Component tabanlı UI framework |
| **TypeScript** | Strict tip güvenliği |
| **Vite** | Hızlı geliştirme sunucusu ve build aracı |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **shadcn/ui** | Radix UI üzerine kurulu bileşen kütüphanesi |
| **Framer Motion** | Animasyon ve geçiş efektleri |
| **Lucide React** | İkon kütüphanesi |
| **React Router DOM v6** | Client-side routing |
| **TanStack React Query** | Server state yönetimi ve cache |
| **Zustand** | Hafif global state management |
| **React Hook Form + Zod** | Form yönetimi ve validasyon |
| **React Helmet Async** | Dinamik SEO meta tag yönetimi |

### Backend & Veritabanı
| Teknoloji | Açıklama |
|---|---|
| **Supabase** | Backend-as-a-Service (Auth, Database, Storage, Realtime, Edge Functions) |
| **PostgreSQL** | İlişkisel veritabanı (Supabase üzerinden) |
| **Row Level Security (RLS)** | Veritabanı seviyesinde erişim kontrolü |
| **Supabase Realtime** | WebSocket tabanlı gerçek zamanlı veri senkronizasyonu |
| **Supabase Storage** | Ürün ve profil görselleri için dosya depolama |
| **Supabase Edge Functions** | Sunucu taraflı iş mantığı (Deno runtime) |

### Deployment & Altyapı
| Teknoloji | Açıklama |
|---|---|
| **Vercel** | Frontend hosting ve CI/CD |
| **Google Analytics (GA4)** | Kullanıcı analitikleri |

---

## 📁 Proje Yapısı

```
src/
├── api/              # API katmanı ve veri tipleri
├── assets/           # Statik görseller ve kaynaklar
├── components/       # Yeniden kullanılabilir UI bileşenleri
│   ├── admin/        # Admin paneli bileşenleri
│   └── ui/           # shadcn/ui temel bileşenleri
├── contexts/         # React Context (Auth, Favorites, Follow, Notifications, Theme)
├── hooks/            # Custom hook'lar
├── lib/              # Yardımcı fonksiyonlar, Supabase client, sanitizasyon
├── pages/            # Sayfa bileşenleri (route bazlı)
│   ├── admin/        # Admin panel sayfaları
│   ├── dashboard/    # Satıcı dashboard
│   └── home/         # Ana sayfa alt bileşenleri
├── types/            # TypeScript tip tanımları
├── App.tsx           # Ana uygulama ve route tanımları
├── main.tsx          # Giriş noktası
└── index.css         # Global stiller ve Tailwind yapılandırması

supabase/
├── migrations/       # Veritabanı migration dosyaları
└── edge_function/    # Supabase Edge Functions
```

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya pnpm

### Adımlar

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Ortam değişkenlerini ayarla
# .env dosyasını düzenle:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 3. Geliştirme sunucusunu başlat
npm run dev
```

### Diğer Komutlar

```bash
npm run build        # Production build
npm run preview      # Build önizleme
npm run lint         # ESLint kontrolü
npm run sitemap      # Dinamik sitemap oluştur
```

---

## 🌐 Canlı Ortam

- **Web:** [https://giyenden.com](https://giyenden.com)
- **Hosting:** Vercel
- **Backend:** Supabase (managed PostgreSQL + Auth + Storage + Realtime)

---

## 📄 Yasal Sayfalar

- [Kullanım Koşulları](https://giyenden.com/terms)
- [Gizlilik Politikası](https://giyenden.com/privacy)
- [KVKK Aydınlatma Metni](https://giyenden.com/kvkk)

---

# Giyenden — Women-Only Second-Hand Fashion Marketplace

> **From wardrobe to wardrobe, woman to woman.**

Giyenden is Turkey's boutique second-hand fashion platform exclusively for women. Users can safely buy and sell pre-loved fashion items from their wardrobes.

🌐 **Live:** [https://giyenden.com](https://giyenden.com)

## About

Giyenden is a curated marketplace where women can exchange second-hand fashion items in a safe, transparent environment. The platform focuses on delivering a boutique experience with verified wardrobes, high-quality listing standards, and a community-first approach.

### Key Features

- **Buyer / Seller Role System** — Users register as buyer or seller, with easy role switching
- **Product Listing Management** — Multi-photo upload, detailed descriptions, category/size/price, extra services
- **Real-Time Messaging** — Instant buyer-seller chat via Supabase Realtime
- **Offer System** — Price negotiation through the chat interface
- **Favorites & Likes** — Save favorite products, like counters
- **Follow System** — Follow sellers, follower/following counts
- **Reviews & Ratings** — Rate and review sellers
- **Notification System** — Favorites, follow, message, and offer notifications
- **Admin Panel** — User management, product approval, reports, badge management
- **Blog System** — Markdown-supported, rich content blog infrastructure
- **Advanced Category Structure** — Fashion-focused, detailed, and scalable category system
- **Image Optimization** — Client-side compression and Supabase Image Transformation for fast-loading assets
- **SEO Optimized** — Schema.org, Open Graph, canonical URLs, dynamic sitemap
- **Google OAuth** — Sign in/up with Google
- **Responsive Design** — Mobile-first, all devices supported
- **Dark Mode** — Premium dark theme by default

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS 4, shadcn/ui, Framer Motion, React Router v6, TanStack Query, Zustand, Marked (Markdown)

**Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions, RLS)

**Deployment:** Vercel, Google Analytics (GA4)

## Getting Started

```bash
npm install
# Configure .env with Supabase credentials
npm run dev
```

## License

This project is proprietary. All rights reserved.
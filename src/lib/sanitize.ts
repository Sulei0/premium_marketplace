/**
 * Güvenlik: Input Sanitization & Validation
 * XSS saldırılarını, zararlı dosya yüklemelerini ve geçersiz verileri önler.
 */

// ─── Sabitler ───

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const DANGEROUS_EXTENSIONS = [
    "exe", "bat", "cmd", "msi", "dll", "scr", "com", "pif",
    "js", "jsx", "ts", "tsx", "html", "htm", "svg", "php",
    "py", "rb", "sh", "ps1", "vbs", "wsf",
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_PRICE = 1;
const MAX_PRICE = 1_000_000;

// ─── Metin Sanitizasyonu ───

/**
 * HTML tag'lerini temizler, zararlı karakter dizilerini kaldırır.
 * React zaten JSX'te escape yapar ama veritabanına kaydetmeden önce temizlemek best practice.
 */
export function sanitizeText(input: string): string {
    return input
        // HTML tag'lerini kaldır
        .replace(/<[^>]*>/g, "")
        // Script injection pattern'lerini kaldır
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        // Birden fazla boşluğu teke indir
        .replace(/\s+/g, " ")
        .trim();
}

// ─── Doğrulama Fonksiyonları ───

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Ürün başlığını doğrular ve sanitize eder.
 */
export function validateTitle(title: string): ValidationResult {
    const cleaned = sanitizeText(title);
    if (!cleaned || cleaned.length === 0) {
        return { valid: false, error: "Ürün adı boş olamaz." };
    }
    if (cleaned.length < 3) {
        return { valid: false, error: "Ürün adı en az 3 karakter olmalıdır." };
    }
    if (cleaned.length > MAX_TITLE_LENGTH) {
        return { valid: false, error: `Ürün adı en fazla ${MAX_TITLE_LENGTH} karakter olabilir.` };
    }
    return { valid: true };
}

/**
 * Ürün açıklamasını doğrular ve sanitize eder.
 */
export function validateDescription(description: string): ValidationResult {
    const cleaned = sanitizeText(description);
    if (!cleaned || cleaned.length === 0) {
        return { valid: false, error: "Açıklama boş olamaz." };
    }
    if (cleaned.length < 10) {
        return { valid: false, error: "Açıklama en az 10 karakter olmalıdır." };
    }
    if (cleaned.length > MAX_DESCRIPTION_LENGTH) {
        return { valid: false, error: `Açıklama en fazla ${MAX_DESCRIPTION_LENGTH} karakter olabilir.` };
    }
    return { valid: true };
}

/**
 * Fiyatı doğrular: Negatif, sıfır veya aşırı yüksek fiyatları reddeder.
 */
export function validatePrice(price: number | string): ValidationResult {
    const num = typeof price === "string" ? parseFloat(price) : price;

    if (isNaN(num)) {
        return { valid: false, error: "Geçerli bir fiyat giriniz." };
    }
    if (num < MIN_PRICE) {
        return { valid: false, error: `Fiyat en az ${MIN_PRICE} ₺ olmalıdır.` };
    }
    if (num > MAX_PRICE) {
        return { valid: false, error: `Fiyat en fazla ${MAX_PRICE.toLocaleString("tr-TR")} ₺ olabilir.` };
    }
    return { valid: true };
}

/**
 * Yüklenecek resim dosyasını doğrular:
 * - MIME tipi kontrolü
 * - Dosya uzantısı kontrolü
 * - Zararlı uzantılara karşı ek kontrol
 * - Dosya boyutu limiti (5MB)
 */
export function validateImageFile(file: File): ValidationResult {
    // 1. Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
        return { valid: false, error: `Dosya boyutu en fazla ${sizeMB} MB olabilir. ("${file.name}")` };
    }

    // 2. MIME tipi kontrolü
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `Sadece JPG, PNG ve WEBP dosyaları yüklenebilir. ("${file.name}" tipi: ${file.type || "bilinmiyor"})`,
        };
    }

    // 3. Dosya uzantısı kontrolü
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return {
            valid: false,
            error: `Geçersiz dosya uzantısı: .${extension}. Sadece .jpg, .png, .webp kabul edilir.`,
        };
    }

    // 4. Zararlı uzantı kontrolü (çift uzantı saldırısına karşı: foto.jpg.exe)
    const nameParts = file.name.split(".");
    for (const part of nameParts) {
        if (DANGEROUS_EXTENSIONS.includes(part.toLowerCase())) {
            return {
                valid: false,
                error: `Zararlı dosya uzantısı tespit edildi: "${file.name}". Bu dosya yüklenemez.`,
            };
        }
    }

    return { valid: true };
}

// ─── Yardımcılar ───

export { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MIN_PRICE, MAX_PRICE, MAX_FILE_SIZE_BYTES };

import { useState, useRef, useMemo } from "react";
import { X, Upload, ImagePlus, Loader2, Check, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/index";
import {
    sanitizeText,
    validateTitle,
    validateDescription,
    validatePrice,
    validateImageFile,
    MAX_TITLE_LENGTH,
    MAX_DESCRIPTION_LENGTH,
} from "@/lib/sanitize";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** If provided, open in EDIT mode with existing data */
    editProduct?: DbProductForEdit | null;
}

/** Shape of a DB product for editing */
export interface DbProductForEdit {
    id: string;
    user_id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    image_url: string | null;
    image_urls?: string[];
    base_duration: number;
    max_duration: number;
    extras: ExtraItem[];
}

interface ExtraItem {
    id: string;
    label: string;
    price: number;
    enabled: boolean;
}

const CATEGORIES = ["İç Giyim", "Çorap", "Aksesuar", "Özel Parçalar", "Diğer"];

const DEFAULT_EXTRAS: ExtraItem[] = [
    { id: "photo_proof", label: "Giyerken Fotoğraf Kanıtı", price: 50, enabled: false },
    { id: "perfume", label: "Özel Parfüm İsteği", price: 50, enabled: false },
    { id: "sport_wear", label: "Spor Yaparken Giyilsin", price: 100, enabled: false },
    { id: "video_proof", label: "Video Kanıtı", price: 200, enabled: false },
    { id: "handwritten", label: "El Yazılı Not Ekle", price: 30, enabled: false },
    { id: "rush_delivery", label: "Hızlı Kargo (1 Gün)", price: 75, enabled: false },
];

const PRICE_PER_DAY = 15; // ₺15/gün süre ek ücreti
const MAX_IMAGES = 5;

export function AddProductModal({ isOpen, onClose, editProduct }: AddProductModalProps) {
    const { user } = useAuth();
    const isEditMode = !!editProduct;

    const [title, setTitle] = useState(editProduct?.title ?? "");
    const [description, setDescription] = useState(editProduct?.description ?? "");
    const [basePrice, setBasePrice] = useState(editProduct?.price?.toString() ?? "");
    const [category, setCategory] = useState(editProduct?.category ?? CATEGORIES[0]);
    const [baseDuration, setBaseDuration] = useState(editProduct?.base_duration ?? 1);
    const [maxDuration, setMaxDuration] = useState(editProduct?.max_duration ?? 7);
    const [extras, setExtras] = useState<ExtraItem[]>(
        editProduct?.extras?.length ? editProduct.extras : DEFAULT_EXTRAS.map(e => ({ ...e }))
    );

    // Multi-image state
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>(
        editProduct?.image_urls?.length ? editProduct.image_urls :
            editProduct?.image_url ? [editProduct.image_url] : []
    );
    const [existingUrls, setExistingUrls] = useState<string[]>(
        editProduct?.image_urls?.length ? editProduct.image_urls :
            editProduct?.image_url ? [editProduct.image_url] : []
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Duration slider preview value
    const [previewDuration, setPreviewDuration] = useState(baseDuration);

    const enabledExtras = extras.filter(e => e.enabled);
    const extrasTotal = enabledExtras.reduce((s, e) => s + e.price, 0);
    const basePriceNum = parseFloat(basePrice) || 0;
    const durationExtra = (previewDuration - 1) * PRICE_PER_DAY;
    const totalPreview = basePriceNum + durationExtra + extrasTotal;

    if (!isOpen) return null;

    const totalImages = imagePreviews.length;
    const canAddMore = totalImages < MAX_IMAGES;

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const slotsLeft = MAX_IMAGES - totalImages;
        const filesToAdd = files.slice(0, slotsLeft);

        // Güvenlik: Her dosyayı doğrula (tip, boyut, uzantı)
        const validFiles: File[] = [];
        for (const file of filesToAdd) {
            const result = validateImageFile(file);
            if (!result.valid) {
                setError(result.error || "Geçersiz dosya.");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            validFiles.push(file);
        }

        const newFiles = [...imageFiles, ...validFiles];
        setImageFiles(newFiles);
        setError(null);

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (index: number) => {
        const preview = imagePreviews[index];
        const isExisting = existingUrls.includes(preview);

        setImagePreviews(prev => prev.filter((_, i) => i !== index));

        if (isExisting) {
            setExistingUrls(prev => prev.filter(url => url !== preview));
        } else {
            // Calculate which new file to remove
            const existingCount = existingUrls.filter(url => imagePreviews.indexOf(url) < index).length;
            const fileIndex = index - existingCount;
            setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
        }
    };

    const toggleExtra = (id: string) => {
        setExtras(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
    };

    const resetForm = () => {
        if (!isEditMode) {
            setTitle("");
            setDescription("");
            setBasePrice("");
            setCategory(CATEGORIES[0]);
            setBaseDuration(1);
            setMaxDuration(7);
            setExtras(DEFAULT_EXTRAS.map(e => ({ ...e })));
            setImageFiles([]);
            setImagePreviews([]);
            setExistingUrls([]);
            setPreviewDuration(1);
        }
        setError(null);
        setSuccess(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !user) {
            setError("Giriş yapmanız ve Supabase bağlantısı gerekiyor.");
            return;
        }

        // ── Güvenlik: Input Validation ──
        const titleResult = validateTitle(title);
        if (!titleResult.valid) { setError(titleResult.error!); return; }

        const descResult = validateDescription(description);
        if (!descResult.valid) { setError(descResult.error!); return; }

        const priceResult = validatePrice(basePrice);
        if (!priceResult.valid) { setError(priceResult.error!); return; }

        // Sanitize text inputs
        const cleanTitle = sanitizeText(title);
        const cleanDescription = sanitizeText(description);

        setLoading(true);
        setError(null);

        try {
            // Upload new image files
            const uploadedUrls: string[] = [...existingUrls];

            for (const file of imageFiles) {
                // Güvenlik: Upload öncesi son kontrol
                const fileCheck = validateImageFile(file);
                if (!fileCheck.valid) throw new Error(fileCheck.error);

                const fileExt = file.name.split(".").pop();
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("product-images")
                    .upload(fileName, file);
                if (uploadError) throw new Error("Görsel yüklenemedi: " + uploadError.message);
                const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
                uploadedUrls.push(urlData.publicUrl);
            }

            const productData = {
                title: cleanTitle,
                description: cleanDescription,
                price: basePriceNum,
                category,
                image_url: uploadedUrls[0] || null, // backward compat
                image_urls: uploadedUrls,
                base_duration: baseDuration,
                max_duration: maxDuration,
                extras: extras.filter(e => e.enabled).map(({ id, label, price }) => ({ id, label, price })),
            };

            if (isEditMode && editProduct) {
                // Update existing product
                const { error: updateError } = await supabase
                    .from("products")
                    .update(productData)
                    .eq("id", editProduct.id)
                    .eq("user_id", user.id);
                if (updateError) throw new Error("Ürün güncellenemedi: " + updateError.message);
            } else {
                // Insert new product
                const { error: insertError } = await supabase
                    .from("products")
                    .insert({ ...productData, user_id: user.id });
                if (insertError) throw new Error("Ürün eklenemedi: " + insertError.message);
            }

            setSuccess(true);
            setTimeout(() => {
                handleClose();
                window.location.reload();
            }, 1200);
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            {isEditMode ? "İlanı Düzenle" : "Ürün Sat / İlan Ver"}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1.5">
                            {isEditMode ? "Ürün bilgilerini güncelle" : "Ürününün hikayesini paylaş ve satışa çıkar."}
                        </p>
                    </div>

                    {/* Success State */}
                    {success ? (
                        <div className="text-center py-10">
                            <div className="text-5xl mb-4">🎉</div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {isEditMode ? "Ürün Güncellendi!" : "Ürün Başarıyla Eklendi!"}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {isEditMode ? "Değişiklikleriniz kaydedildi." : "İlanınız artık yayında."}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm text-center border border-red-500/30">
                                    {error}
                                </div>
                            )}

                            {/* Multi-Image Upload */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-gray-400 ml-1">Ürün Görselleri</label>
                                    <span className="text-[10px] text-gray-500 font-mono">{totalImages}/{MAX_IMAGES}</span>
                                </div>

                                {/* Image Preview Grid */}
                                <div className="grid grid-cols-5 gap-2">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10">
                                            <img src={preview} alt={`Görsel ${index + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                            {index === 0 && (
                                                <span className="absolute bottom-1 left-1 text-[8px] bg-pink-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                                                    KAPAK
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {/* Add More Button */}
                                    {canAddMore && (
                                        <div
                                            className="aspect-square border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-pink-500/40 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <ImagePlus className="w-5 h-5 text-gray-600 mb-1" />
                                            <span className="text-[9px] text-gray-500">Ekle</span>
                                        </div>
                                    )}
                                </div>

                                {totalImages === 0 && (
                                    <div
                                        className="border-2 border-dashed border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-pink-500/40 transition-colors group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                            <ImagePlus className="w-10 h-10 mb-3 text-gray-600" />
                                            <p className="text-sm font-medium text-gray-400">Tıklayarak görsel yükle</p>
                                            <p className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP (Maks. 5 görsel)</p>
                                        </div>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    className="hidden"
                                    onChange={handleImagesChange}
                                />
                            </div>

                            {/* Title + Category Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 ml-1">
                                        Ürün Adı <span className="text-pink-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={MAX_TITLE_LENGTH}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
                                        placeholder="Örn: Gece Yarısı Danteli"
                                    />
                                    <span className="text-[10px] text-gray-600 ml-1">{title.length}/{MAX_TITLE_LENGTH}</span>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 ml-1">Kategori</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Base Price */}
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 ml-1">
                                    Taban Fiyat (₺) <span className="text-pink-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="1000000"
                                    step="0.01"
                                    value={basePrice}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Negatif değer girişini engelle
                                        if (val === "" || parseFloat(val) >= 0) {
                                            setBasePrice(val);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        // Eksi işareti girişini engelle
                                        if (e.key === "-" || e.key === "e") e.preventDefault();
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none transition-colors"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 ml-1">
                                    Açıklama / Hikaye <span className="text-pink-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    maxLength={MAX_DESCRIPTION_LENGTH}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none transition-colors resize-none"
                                    placeholder="Ürününün hikayesini anlat..."
                                />
                                <span className="text-[10px] text-gray-600 ml-1">{description.length}/{MAX_DESCRIPTION_LENGTH}</span>
                            </div>

                            {/* Duration Range Selector */}
                            <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-pink-400">
                                        🔥 Tenin Sıcaklığı (Gün)
                                    </h4>
                                    <span className="text-lg font-mono font-bold text-pink-400">
                                        {previewDuration} Gün
                                    </span>
                                </div>

                                {/* Neon Pink Slider */}
                                <div className="relative px-1">
                                    <input
                                        type="range"
                                        min={1}
                                        max={14}
                                        step={1}
                                        value={previewDuration}
                                        onChange={(e) => setPreviewDuration(parseInt(e.target.value))}
                                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((previewDuration - 1) / 13) * 100}%, rgba(255,255,255,0.1) ${((previewDuration - 1) / 13) * 100}%, rgba(255,255,255,0.1) 100%)`,
                                        }}
                                    />
                                    <style>{`
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 22px;
                      height: 22px;
                      border-radius: 50%;
                      background: #ec4899;
                      cursor: pointer;
                      box-shadow: 0 0 15px rgba(236,72,153,0.6), 0 0 30px rgba(236,72,153,0.3);
                      border: 2px solid white;
                    }
                    input[type="range"]::-moz-range-thumb {
                      width: 22px;
                      height: 22px;
                      border-radius: 50%;
                      background: #ec4899;
                      cursor: pointer;
                      box-shadow: 0 0 15px rgba(236,72,153,0.6), 0 0 30px rgba(236,72,153,0.3);
                      border: 2px solid white;
                    }
                  `}</style>
                                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-500 font-mono uppercase">
                                        <span>Taze</span>
                                        <span>Yoğun</span>
                                        <span>Mühürlenmiş</span>
                                    </div>
                                </div>

                                {/* Duration Price Info */}
                                {previewDuration > 1 && (
                                    <div className="text-xs text-pink-300/70 text-right">
                                        +{formatCurrency(durationExtra)} süre ek ücreti ({previewDuration - 1} × {formatCurrency(PRICE_PER_DAY)}/gün)
                                    </div>
                                )}

                                {/* Min/Max Duration for seller */}
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 ml-1">Min Süre (Gün)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={maxDuration}
                                            value={baseDuration}
                                            onChange={(e) => { const v = parseInt(e.target.value) || 1; setBaseDuration(v); if (previewDuration < v) setPreviewDuration(v); }}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-pink-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-gray-500 ml-1">Max Süre (Gün)</label>
                                        <input
                                            type="number"
                                            min={baseDuration}
                                            max={30}
                                            value={maxDuration}
                                            onChange={(e) => { const v = parseInt(e.target.value) || 7; setMaxDuration(v); if (previewDuration > v) setPreviewDuration(v); }}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-pink-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ekstra Haz Menüsü */}
                            <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400">
                                    ✨ Ekstra Haz Menüsü
                                </h4>
                                <p className="text-[11px] text-gray-500 -mt-1">
                                    Alıcıların seçebileceği ek hizmetler. Aktif ettikleriniz ilanlarda görünecek.
                                </p>
                                <div className="space-y-2">
                                    {extras.map((extra) => (
                                        <div
                                            key={extra.id}
                                            onClick={() => toggleExtra(extra.id)}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${extra.enabled
                                                ? "bg-purple-500/10 border-purple-500/30"
                                                : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${extra.enabled
                                                    ? "bg-purple-500 border-purple-500"
                                                    : "border-gray-600"
                                                    }`}>
                                                    {extra.enabled && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className={`text-sm ${extra.enabled ? "text-white" : "text-gray-400"}`}>
                                                    {extra.label}
                                                </span>
                                            </div>
                                            <span className="text-sm font-mono text-purple-400">
                                                +{formatCurrency(extra.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Price Preview */}
                            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Tahmini Alıcı Bedeli</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Taban {formatCurrency(basePriceNum)}
                                            {durationExtra > 0 && ` + Süre ${formatCurrency(durationExtra)}`}
                                            {extrasTotal > 0 && ` + Ekstra ${formatCurrency(extrasTotal)}`}
                                        </p>
                                    </div>
                                    <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text font-mono">
                                        {formatCurrency(totalPreview)}
                                    </p>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {isEditMode ? "Güncelleniyor..." : "Yükleniyor..."}
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        {isEditMode ? "Değişiklikleri Kaydet" : "İlanı Yayınla"}
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

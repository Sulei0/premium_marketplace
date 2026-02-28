import { useState, useRef, useMemo } from "react";
import { X, Upload, Plus, Trash2, Check, AlertCircle, ImagePlus, Loader2 } from "lucide-react";
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
    size?: string;
    image_url: string | null;
    image_urls?: string[];
    extras: ExtraItem[];
    is_sold?: boolean; // Added field
}

interface ExtraItem {
    id: string;
    label: string;
    price: number;
    enabled: boolean;
}

import { CATEGORY_LABELS } from "@/lib/categories";
const CATEGORIES = CATEGORY_LABELS;

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44", "46", "Tek Beden"];

const DEFAULT_EXTRAS: ExtraItem[] = [
    { id: "detail_photo", label: "Detaylı Ürün Fotoğrafı", price: 30, enabled: false },
    { id: "gift_wrap", label: "Hediye Paketi", price: 50, enabled: false },
    { id: "handwritten", label: "El Yazılı Not Ekle", price: 30, enabled: false },
    { id: "rush_delivery", label: "Hızlı Kargo (1 Gün)", price: 75, enabled: false },
    { id: "combo_tip", label: "Kombin Önerisi", price: 20, enabled: false },
];

const MAX_IMAGES = 5;

export function AddProductModal({ isOpen, onClose, editProduct }: AddProductModalProps) {
    const { user } = useAuth();
    const isEditMode = !!editProduct;
    // logic fix: prevent editing sold products
    const isProductSold = editProduct?.is_sold === true;

    const [title, setTitle] = useState(editProduct?.title ?? "");
    const [description, setDescription] = useState(editProduct?.description ?? "");
    const [basePrice, setBasePrice] = useState(editProduct?.price?.toString() ?? "");
    const [category, setCategory] = useState(editProduct?.category ?? CATEGORIES[0]);
    const [size, setSize] = useState(editProduct?.size ?? "");
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

    const enabledExtras = extras.filter(e => e.enabled);
    const extrasTotal = enabledExtras.reduce((s, e) => s + e.price, 0);
    const basePriceNum = parseFloat(basePrice) || 0;
    const totalPreview = basePriceNum + extrasTotal;

    if (!isOpen) return null;

    if (isProductSold) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="relative w-full max-w-md bg-[#121212] border border-red-500/30 rounded-2xl shadow-2xl p-6 text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Bu Ürün Satılmıştır</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Satılan ürünler üzerinde değişiklik yapılamaz. Ürün bilgileri, alıcı ile yapılan anlaşmanın bir parçası olarak kilitlenmiştir.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        Anlaşıldı
                    </button>
                </div>
            </div>
        );
    }

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
            setSize("");
            setExtras(DEFAULT_EXTRAS.map(e => ({ ...e })));
            setImageFiles([]);
            setImagePreviews([]);
            setExistingUrls([]);
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

        // ── Limit Daily Listings Check ──
        if (!isEditMode) {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayISO = today.toISOString();

                const { count, error: countError } = await supabase
                    .from("products")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", user.id)
                    .gte("created_at", todayISO);

                if (countError) {
                    console.error("Error checking daily limit:", countError);
                    // Fail safe: allow if check fails, or block? usually better to allow or warn. 
                    // But for this strict req, let's block or at least show error.
                    // deciding to throw to stop flow.
                    throw new Error("İlan limiti kontrol edilirken hata oluştu.");
                }

                if (count !== null && count >= 5) {
                    setError("Günlük ilan limiti (5 adet) dolmuştur. Yarın tekrar deneyiniz.");
                    setLoading(false);
                    return;
                }
            } catch (err: any) {
                setError(err.message || "Limit kontrolünde hata.");
                setLoading(false);
                return;
            }
        }

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
                size: size || null,
                image_url: uploadedUrls[0] || null, // backward compat
                image_urls: uploadedUrls,
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
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={preview} className="relative aspect-square rounded-lg overflow-hidden group border border-white/10">
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

                            {/* Nudity Warning */}
                            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-200">
                                    <span className="font-bold text-red-400">Güvenlik Bilgisi:</span> Platform standartlarımıza uymayan, etik dışı veya uygunsuz içeriklerin paylaşımı kesinlikle yasaktır. Topluluk güvenliğini ihlal eden hesaplar hakkında, kullanıcı verileri ve erişim detayları ile birlikte yasal süreç başlatılacaktır.
                                </p>
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
                                        placeholder="Örn: Vintage Denim Ceket"
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

                            {/* Size (Beden) */}
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 ml-1">Beden</label>
                                <select
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-[#1a1a1a]">Beden Seçiniz (Opsiyonel)</option>
                                    {SIZES.map((s) => (
                                        <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>
                                    ))}
                                </select>
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


                            {/* Ekstra Hizmetler */}
                            <div className="space-y-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-purple-400">
                                            ✨ Ekstra Hizmetler
                                        </h4>
                                        <p className="text-[11px] text-gray-500">
                                            Alıcıların seçebileceği ek hizmetler.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newId = Math.random().toString(36).substring(7);
                                            setExtras(prev => [...prev, { id: newId, label: "", price: 50, enabled: true }]);
                                        }}
                                        className="text-xs flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg transition-colors border border-purple-500/20"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Yeni Ekle
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {extras.map((extra, index) => (
                                        <div
                                            key={extra.id}
                                            className={`flex flex-col sm:flex-row gap-3 p-3 rounded-xl border transition-all ${extra.enabled
                                                ? "bg-purple-500/5 border-purple-500/30"
                                                : "bg-white/[0.02] border-white/5"
                                                }`}
                                        >
                                            {/* Enable Toggle */}
                                            <div className="flex items-center gap-3 flex-1">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExtra(extra.id)}
                                                    className={"w-8 h-8 rounded-lg border-2 flex shrink-0 items-center justify-center transition-all " + (extra.enabled
                                                        ? "bg-purple-500 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                                                        : "border-gray-600 hover:border-gray-500")
                                                    }
                                                >
                                                    {extra.enabled && <Check className="w-4 h-4 text-white" />}
                                                </button>

                                                <input
                                                    type="text"
                                                    value={extra.label}
                                                    onChange={(e) => {
                                                        const newLabel = e.target.value;
                                                        setExtras(prev => prev.map(item => item.id === extra.id ? { ...item, label: newLabel } : item));
                                                    }}
                                                    placeholder="Seçenek Adı (Örn: Hediye Paketi)"
                                                    className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 placeholder:text-gray-600 p-0"
                                                />
                                            </div>

                                            {/* Price & Delete */}
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">₺</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={extra.price}
                                                        onChange={(e) => {
                                                            const newPrice = parseFloat(e.target.value) || 0;
                                                            setExtras(prev => prev.map(item => item.id === extra.id ? { ...item, price: newPrice } : item));
                                                        }}
                                                        className="w-20 bg-black/20 border border-white/10 rounded-lg py-1.5 pl-5 pr-2 text-right text-sm font-mono text-purple-400 focus:border-purple-500 focus:outline-none"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setExtras(prev => prev.filter(item => item.id !== extra.id))}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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

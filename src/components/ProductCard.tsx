import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Product,
  getProductPath,
  formatCurrency,
  cn,
  getProfilePath,
} from "@/lib/index";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card/40 border border-white/5 backdrop-blur-md transition-all hover:border-primary/30",
        className
      )}
    >
      {/* Image Section - Instagram Style Aspect Ratio */}
      <Link to={getProductPath(product.id)} className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/20 opacity-60" />

        {/* Seller Info Overlay (Top) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Link 
            to={getProfilePath(product.seller.id)}
            className="flex items-center gap-2 group/seller"
          >
            <div className="relative">
              <img 
                src={product.seller.avatar} 
                alt={product.seller.username}
                className="h-8 w-8 rounded-full border border-white/20 object-cover"
              />
              {product.seller.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                  <CheckCircle2 className="h-3 w-3 text-primary drop-shadow-[0_0_8px_rgba(255,46,126,0.8)]" />
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-white/90 group-hover/seller:text-primary transition-colors">
              @{product.seller.username}
            </span>
          </Link>

          <Badge variant="secondary" className="bg-black/40 backdrop-blur-md border-white/10 text-[10px] uppercase tracking-wider">
            {product.category}
          </Badge>
        </div>

        {/* Stats Overlay (Bottom Left) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 text-white/70">
          <div className="flex items-center gap-1 text-[11px]">
            <Eye className="h-3 w-3" />
            {product.stats.views}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <Heart className="h-3 w-3" />
            {product.stats.likes}
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-col p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <Link to={getProductPath(product.id)} className="flex-1">
            <h3 className="text-sm font-semibold tracking-tight text-foreground/90 line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
              {product.story}
            </p>
          </Link>
          <div className="text-right">
            <span className="text-sm font-mono font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>

        {/* Verification Status Banner */}
        {product.isVerified && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/5 border border-primary/10">
            <CheckCircle2 className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
              Doğrulanmış Ürün
            </span>
          </div>
        )}

        {/* Action Button */}
        <Button
          asChild
          className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 hover:border-primary transition-all duration-300 rounded-lg group/btn"
        >
          <Link to={getProductPath(product.id)} className="flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Satıcıya Fısılda
            </span>
          </Link>
        </Button>
      </div>

      {/* Premium Glow Effect on Hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(255,46,126,0.1)_0%,transparent_70%)]" />
    </motion.div>
  );
}

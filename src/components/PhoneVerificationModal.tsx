import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  testCode?: string | null;
  onVerified: () => void;
  onResend: () => void;
}

export function PhoneVerificationModal({ isOpen, onClose, phoneNumber, testCode, onVerified, onResend }: PhoneVerificationModalProps) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { user } = useAuth();

  // This will be connected to actual API later
  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Lütfen 6 haneli kodu eksiksiz girin.");
      return;
    }
    if (!user || !supabase) return;
    
    setVerifying(true);
    try {
      // Gerçek Supabase RPC çağrısı
      const { data: isValid, error } = await supabase.rpc('verify_phone_otp', {
        p_user_id: user.id,
        p_phone: phoneNumber,
        p_code: code
      });
      
      if (error) throw error;
      
      if (isValid) {
        toast.success("Telefon numaranız başarıyla doğrulandı!");
        onVerified();
        onClose();
      } else {
        toast.error("Hatalı veya süresi dolmuş kod. Lütfen tekrar deneyin.");
      }
    } catch (error: any) {
      toast.error(error.message || "Doğrulama sırasında bir hata oluştu.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Telefon Doğrulama</DialogTitle>
          <DialogDescription className="text-center">
            <strong className="text-foreground">{phoneNumber}</strong> numarasına 6 haneli bir doğrulama kodu gönderildi. Lütfen kodu aşağıya girin.
            {testCode && (
              <div className="mt-2 text-xs text-primary font-mono bg-primary/10 py-1 px-2 rounded-md inline-block">
                (Test Kodu: {testCode})
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => setCode(value)}
            disabled={verifying}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button 
            onClick={handleVerify} 
            disabled={verifying || code.length !== 6}
            className="w-full h-12 rounded-xl text-base font-bold bg-primary hover:bg-primary/90"
          >
            {verifying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Doğrula
              </span>
            )}
          </Button>
          
          <button 
            onClick={onResend}
            disabled={verifying}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kodu tekrar gönder
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

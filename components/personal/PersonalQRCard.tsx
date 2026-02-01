"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Copy, Check } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface PersonalQRCardProps {
    user?: {
        ubankId: string | null;
        firstName: string | null;
        lastName: string | null;
    } | null;
}

export function PersonalQRCard({ user: proppedUser }: PersonalQRCardProps = {}) {
    const { user: authUser } = useAuth();
    const user = proppedUser || authUser;

    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user?.ubankId) {
            // Generate QR Code with uBank URI scheme
            const uri = `ubank://user/${user.ubankId}`;
            QRCode.toDataURL(uri, {
                width: 400,
                margin: 2,
                color: {
                    dark: "#020617", // slate-950
                    light: "#ffffff",
                },
            }).then(setQrDataUrl);
        }
    }, [user?.ubankId]);

    const copyId = () => {
        if (user?.ubankId) {
            navigator.clipboard.writeText(user.ubankId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!user?.ubankId) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 -my-1">
                    <QrCode className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/10 backdrop-blur-xl border-white/10 text-white sm:max-w-md p-0 overflow-hidden rounded-3xl">
                <div className="bg-emerald-600 p-6 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 backdrop-blur-sm">
                        <span className="text-2xl font-bold">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                    </div>
                    <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                </div>

                <div className="p-8 flex flex-col items-center gap-6 bg-slate-950">
                    <div className="p-4 bg-white rounded-3xl shadow-2xl shadow-emerald-500/20">
                        {qrDataUrl && (
                            <img src={qrDataUrl} alt="My uBank QR" className="w-48 h-48 sm:w-56 sm:h-56 mix-blend-multiply" />
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-2 w-full">
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Your uBank ID</p>
                        <div
                            onClick={copyId}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors group w-full justify-center"
                        >
                            <span className="font-mono text-lg text-emerald-400 font-bold tracking-tight">
                                {user.ubankId}
                            </span>
                            {copied ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <Copy className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                            )}
                        </div>
                    </div>

                    <p className="text-center text-slate-500 text-xs px-8 leading-relaxed">
                        Allow peers to scan this code to instantly tag you in transactions.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

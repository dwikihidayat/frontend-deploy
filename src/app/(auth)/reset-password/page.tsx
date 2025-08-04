"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

export default function ResetPasswordPage() {
    return <ResetPasswordForm />;
}

function ResetPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSuccess, setIsSuccess] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            newErrors.email = "Email wajib diisi";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Format email tidak valid";
        }

        return newErrors;
    };

    const resetMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post("/auth/forgot-password", { email });
            return response.data;
        },
        onSuccess: () => {
            setIsSuccess(true);
            toast.success("Link reset password telah dikirim ke email Anda", {
                duration: 4000,
                position: "top-center",
            });
        },
        onError: (error: unknown) => {
            let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";

            const axiosError = error as AxiosError<{ detail?: string }>;

            if (axiosError.response) {
                const { status, data } = axiosError.response;
                const detail = data?.detail?.toLowerCase() || "";

                if (status === 404) {
                    errorMessage = "Email tidak terdaftar. Silakan periksa kembali.";
                } else if (status === 429) {
                    errorMessage = "Terlalu banyak permintaan. Silakan coba lagi nanti.";
                } else if (status === 500) {
                    errorMessage = "Kesalahan server. Silakan coba lagi nanti.";
                } else if (detail) {
                    errorMessage = detail;
                }
            }

            toast.error(errorMessage, { duration: 4000, position: "top-center" });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        resetMutation.mutate();
    };

    return (
        <div className={cn("min-h-screen w-full flex items-center justify-center bg-white", className)} {...props}>
            <div className="w-full h-screen flex">
                <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Card className="max-w-md mx-auto h-full flex flex-col justify-center bg-white border-0 shadow-none transition-all duration-300">
                        <CardContent className="p-6 sm:p-8">
                            {isSuccess ? (
                                <div className="flex flex-col items-center text-center gap-4">
                                    <CheckCircle2 className="w-16 h-16 text-green-500" strokeWidth={1.5} />
                                    <h1 className="text-2xl sm:text-3xl font-bold text-primary">Permintaan Diterima</h1>
                                    <p className="text-gray-600 text-sm sm:text-base">
                                        Kami telah mengirimkan link reset password ke email <span className="font-medium">{email}</span>. Silakan periksa inbox Anda.
                                    </p>
                                    <p className="text-gray-600 text-sm sm:text-base">Jika tidak menemukan email, periksa folder spam atau junk mail.</p>
                                    <Button
                                        onClick={() => router.push("/login")}
                                        className="w-full h-10 sm:h-12 bg-primary hover:bg-primary/90 text-white font-medium text-sm sm:text-base rounded-full shadow-md hover:shadow-lg transition-all duration-200 mt-4"
                                    >
                                        Kembali ke Login
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div className="flex flex-col items-start">
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 flex items-center">Reset Password</h1>
                                        <p className="text-gray-600 text-sm sm:text-base max-w-xl">Masukkan email Anda untuk menerima link reset password.</p>
                                        <div className="mt-4 w-12 h-1 bg-primary/30 rounded-full" />
                                    </div>

                                    <EmailInput value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />

                                    <Button
                                        type="submit"
                                        className="w-full h-10 sm:h-12 bg-primary hover:bg-primary/90 text-white font-medium text-sm sm:text-base rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                                        disabled={resetMutation.isPending}
                                    >
                                        {resetMutation.isPending ? "Memproses..." : "Kirim Link Reset"}
                                    </Button>

                                    <div className="text-center text-xs sm:text-sm text-gray-600 mt-4">
                                        Ingat password Anda?{" "}
                                        <Link href="/login" prefetch={true} className="text-primary font-medium hover:underline hover:text-primary/80" aria-label="Kembali ke halaman login">
                                            Login
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <LoginIllustration />
            </div>
        </div>
    );
}

function EmailInput({ value, onChange, error }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string }) {
    return (
        <div className="space-y-2">
            <Label className="text-primary font-medium text-sm sm:text-base">Email</Label>
            <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={value}
                    onChange={onChange}
                    className="pl-8 sm:pl-10 h-10 sm:h-12 w-full border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg text-xs sm:text-sm bg-background placeholder:text-gray-400"
                    aria-label="Masukkan alamat email"
                />
            </div>
            {error && <p className="text-red-600 text-xs sm:text-sm mt-1 flex items-center gap-1">{error}</p>}
        </div>
    );
}

function LoginIllustration() {
    return (
        <div className="flex-1 hidden md:block bg-background">
            <div className="relative h-full w-full flex items-center justify-center p-12">
                <Image src="/login.png" alt="Login Illustration" fill className="object-cover drop-shadow-xl animate-float" priority sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw" />
            </div>
        </div>
    );
}

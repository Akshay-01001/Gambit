import React, { useRef, useState, useEffect } from "react";

const VerifyOtp = () => {
    const OTP_LENGTH = 6;
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value.replace(/\D/g, "");
        if (!value) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        const key = e.key;

        if (key === "ArrowLeft") {
            e.preventDefault();
            if (index > 0) inputRefs.current[index - 1]?.focus();
            return;
        }

        if (key === "ArrowRight" || key === " ") {
            e.preventDefault();
            if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
            return;
        }

        if (/^[0-9]$/.test(key)) {
            e.preventDefault();
            const newOtp = [...otp];
            newOtp[index] = key;
            setOtp(newOtp);
            if (index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
            }
            return;
        }

        if (key.toLowerCase() !== "backspace") {
            return;
        }

        // Prevent the browser's default Backspace behavior.
        // We handle deleting the digit and moving focus manually.
        e.preventDefault();
        const newOtp = [...otp];

        if (otp[index]) {
            newOtp[index] = "";
            setOtp(newOtp);
            return;
        }

        if (index > 0) {
            inputRefs.current[index - 1]?.focus();
            newOtp[index - 1] = "";
            setOtp(newOtp);
        }
    }

    return (
        <div className="min-h-screen w-screen bg-background flex justify-center items-start px-6 py-10">
            <div className='w-full max-w-2xl px-6 flex flex-col'>
                {/* Logo Section */}
                <div className='flex items-center justify-between'>
                    <div className="flex items-center cursor-pointer">
                        <span className="bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] h-10 w-10 flex justify-center items-center rounded-lg">
                            <img src='/logo.svg' alt="logo" className="h-6 w-6" />
                        </span>
                        <span className="font-bold text-xl ml-3 tracking-wide">Gambit</span>
                    </div>

                </div>
                <div className='mt-6'>
                    <h1 className='mt-4 font-display text-3xl font-bold'>
                        Verify Your Email
                    </h1>
                    <p className='mt-2 text-sm text-muted-foreground'>
                        We sent a 6-digit code to your email. Enter it below to finish setup.
                    </p>
                </div>
                <div className='mt-10 space-y-6'>
                    <div className='flex items-center gap-4'>
                        {
                            Array.from({ length: 6 }, (_, index) => {
                                return (
                                    <input
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        id={`input-${index + 1}`}
                                        key={index} type="text"
                                        maxLength={1}
                                        value={otp[index]}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onChange={(e) => handleChange(e, index)}
                                        className='h-14 w-full rounded-lg border border-border bg-card text-center font-display text-2xl font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30'
                                    />
                                )
                            })
                        }
                    </div>
                    <p className='text-sm text-muted-foreground'>
                        Didn't receive the code? <span className='text-primary'>Resend</span>
                    </p>
                </div>
                <div className='mt-8'>
                    <button type="button" className="w-full bg-primary text-primary-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors hover:bg-primary/90 cursor-pointer">
                        Verify Email
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerifyOtp;

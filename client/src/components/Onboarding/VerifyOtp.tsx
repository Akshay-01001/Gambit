import React, { useRef, useState, useEffect } from "react";
import { sendOtpMail, verifyOtp } from "../../utils/apiFunctions";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { setUser } from "../../features/user.slice";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import CountDown from "react-countdown"
import axios from "axios";

const VerifyOtp = () => {
    const OTP_LENGTH = 6;
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const { email } = useSelector((state: RootState) => state.user)
    const hasSentOtp = useRef<boolean>(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { setIsEmailVerified } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const getInitialDate = () => {
        const expiresAt = Number(localStorage.getItem("otpExpiresAt"));
        if (expiresAt && expiresAt > Date.now()) {
            return expiresAt;
        }
        if (expiresAt) {
            localStorage.removeItem("otpExpiresAt");
        }
        return 0;
    };

    const [targetDate, setTargetDate] = useState<number>(getInitialDate());

    const sendMail = async () => {
        hasSentOtp.current = true;
        try {
            await sendOtpMail('/api/otp/send-otp', { email });
            const newExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes
            localStorage.setItem("otpExpiresAt", String(newExpiry));
            setTargetDate(newExpiry);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (!hasSentOtp.current) {
            sendMail()
        }
    }, []);

    const handleVerify = async (e?: React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== OTP_LENGTH) return;
        setIsLoading(true);

        try {
            const response = await verifyOtp('/api/otp/verify-otp', { email, otp: otpString });
            if (response.data.success) {
                setIsEmailVerified(true);
                dispatch(setUser({ isVerified: true }));
                navigate("/");
            }
        } catch (error) {
            console.error("Verification failed", error);
            const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message : "Something Went Wrong";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

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

        setError("");
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
                </div>
                <form onSubmit={handleVerify}>
                    <div className='mt-10 space-y-6'>
                        <div className='flex items-center gap-4'>
                            {Array.from({ length: 6 }, (_, index) => {
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
                                        className='h-14 w-full rounded-lg border border-border bg-card text-center font-display text-2xl font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30' />
                                );
                            })}
                        </div>
                        <p className='text-sm text-muted-foreground'>
                            Didn't receive the code?{' '}
                            {targetDate > Date.now() ? (
                                <span className='text-primary font-medium'>
                                    <CountDown
                                        date={targetDate}
                                        onComplete={() => {
                                            localStorage.removeItem("otpExpiresAt");
                                            setTargetDate(0);
                                        }}
                                        renderer={({ minutes, seconds, completed }) => {
                                            if (completed) return null;
                                            return <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>;
                                        }} />
                                </span>
                            ) : (
                                <span onClick={sendMail} className='text-primary cursor-pointer hover:underline font-medium'>
                                    Resend
                                </span>
                            )}
                        </p>
                    </div>
                    <div className='mt-8'>
                        <button
                            type="submit"
                            disabled={otp.join("").length !== OTP_LENGTH || isLoading}
                            className="w-full bg-primary text-primary-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? "Verifying..." : "Verify Email"}
                        </button>
                    </div>
                </form>
                {
                    error.trim() &&
                    <div className="text-sm text-red-500 mt-2 font-semibold text-center">
                        {error}
                    </div>
                }
            </div>
        </div>
    )
}

export default VerifyOtp;

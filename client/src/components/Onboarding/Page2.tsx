import { useDispatch, useSelector } from "react-redux"
import OnboardingLayout from "./OnboardingLayout"
import type { RootState } from "../../store/store";
import { setFormData } from "../../features/onboarding.slice";
import React, { useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";

const Page2 = () => {

    const dispatch = useDispatch();
    const { formData } = useSelector((state: RootState) => state.onboarding)
    const avatar_urls = useMemo(()=> {
        return  [
            'https://res.cloudinary.com/gambit-game/image/upload/v1785072386/Knight_c2ft9j.png',
            'https://res.cloudinary.com/gambit-game/image/upload/v1785072388/Rook_ofu8lt.png',
            'https://res.cloudinary.com/gambit-game/image/upload/v1785072387/Bishop_oui0ix.png',
            'https://res.cloudinary.com/gambit-game/image/upload/v1785072389/Pawn_nu4ui2.png'
        ]
    },[]);

    const handleSelectDefaultAvatars = useCallback((url: string) => {
        dispatch(setFormData({
            avatar_url: url
        }));
    },[dispatch]);

    const handleSelectCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const url = URL.createObjectURL(file);
        dispatch(setFormData({
            image: file,
            avatar_url: url
        }));
    }

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            data.append('username', formData.username)
            data.append('country', formData.country)
            if (formData.avatar_url) {
                data.append('avatar_url', formData.avatar_url);
            } else if (formData.image) {
                data.append('image', formData.image)
            }
            const response = await axios.post(`${API_BASE_URL}/api/auth/onboarding`, data, {
                withCredentials: true
            });

            console.log(response);
        } catch (error) {
            console.log('error', error);
        }
    }

    useEffect(() => {
        if (!formData.avatar_url) {
            handleSelectDefaultAvatars(avatar_urls[0]);
        }
    }, [formData.avatar_url, avatar_urls, handleSelectDefaultAvatars]);

    return (
        <OnboardingLayout currentStep={2}>
            <div className='mt-6'>
                <h1 className='text-3xl font-display font-bold'>Choose your avatar</h1>
                <p className='mt-2 text-sm text-muted-foreground'>Pick one of ours or upload your own.</p>
            </div>
            <div className='mt-10 space-y-8'>
                <div className='flex items-center gap-4 rounded-xl border border-border bg-card p-5'>
                    <img src={formData.avatar_url} alt="Piece" className="h-16 w-16 transition rounded-full object-cover" />
                    <div className='min-w-0'>
                        <div className='truncate font-display text-lg font-semibold'>
                            {formData.username}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                            {formData.country}
                        </div>
                    </div>
                </div>
                <div className='space-y-3'>
                    <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Default Avatar
                    </label>
                    <div className='flex flex-wrap gap-3 mt-2'>
                        {
                            avatar_urls.map((url, index) => {
                                const isSelected = url === formData.avatar_url
                                return (
                                    <img src={url} key={index} alt="Piece" className={`h-16 w-16 transition rounded-full cursor-pointer ${isSelected && 'ring-3 ring-primary'}`} onClick={() => handleSelectDefaultAvatars(url)} />
                                )
                            })
                        }
                        <label htmlFor="avatar">
                            <div
                                className="grid h-16 w-16 place-items-center rounded-full border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary cursor-pointer"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-5 w-5"
                                >
                                    <path d="M12 3v12" />
                                    <path d="m17 8-5-5-5 5" />
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                </svg>
                            </div>
                        </label>
                        <input type="file" name="avatar" hidden id="avatar" accept="image/*" onChange={(e) => handleSelectCustomImage(e)} />
                    </div>
                    <p className="text-xs text-muted-foreground">Or upload your own image</p>
                </div>
            </div>
            <div className='mt-8'>
                <button type="button" onClick={handleSubmit} className="w-full bg-primary text-primary-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors hover:bg-primary/90">
                    Continue
                </button>
            </div>
        </OnboardingLayout>
    )
}

export default Page2;

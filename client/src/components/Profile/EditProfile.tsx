import React from 'react';

const EditProfile: React.FC = () => {
    return (
        <div className="bg-card rounded-2xl p-6 border flex flex-col h-full">
            <h2 className="text-xl font-display font-bold mb-6">Edit profile</h2>
            
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                {/* Profile Picture Upload */}
                <div className="flex flex-col gap-2 mb-2">
                    <span className="text-sm font-semibold text-muted-foreground">Profile Picture</span>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-2xl font-bold shrink-0">
                            D
                        </div>
                        <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm transition-colors border border-border">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" x2="12" y1="3" y2="15"></line>
                            </svg>
                            Upload new avatar
                            <input type="file" className="hidden" accept="image/*" />
                        </label>
                    </div>
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="username" className="text-sm font-semibold">Username</label>
                    <input 
                        type="text" 
                        id="username"
                        defaultValue="demo_player"
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
                    />
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="country" className="text-sm font-semibold">Country (2-letter code)</label>
                    <input 
                        type="text" 
                        id="country"
                        defaultValue="US"
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
                    />
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="bio" className="text-sm font-semibold">Bio</label>
                    <textarea 
                        id="bio"
                        rows={4}
                        defaultValue="Just here to test the UI."
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" 
                    />
                    <div className="text-right text-xs text-muted-foreground mt-1">25/200</div>
                </div>

                {/* Save Button */}
                <div className="mt-2">
                    <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;

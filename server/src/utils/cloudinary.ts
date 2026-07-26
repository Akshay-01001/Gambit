import cloudinary from "../lib/cloudinary"

export const uploadImageToCloudinary = async (fileBuffer: Buffer, mimetype: string): Promise<{ url: string, publicId: string }> => {
    try {
        const b64 = Buffer.from(fileBuffer).toString("base64");
        const dataURI = "data:" + mimetype + ";base64," + b64;
        const res = await cloudinary.v2.uploader.upload(dataURI, {
            folder: "gambit_avatars",
        });
        return {
            url: res.secure_url,
            publicId: res.public_id
        };
    } catch (error) {
        throw new Error("Failed to upload image to Cloudinary");
    }
}

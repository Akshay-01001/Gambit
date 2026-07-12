import Joi from "joi";

export const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please enter a valid email",
            "any.required": "Email is required",
        }),
    password: Joi.string()
        .min(8)
        .max(32)
        .pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]+$/
        )
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 8 characters",
            "string.max": "Password cannot exceed 32 characters",
            "string.pattern.base":
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            "any.required": "Password is required",
        })
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please enter a valid email",
            "any.required": "Email is required",
        }),
    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required",
            "any.required": "Password is required",
        })
});

export const generateOtpSchema = Joi.object({
    email: Joi.string()
        .email()
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please enter a valid email",
            "any.required": "Email is required",
        }),
    purpose: Joi.string()
        .valid("register", "forgot_password", "change_email")
        .required()
        .messages({
            "any.only": "Purpose must be one of: register, forgot_password, change_email",
            "any.required": "Purpose is required",
        })
});

export const validateOtpSchema = Joi.object({
    email: Joi.string()
        .email()
        .trim()
        .lowercase()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please enter a valid email",
            "any.required": "Email is required",
        }),
    otp: Joi.string()
        .length(6)
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            "string.empty": "OTP is required",
            "string.length": "OTP must be exactly 6 digits",
            "string.pattern.base": "OTP must be a 6-digit number",
            "any.required": "OTP is required",
        }),
    purpose: Joi.string()
        .valid("register", "forgot_password", "change_email")
        .required()
        .messages({
            "any.only": "Purpose must be one of: register, forgot_password, change_email",
            "any.required": "Purpose is required",
        })
});

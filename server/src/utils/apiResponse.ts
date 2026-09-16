import { Response } from "express";

/**
 * Standard API response shape returned by all endpoints.
 *
 * Success responses carry `data` (generic) and an optional `meta` bag for
 * alongside the human-readable `message`.
 */
interface ApiSuccessBody<T = unknown> {
    success: true;
    statusCode: number;
    message: string;
    data: T;
}

interface ApiErrorBody {
    success: false;
    statusCode: number;
    message: string;
    errors?: Record<string, string>[];
}

/**
 * Send a standardised success response.
 *
 * @param res     Express response object
 * @param opts    Response options
 *   - `statusCode` HTTP status (default `200`)
 *   - `message`    Human-readable message (default `"Success"`)
 *   - `data`       Payload to send back (default `null`)
 *   - `meta`       Optional metadata (pagination, counts, etc.)
 */
export const sendSuccess = <T = unknown>(
    res: Response,
    opts: {
        statusCode?: number;
        message?: string;
        data?: T;
        meta?: Record<string, unknown>;
    } = {}
): Response<ApiSuccessBody<T>> => {
    const {
        statusCode = 200,
        message = "Success",
        data = null as unknown as T
    } = opts;

    const body: ApiSuccessBody<T> = {
        success: true,
        statusCode,
        message,
        data,
    };

    return res.status(statusCode).json(body);
};

/* ------------------------------------------------------------------ */
/*  Error helper                                                       */
/* ------------------------------------------------------------------ */

/**
 * Send a standardised error response.
 *
 * @param res     Express response object
 * @param opts    Error options
 *   - `statusCode` HTTP status (default 500)
 *   - `message`    Human-readable error message
 *   - `errors`     Optional field-level validation errors
 */
export const sendError = (
    res: Response,
    opts: {
        statusCode?: number;
        message?: string;
        errors?: Record<string, string>[];
    } = {}
): Response<ApiErrorBody> => {
    const {
        statusCode = 500,
        message = "Something went wrong",
        errors,
    } = opts;

    const body: ApiErrorBody = {
        success: false,
        statusCode,
        message
    };

    if (errors && errors.length > 0) {
        body.errors = errors;
    }

    return res.status(statusCode).json(body);
};

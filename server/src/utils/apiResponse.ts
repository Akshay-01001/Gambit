import { Response } from "express";

/**
 * Standard API response shape returned by all endpoints.
 *
 * Success responses carry `data` (generic) and an optional `meta` bag for
 * pagination / extra info.  Error responses carry a machine-readable `code`
 * alongside the human-readable `message`.
 */
interface ApiSuccessBody<T = unknown> {
    success: true;
    statusCode: number;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

interface ApiErrorBody {
    success: false;
    statusCode: number;
    message: string;
    code: string;
    errors?: Record<string, string>[];
}

type ApiResponseBody<T = unknown> = ApiSuccessBody<T> | ApiErrorBody;

/* ------------------------------------------------------------------ */
/*  Success helper                                                     */
/* ------------------------------------------------------------------ */

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
        data = null as unknown as T,
        meta,
    } = opts;

    const body: ApiSuccessBody<T> = {
        success: true,
        statusCode,
        message,
        data,
    };

    if (meta && Object.keys(meta).length > 0) {
        body.meta = meta;
    }

    return res.status(statusCode).json(body);
};

/* ------------------------------------------------------------------ */
/*  Error helper                                                       */
/* ------------------------------------------------------------------ */

/**
 * Maps common error-code strings to sensible HTTP status codes so callers
 * don't have to remember them.
 */
const ERROR_STATUS_MAP: Record<string, number> = {
    VALIDATION_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_ERROR: 500,
};

/**
 * Send a standardised error response.
 *
 * @param res     Express response object
 * @param opts    Error options
 *   - `statusCode` HTTP status (auto-derived from `code` when omitted)
 *   - `message`    Human-readable error message
 *   - `code`       Machine-readable error code (default `"INTERNAL_ERROR"`)
 *   - `errors`     Optional field-level validation errors
 */
export const sendError = (
    res: Response,
    opts: {
        statusCode?: number;
        message?: string;
        code?: string;
        errors?: Record<string, string>[];
    } = {}
): Response<ApiErrorBody> => {
    const {
        code = "INTERNAL_ERROR",
        message = "Something went wrong",
        errors,
    } = opts;

    const statusCode =
        opts.statusCode ?? ERROR_STATUS_MAP[code] ?? 500;

    const body: ApiErrorBody = {
        success: false,
        statusCode,
        message,
        code,
    };

    if (errors && errors.length > 0) {
        body.errors = errors;
    }

    return res.status(statusCode).json(body);
};

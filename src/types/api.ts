export interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    profileImage?: string;
}

// Auth Types
export interface SendOtpRequest {
    phoneNumber: string;
}

export interface VerifyOtpRequest {
    phoneNumber: string;
    otp: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
}

export interface RefreshTokenRequest {
    refresh: string;
}

// Profile Types (if needed for update)
export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    profileImage?: string;
}

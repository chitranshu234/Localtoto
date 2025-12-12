export interface User {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    isVerified: boolean;
    profilePhotoUrl: string | null;
    email?: string;
    // Shorthand/additional properties commonly used in the UI
    name?: string;  // Composite of firstName + lastName or separate field
    phone?: string;  // Alias for phoneNumber
    profileImage?: string;  // Alias for profilePhotoUrl
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
    success: boolean;
    message: string;
    token: string;
    refreshToken: string;
    user: User;
    isNewUser: boolean;
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

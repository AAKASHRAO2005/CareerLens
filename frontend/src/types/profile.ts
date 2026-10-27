export interface UserProfile {
  displayName: string;
  email: string;
  skills: string[];
  university?: string;
  graduationYear?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  skills?: string[];
  university?: string;
  graduationYear?: string;
}

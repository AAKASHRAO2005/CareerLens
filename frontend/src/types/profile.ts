export interface UserProfile {
  displayName: string;
  email: string;
  skills: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  skills?: string[];
}

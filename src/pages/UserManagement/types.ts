
export interface UserProfileType {
  id: string;
  email: string;
  role: 'tec enfermagem' | 'enfermeiro' | 'medico' | 'admin';
  name: string;
  createdAt: string;
}

export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: 'tec enfermagem' | 'enfermeiro' | 'medico' | 'admin';
}

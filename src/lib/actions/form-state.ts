export type FormState = {
  error: string | null;
  redirectTo?: string | null;
};

export const initialFormState: FormState = {
  error: null,
  redirectTo: null,
};

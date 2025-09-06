import { z as Zod } from 'zod';
export const RegisterSchema = Zod.object({
  name: Zod.string().min(1),
  email: Zod.string().email({ message: 'Email inválido' }),
  password: Zod.string().min(8),
});
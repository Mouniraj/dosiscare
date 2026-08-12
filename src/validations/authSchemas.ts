import { z } from 'zod';

import type { TFn } from '../i18n';

/** Auth form schemas as translator-aware factories (messages localized). */

export function makeLoginSchema(t: TFn) {
  return z.object({
    email: z.string().trim().min(1, t('val.emailRequired')).email(t('val.emailInvalid')),
    password: z.string().min(1, t('val.passwordRequired')),
  });
}
export type LoginForm = z.infer<ReturnType<typeof makeLoginSchema>>;

export function makeRegisterSchema(t: TFn) {
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  return z
    .object({
      name: z.string().trim().min(2, t('val.fullNameRequired')),
      birthDate: z.string().regex(ISO_DATE, t('val.birthDateRequired')),
      weight: z.string().optional(),
      height: z.string().optional(),
      allergies: z.array(z.string()).optional(),
      email: z.string().trim().min(1, t('val.emailRequired')).email(t('val.emailInvalid')),
      password: z.string().min(6, t('val.passwordMin')),
      confirm: z.string().min(1, t('val.confirmRequired')),
    })
    .refine((v) => v.password === v.confirm, { message: t('val.passwordMismatch'), path: ['confirm'] });
}
export type RegisterForm = z.infer<ReturnType<typeof makeRegisterSchema>>;

export function makeRecoverEmailSchema(t: TFn) {
  return z.object({
    email: z.string().trim().min(1, t('val.emailRequired')).email(t('val.emailInvalid')),
  });
}
export type RecoverEmailForm = z.infer<ReturnType<typeof makeRecoverEmailSchema>>;

export function makeRecoverCodeSchema(t: TFn) {
  return z.object({ code: z.string().trim().length(6, t('val.codeLength')) });
}
export type RecoverCodeForm = z.infer<ReturnType<typeof makeRecoverCodeSchema>>;

export function makeNewPasswordSchema(t: TFn) {
  return z
    .object({
      password: z.string().min(6, t('val.passwordMin')),
      confirm: z.string().min(1, t('val.confirmRequired')),
    })
    .refine((v) => v.password === v.confirm, { message: t('val.passwordMismatch'), path: ['confirm'] });
}
export type NewPasswordForm = z.infer<ReturnType<typeof makeNewPasswordSchema>>;

import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Signup in the OAuth pages: no unique rule, since the reply must not reveal which
 * addresses have an account
 */
export const accountSignupValidator = vine.create({
  fullName: vine.string().trim().minLength(1).maxLength(255),
  email: email(),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

export const passwordResetValidator = vine.create({
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

export const sendVerificationEmailValidator = vine.create({
  email: email(),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

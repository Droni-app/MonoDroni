// file: ~/server/api/auth/[...].ts
import { NuxtAuthHandler } from '#auth'
import GoogleProvider from 'next-auth/providers/google'
export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (token && account) {
        try { 
          /* Call Appi login */
          await $fetch<Login>(`${process.env.APPI}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'site': String(process.env.APPI_SITE_ID),
            },
            body: {
              id_token: account.id_token
            }
          }).then((res) => {
            token.accessToken = res.token.plainTextToken
          })
        } catch (error) {
          console.error('Error during Appi login:', error);
          return Promise.reject(new Error('Failed to login'));
        }
      }
      return Promise.resolve(token);
    }
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ]
})
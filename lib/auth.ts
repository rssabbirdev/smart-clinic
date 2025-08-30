import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { dbConnect } from './mongodb'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await dbConnect()
          
          // Import User model dynamically to avoid issues
          let User
          try {
            User = (await import('@/models/User')).default
          } catch (importError) {
            console.error('❌ Failed to import User model:', importError)
            return null
          }
          
          const user = await User.findOne({ 
            email: credentials.email,
            role: { $in: ['admin', 'nurse'] } // Only allow admin and nurse login
          })

          if (!user) {
            return null
          }


          // Use the bcrypt comparePassword method from the User model
          const isPasswordValid = await user.comparePassword(credentials.password)
          
          if (isPasswordValid) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              studentId: user.studentId
            }
          }

          return null
        } catch (error) {
          console.error('❌ Auth error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.studentId = user.studentId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        // Use token.sub as the user ID if token.id is not available
        session.user.id = token.id || token.sub
        session.user.role = token.role
        session.user.studentId = token.studentId
      }
      return session
    }
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

export default NextAuth(authOptions)

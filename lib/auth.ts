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
        console.log('🔐 Auth attempt for email:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          console.log('🔌 Connecting to database...')
          await dbConnect()
          console.log('✅ Database connected')
          
          // Import User model dynamically to avoid issues
          let User
          try {
            User = (await import('@/models/User')).default
            console.log('✅ User model imported successfully')
          } catch (importError) {
            console.error('❌ Failed to import User model:', importError)
            return null
          }
          
          console.log('🔍 Searching for user with email:', credentials.email)
          const user = await User.findOne({ 
            email: credentials.email,
            role: { $in: ['admin', 'nurse'] } // Only allow admin and nurse login
          })

          if (!user) {
            console.log('❌ User not found or not admin/nurse')
            return null
          }

          console.log('✅ User found:', { 
            name: user.name, 
            role: user.role, 
            hasPassword: !!user.password 
          })

          // Use the bcrypt comparePassword method from the User model
          console.log('🔐 Comparing passwords...')
          const isPasswordValid = await user.comparePassword(credentials.password)
          
          if (isPasswordValid) {
            console.log('✅ Password valid, returning user')
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              studentId: user.studentId
            }
          }

          console.log('❌ Invalid password')
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
      console.log('🔄 JWT callback:', { token: token.sub, user: user?.role })
      if (user) {
        token.role = user.role
        token.studentId = user.studentId
      }
      return token
    },
    async session({ session, token }) {
      console.log('🔄 Session callback:', { session: session.user?.email, token: token.role })
      if (token) {
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

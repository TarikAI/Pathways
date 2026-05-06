export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: any, request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = ['/login', '/register', '/forgot-password', '/'].includes(nextUrl.pathname);
      if (isAuthRoute) {
        if (isLoggedIn) {
            // Basic role redirect
            const role = auth.user?.role;
            if (role === 'STUDENT') return Response.redirect(new URL('/student/dashboard', nextUrl));
            if (role === 'ACADEMIC_SUPERVISOR' || role === 'FIELD_SUPERVISOR') return Response.redirect(new URL('/supervisor/dashboard', nextUrl));
            if (role === 'ADMIN') return Response.redirect(new URL('/admin/users', nextUrl));
            return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }
      return isLoggedIn;
    },
  },
};

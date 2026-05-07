"use client";

import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn, UserCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Role } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.role) {
      const role = session.user.role as Role;
      let dashboardPath = "/dashboard";
      if (role === "STUDENT") dashboardPath = "/student/dashboard";
      else if (role === "ACADEMIC_SUPERVISOR" || role === "FIELD_SUPERVISOR") dashboardPath = "/supervisor/dashboard";
      else if (role === "ADMIN") dashboardPath = "/admin/users";
      router.push(dashboardPath);
    }
  }, [session, router]);

  const onSubmit = async (data: LoginForm) => {
    setError("");
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-beige">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-navy to-brand-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <div className="mb-8">
            <Image src="/logo-bg.jpg" alt="Pathways" width={200} height={80} className="mx-auto mb-4" priority />
            <p className="text-white/80 text-xl">Cooperative Training Platform</p>
          </div>
          <div className="max-w-md">
            <Image
              src="/vector_illustration.png"
              alt="Students and supervisors working together"
              width={400}
              height={300}
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="mt-8 text-white/70 text-lg max-w-md">
            Connecting students, academic advisors, and field supervisors for successful internship experiences
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-navy/50 to-transparent" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-brand-navy tracking-widest mb-2">PATHWAYS</h1>
            <p className="text-brand-teal">Welcome back</p>
          </div>

          <div className="card">
            <div className="text-center mb-8">
              <UserCircle className="w-12 h-12 text-brand-teal mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-brand-navy">Welcome Back</h2>
              <p className="text-gray-500 mt-2">Sign in to your account</p>
            </div>

            {registered && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">Account created successfully! Please sign in.</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  {...register("email")}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  {...register("password")}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-brand-teal hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                <LogIn size={18} />
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-teal font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

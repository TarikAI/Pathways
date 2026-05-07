"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, GraduationCap, Briefcase, Building2 } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
  role: z.enum(["STUDENT", "ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const roles = [
  { value: "STUDENT", label: "Student", icon: GraduationCap },
  { value: "ACADEMIC_SUPERVISOR", label: "Academic Supervisor", icon: Building2 },
  { value: "FIELD_SUPERVISOR", label: "Field Supervisor", icon: Briefcase },
];

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Registration failed");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-beige">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-navy to-brand-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <div className="mb-8">
            <img src="/logo-bg.jpg" alt="Pathways" className="w-[200px] h-auto mx-auto mb-4" />
            <p className="text-white/80 text-xl">Cooperative Training Platform</p>
          </div>
          <div className="max-w-md">
            <img
              src="/vector_illustration.png"
              alt="Students and supervisors working together"
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
            <p className="text-brand-teal">Create your account</p>
          </div>

          <div className="card">
            <div className="text-center mb-8">
              <UserPlus className="w-12 h-12 text-brand-teal mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-brand-navy">Sign Up</h2>
              <p className="text-gray-500 mt-2">Join Pathways to manage your cooperative training</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  {...register("fullName")}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>

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
                <label className="form-label" htmlFor="role">I am a...</label>
                <select
                  id="role"
                  className="form-control"
                  {...register("role")}
                >
                  <option value="">Select your role</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
              </div>

              <div>
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Create a password"
                  {...register("password")}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control"
                  placeholder="Confirm your password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                {submitting ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-brand-teal font-semibold hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

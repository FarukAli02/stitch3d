// File: app/login/page.js
// Purpose: User login interface with modern light theme aesthetics
// Author: Stitch3D-Dev
// Env Required: None (frontend only)

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email")
    .matches(/^[^\s@]+@[^\s@]+\.(com|pk|org|uk)$/i, "Email must end with .com, .pk, .org, or .uk")
    .required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin(values, { setSubmitting, setStatus }) {
    setLoading(true);
    setStatus({ message: "Logging in...", type: "info" });

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ message: data.message || "Invalid credentials", type: "error" });
        setSubmitting(false);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      setStatus({ message: "Login successful", type: "success" });

      // Give a small delay to show success, then route
      setTimeout(() => {
        if (data.role === "customer") {
          router.push("/customer/dashboard");
        } else if (data.role === "supplier") {
          // optional supplier landing — keep simple
          router.push("/supplier/dashboard");
        } else {
          router.push("/");
        }
      }, 300);
    } catch (err) {
      console.error("Login error", err);
      setStatus({ message: "Connection error. Please try again.", type: "error" });
      setSubmitting(false);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600 text-sm">Log in to continue your jacket customization journey</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting, status }) => (
              <Form className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <ErrorMessage name="email">
                    {(msg) => <div className="mt-2 text-xs text-rose-400">{msg}</div>}
                  </ErrorMessage>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <ErrorMessage name="password">
                    {(msg) => <div className="mt-2 text-xs text-rose-400">{msg}</div>}
                  </ErrorMessage>
                </div>

                <div className="flex items-center justify-end">
                  <Link href="/forgotpassword" className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors font-medium">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || loading ? "Logging in..." : "Log In"}
                </button>

                {status && status.message && (
                  <div
                    className={`mt-5 text-center text-sm py-3 px-4 rounded-lg ${
                      status.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : status.type === "error"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-800/50 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {status.message}
                  </div>
                )}
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

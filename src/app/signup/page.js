"use client";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import React from "react";
const SignupSchema = Yup.object().shape({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .matches(/^[^\s@]+@[^\s@]+\.(com|pk|org|uk)$/i, "Email must end with .com, .pk, .org, or .uk")
    .required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});
export default function Signup() {
  const router = useRouter();
  async function handleSignup(values, { setSubmitting, setStatus }) {
    setStatus({ message: "Creating account...", type: "info" });
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ message: `❌ ${data.message || "Signup failed. Try again."}`, type: "error" });
        setSubmitting(false);
        return;
      }
      setStatus({ message: "✅ Account created! Check your email for a verification code.", type: "success" });
      setTimeout(() => router.push(`/verify?email=${values.email}`), 1500);
    } catch (err) {
      console.error(err);
      setStatus({ message: "❌ Something went wrong. Please try again.", type: "error" });
      setSubmitting(false);
    }
  }
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 shadow-2xl shadow-indigo-900/20 rounded-xl p-6 sm:p-8 transition-all duration-300">
        <h1 className="text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
          Create Your Stitch<span className="text-indigo-400">3D</span> Account
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Sign up to start customizing your leather jackets.
        </p>
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            password: "",
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSignup}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Field
                    name="firstName"
                    placeholder="First Name"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none"
                  />
                  <ErrorMessage name="firstName">
                    {(msg) => <div className="mt-2 text-xs text-rose-300">{msg}</div>}
                  </ErrorMessage>
                </div>
                <div>
                  <Field
                    name="lastName"
                    placeholder="Last Name"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none"
                  />
                  <ErrorMessage name="lastName">
                    {(msg) => <div className="mt-2 text-xs text-rose-300">{msg}</div>}
                  </ErrorMessage>
                </div>
              </div>
              <div>
                <Field
                  name="email"
                  type="email"
                  placeholder="Email address"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none"
                />
                <ErrorMessage name="email">
                  {(msg) => <div className="mt-2 text-xs text-rose-300">{msg}</div>}
                </ErrorMessage>
              </div>
              <div>
                <Field
                  type="password"
                  name="password"
                  placeholder="Password (min 6 chars)"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 focus:outline-none"
                />
                <ErrorMessage name="password">
                  {(msg) => <div className="mt-2 text-xs text-rose-300">{msg}</div>}
                </ErrorMessage>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
              {status && status.message && (
                <div
                  className={`mt-5 text-center text-sm p-4 rounded-lg font-medium transition-colors ${
                    status.type === "success"
                      ? "bg-green-900/30 text-green-300 border border-green-800"
                      : status.type === "error"
                      ? "bg-rose-900/30 text-rose-300 border border-rose-800"
                      : "bg-gray-800 text-gray-300 border border-gray-700"
                  }`}
                >
                  {status.message}
                </div>
              )}
            </Form>
          )}
        </Formik>
        <p className="text-center text-sm mt-6 text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-colors"
          >
            Login
          </a>
        </p>
      </div>
    </main>
  );
}

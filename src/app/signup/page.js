"use client";

import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";

const SignupSchema = Yup.object().shape({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .matches(
      /^[^\s@]+@[^\s@]+\.(com|pk|org|uk)$/i,
      "Email must end with .com, .pk, .org, or .uk"
    )
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function Signup() {
  const router = useRouter();

  async function handleSignup(values, { setSubmitting, setStatus }) {
    setStatus({ message: "Creating your account...", type: "info" });

    try {
      // Only send four fields: firstName, lastName, email, password
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ message: data.message || "Signup failed", type: "error" });
        setSubmitting(false);
        return;
      }

      setStatus({ message: "Account created! Check your email.", type: "success" });
      setTimeout(() => router.push(`/verify?email=${values.email}`), 1200);
    } catch (err) {
      setStatus({ message: "Connection error. Try again.", type: "error" });
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-600 text-sm">Start designing custom jackets with Stitch3D</p>
        </div>

        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/60">
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
              <Form className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <Field
                      name="firstName"
                      placeholder="firstname"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <ErrorMessage name="firstName">
                      {(msg) => <div className="mt-1 text-xs text-rose-600">{msg}</div>}
                    </ErrorMessage>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <Field
                      name="lastName"
                      placeholder="lastname"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <ErrorMessage name="lastName">
                      {(msg) => <div className="mt-1 text-xs text-rose-600">{msg}</div>}
                    </ErrorMessage>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <ErrorMessage name="email">
                    {(msg) => <div className="mt-1 text-xs text-rose-600">{msg}</div>}
                  </ErrorMessage>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <Field
                    name="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <ErrorMessage name="password">
                    {(msg) => <div className="mt-1 text-xs text-rose-600">{msg}</div>}
                  </ErrorMessage>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>

                {/* Status Message */}
                {status?.message && (
                  <div
                    className={`text-center text-sm py-3 px-4 rounded-lg mt-2 ${
                      status.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : status.type === "error"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-100 text-slate-700 border border-slate-300"
                    }`}
                  >
                    {status.message}
                  </div>
                )}
              </Form>
            )}
          </Formik>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

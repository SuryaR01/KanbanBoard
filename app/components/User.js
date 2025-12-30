
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login with NextAuth Credentials
        const result = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        // Register new user
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Registration failed");
        } else {
          // Auto-login after successful registration
          const result = await signIn("credentials", {
            redirect: false,
            email: formData.email,
            password: formData.password,
          });

          if (result?.error) {
            setError("Registration successful! Please login.");
            setIsLogin(true);
          } else {
            router.push("/");
            router.refresh();
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        <p className="text-center text-gray-500 mb-8">
          {isLogin ? "Sign in to continue" : "Sign up to get started"}
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-black"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-black"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({ name: "", email: "", password: "" });
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="mx-3 text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center justify-center gap-3 w-full bg-white text-black border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-6 h-6"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

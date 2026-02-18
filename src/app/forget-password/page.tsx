"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_BASE_URL } from "../../components/utils/api_url";
import Loading from "../../components/utils/loading";
import { Session } from "inspector/promises";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/forget-password`, {
        method: "POST",
        body: new URLSearchParams({
          email: email,
          type: "API",
          reset_url: `https://hp-frontend-three.vercel.app//rest-password`, // from your Postman example
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const data = await res.json();
      setMessage(data.message || "Please check your email.");
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <main className="flex overflow-hidden flex-col bg-blue-400 h-screen max-md:h-auto" id="mainDiv">
            <section className="flex gap-5 max-md:flex-col">
              <article className="w-[200vh] max-md:ml-0 max-md:w-full flex items-end max-md:hidden max-sm:hidden">
                <img src="./Group 1.svg" alt="Logo" className="w-auto max-md:w-1/3 max-sm:w-1/2 mb-0" />
              </article>

              <article className="flex flex-col items-center justify-center w-[500%] h-screen max-md:ml-0 max-md:w-full z-100 px-[40px]">
                <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[550px] max-md:min-h-[300px] max-sm:min-h-[200px]">
                  {/* Left Panel */}
                  <div className="flex-1 bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col items-center justify-center p-8 min-h-[500px] max-sm:min-h-[250px]">
                    <img src="./Group 292.svg" alt="Company Logo" className="w-2/3 mb-4" />
                    <h1 className="text-2xl md:text-3xl font-bold mb-1 text-center">Streamlining Success,</h1>
                    <h1 className="text-2xl md:text-2xl font-bold mb-1 text-center">Energizing Employees</h1>
                    <p className="text-sm md:text-sm text-center">One line Description of The Company</p>
                  </div>

                  {/* Right Panel */}
                  <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Reset Password
                  </h2>
                  <p className="text-sm md:text-base text-gray-500 mb-4">
                    Enter your email address and we’ll send you a reset link
                  </p>

                  {message && (
                    <div className="w-full p-3 mb-3 text-sm text-blue-700 bg-blue-100 rounded-lg">
                      {message}
                    </div>
                  )}

                    <form className="w-full max-w-sm flex flex-col gap-4" onSubmit={handleResetPassword}>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-2xl mt-2"
                    >
                      Send Password Reset Link
                    </button>
                  </form>

                  <div className="mt-3">
                    <button
                      className="text-sm text-blue-500 hover:underline"
                      onClick={() => router.push("/")}
                    >
                      Back to Login
                    </button>
                  </div>
                  </div>
                </div>
              </article>

              <article className="ml-5 w-full max-md:ml-0 max-md:w-full max-md:hidden max-sm:hidden">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/b9e93eff85539beead9a70cd2e4a92d72d046658?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
                  alt="Right Image"
                  className="max-md:max-w-full loginRightImage"
                />
              </article>
            </section>
          </main>
      )}
    </>
  );
};

export default ForgotPassword;

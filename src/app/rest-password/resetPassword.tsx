"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { API_BASE_URL } from "../../components/utils/api_url";
import Loading from "../../components/utils/loading";
import { Lock } from "lucide-react";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // Read email + token from query params (reset link you send in email should contain them)
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          type: "API",
          email: email,
          token: token,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();
      setMessage(data.message || "Password updated successfully!");

      if (res.ok) {
        setTimeout(() => router.push("/"), 2000); // Redirect back to login
      }
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
        <main className="flex overflow-hidden flex-col bg-blue-400 h-screen max-md:h-auto">
          <section className="flex gap-5 max-md:flex-col">
            {/* Left Side */}
            <article className="w-[200vh] max-md:ml-0 max-md:w-full flex items-end max-md:hidden max-sm:hidden">
              <img
                src="./Group 1.svg"
                alt="Logo"
                className="w-auto max-md:w-1/3 max-sm:w-1/2 mb-0"
              />
            </article>

            {/* Center Card */}
            <article className="flex flex-col items-center justify-center w-[500%] h-screen max-md:ml-0 max-md:w-full z-100 px-[40px]">
              <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[550px] max-md:min-h-[300px] max-sm:min-h-[200px]">
                {/* Left Panel */}
                <div className="flex-1 bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col items-center justify-center p-8 min-h-[500px] max-sm:min-h-[250px]">
                  <img
                    src="./Group 292.svg"
                    alt="Company Logo"
                    className="w-2/3 mb-4"
                  />
                  <h1 className="text-2xl md:text-3xl font-bold mb-1 text-center">
                    Streamlining Success,
                  </h1>
                  <h1 className="text-2xl md:text-2xl font-bold mb-1 text-center">
                    Energizing Employees
                  </h1>
                  <p className="text-sm md:text-sm text-center">
                    One line Description of The Company
                  </p>
                </div>

                {/* Right Panel - Password Form */}
                <div className="flex-1 bg-white flex flex-col justify-center items-center p-8">
                  <h2 className="text-2xl md:text-2xl font-bold text-gray-800 mb-6">
                    Create Your Password!
                  </h2>

                  {message && (
                    <div className="w-full p-3 mb-3 text-sm text-blue-700 bg-blue-100 rounded-lg">
                      {message}
                    </div>
                  )}

                  <form
                    className="w-full max-w-sm flex flex-col gap-4"
                    onSubmit={handleSavePassword}
                  >
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">
                        <Lock />
                      </span>
                      <input
                        type="password"
                        placeholder="Enter New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="p-3 pl-10 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">
                        <Lock />
                      </span>
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="p-3 pl-10 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-2xl mt-2"
                    >
                      Save
                    </button>
                  </form>
                </div>
              </div>
            </article>

            {/* Right Side */}
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

export default ResetPassword;

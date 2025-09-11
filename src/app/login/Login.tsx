"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../components/utils/api_url";
import Loading from "../../components/utils/loading"; // Import the Loading component

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [logMessage, setMessage] = useState("");

  // Disable browser back button and handle browser back button click
  useEffect(() => {
    const loggedTime = localStorage.getItem("loggedTime");
    const currentTime = new Date().getTime();
    const lastLoggedTime = loggedTime ? new Date(loggedTime).getTime() : 0;
    const hoursDifference = (currentTime - lastLoggedTime) / (1000 * 60 * 60);
    
    if (loggedTime && hoursDifference < 24) {
      setLoading(true);
      router.push("/Maindashboard");
      return;
    } else {
      localStorage.clear();
      setLoading(false);
      history.pushState(null, "", window.location.pathname);
      window.addEventListener("popstate", function (event) {
        history.pushState(null, "", window.location.pathname);
      });
    }
  }, []);
  // Disable browser back button and handle browser back button click end

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    // get server
    try {
      const response = await fetch(
        `${API_BASE_URL}/login?email=${email}&password=${password}&type=API`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      // console.log("data=", data);
      if (data.status === 0) {
        setLoading(false);
        setMessage(data.message);
      } 
      else if(data.status===1) {
        // store user data in local storage
        setMessage('');
        localStorage.setItem("userData", JSON.stringify(data.sessionData));
        localStorage.setItem("loggedTime", new Date().toISOString());
        router.push("/Maindashboard");
      }
    } catch (error) {
      const gif = document.getElementById("overloadGif");
      const mainDiv = document.getElementById("mainDiv");
      setLoading(false);
      setMessage(`Error fetching menu items: ${error}`);
      console.error("Error fetching menu items:", error);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <main
          className="flex overflow-hidden flex-col bg-blue-400 h-screen max-md:h-auto"
          id="mainDiv"
        >
          <section className="flex gap-5 max-md:flex-col">
            <article className="w-[200vh] max-md:ml-0 max-md:w-full flex items-end max-md:hidden max-sm:hidden">
              <img
                src="./Group 1.svg"
                alt="Logo"
                className="w-auto max-md:w-1/3 max-sm:w-1/2 mb-0"
              />
            </article>

            <article className="flex flex-col items-center justify-center w-[500%] h-screen max-md:ml-0 max-md:w-full z-100 px-[40px]">
              {/* <div className="flex w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl bg-white h-[550px]"> */}
              {/* <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[550px] max-md:min-h-[300px] max-sm:min-h-[200px] max-sm:mx-[20px]"> */}
              <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[550px] max-md:min-h-[300px] max-sm:min-h-[200px]">
                {/* Left Panel */}
                <div className="flex-1 bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col items-center justify-center p-8 min-h-[500px] max-sm:min-h-[250px]">
                  <img
                    src="./Group 292.svg"
                    alt="Company Logo"
                    className="w-2/3 mb-4"
                  />
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">
                    Company Name
                  </h1>
                  <p className="text-sm md:text-lg text-center">
                    One line Description of The Company
                  </p>
                </div>

                {/* Right Panel */}
                <div className="flex-1 bg-white flex flex-col justify-center items-center p-8 min-h-[500px] max-sm:min-h-[200px]">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Hello Again!
                  </h2>
                  <p className="text-sm md:text-base text-gray-500 mb-4">
                    Welcome Back
                  </p>
                  {logMessage && logMessage !== "" && (
                    <div
                      id="alertDiv"
                      className="w-full p-3 mb-3 text-sm text-red-700 bg-red-100 rounded-lg"
                    >
                      <span id="alertMessage">{logMessage}</span>
                    </div>
                  )}

                  <form
                    className="w-full max-w-sm flex flex-col gap-4"
                    onSubmit={handleLogin}
                  >
                    <input
                      type="email"
                      placeholder="Email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-2xl mt-2"
                    >
                      Login
                    </button>
                  </form>

                  <div className="mt-3">
                    <a
                      href="/forget-password"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Forgot Password?
                    </a>
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

export default Login;

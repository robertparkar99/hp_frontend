"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState,useEffect } from "react";

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverUrl, setUrl] = useState("");

  // Disable browser back button and handle browser back button click
    useEffect(() => {
      history.pushState(null, '', window.location.pathname);
      window.addEventListener('popstate', function (event) {
          history.pushState(null, '', window.location.pathname);
      });
    }, []);
  // Disable browser back button and handle browser back button click end

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const gif = document.getElementById("overloadGif");
    const mainDiv = document.getElementById("mainDiv");
    if (gif) {
      gif.style.display = "flex";
    }
    if (mainDiv) {
      mainDiv.style.display = "none";
    }

    // get server 
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
    // console.log("baseUrl=", baseUrl);
    let servUrl = "http://127.0.0.1:8000";
    if(baseUrl=="http://localhost:3000"){
      servUrl = "http://127.0.0.1:8000";
    }
    else{
      servUrl = "https://hp.triz.co.in";
    }
    setUrl(servUrl);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/login?email=${email}&password=${password}&type=API`,
        {
          method: "GET",
           credentials: 'include', 
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      // console.log("data=", data);
      if (!data.status) {
        const gif = document.getElementById("overloadGif");
        const mainDiv = document.getElementById("mainDiv");
        if (gif) {
          gif.style.display = "none";
        }
        if (mainDiv) {
          mainDiv.style.display = "flex";
        }
        const alertDiv = document.getElementById("alertDiv");
        const alertMessage = document.getElementById("alertMessage");
        if (alertDiv && alertMessage) {
          alertDiv.style.display = "block";
          alertMessage.textContent = data.message;
        }
      } else {
        // store user data in local storage
        localStorage.setItem('userData', JSON.stringify(data.sessionData));
        router.push("/Maindashboard");
      }
    } catch (error) {
      const gif = document.getElementById("overloadGif");
      const mainDiv = document.getElementById("mainDiv");
      if (gif) {
        gif.style.display = "none";
      }
      if (mainDiv) {
        mainDiv.style.display = "flex";
      }
      const alertDiv = document.getElementById("alertDiv");
        const alertMessage = document.getElementById("alertMessage");
        if (alertDiv && alertMessage) {
          alertDiv.style.display = "block";
          alertMessage.textContent = String(error);
        }
      console.error("Error fetching menu items:", error);
    }
  };

  return (
    <>
      <div 
          className="overloadGif flex items-center justify-center w-full h-screen z-[1000] bg-white" 
          id="overloadGif" 
          style={{ display: "none" }}
        >
          <img 
            src={`http://127.0.0.1:8000/assets/loading/walking_robo.gif`} 
            alt="overloadGif" 
            className="h-[100px]"
          />
        </div>
    <main className="flex overflow-hidden flex-col bg-blue-400 h-[100vh] max-md:h-auto" id="mainDiv">
     <section className="flex gap-5 max-md:flex-col">
        <article className="w-[200vh] max-md:ml-0 max-md:w-full flex items-end">
          <img
            src="./Group 1.svg"
            alt="Logo"
            className="w-auto max-md:w-1/3 max-sm:w-1/2 mb-0"
          />
        </article>

        <article className="flex flex-col items-center justify-center w-[500%] h-screen max-md:ml-0 max-md:w-full z-100">
          <div className="flex w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl bg-white h-[550px]">
            <div className="w-1/2 bg-gradient-to-b from-blue-700 to-blue-900 flex flex-col items-center justify-center text-white p-10">
              <img
                src="./Group 292.svg"
                alt="Company Logo"
                className="w-2/3 mb-6"
              />
              <h1 className="text-3xl font-bold mb-2">Company Name</h1>
              <p className="text-lg text-center">
                One line Description of The Company
              </p>
            </div>

            <div className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
           
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Hello Again!
              </h2>
              <p className="text-gray-500 mb-6">Welcome Back</p>
              {/* alert message start  */}
              <div
                  id="alertDiv"  style={{ display: "none" }}
                  className="hidden w-full p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
                  role="alert"
                  >
                  <span id="alertMessage"></span>
                </div>
            {/* alert message ends  */}
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
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-2xl mt-4"
                >
                  Login
                </button>
              </form>

              <div className="mt-4">
                <a href="#" className="text-sm text-blue-500 hover:underline">
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>
        </article>

        <article className="ml-5 w-full max-md:ml-0 max-md:w-full">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/b9e93eff85539beead9a70cd2e4a92d72d046658?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
            alt="Right Image"
            className="max-md:max-w-full loginRightImage"
          />
        </article>
      </section>
    </main>
    </>
  );
};

export default Login;

"use client";

import { GoogleLogin } from "@react-oauth/google";

export default function GoogleLoginButton() {
  return (
    <GoogleLogin
      shape="rectangular"
      size="large"
      text="signin_with"
      locale="en"
      logo_alignment="left"
      width="100%"
      onSuccess={async (credentialResponse) => {
        const response = await fetch("https://hp.triz.co.in/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: credentialResponse.credential,
          }),
        });

        const data = await response.json();

        const sessionData = data.sessionData || {
          APP_URL: "https://hp.triz.co.in",
          token: data.token,
          org_type: data.user.org_type || "",
          sub_institute_id: data.user.sub_institute_id || "",
          user_id: data.user.user_id || data.user.id || "",
          user_profile_name: data.user.user_profile_name || "",
          user_image: data.user.user_image || "",
          first_name: data.user.first_name || data.user.name?.split(" ")[0] || "",
          last_name: data.user.last_name || data.user.name?.split(" ").slice(1).join(" ") || "",
        };

        localStorage.setItem("userData", JSON.stringify(sessionData));
        localStorage.setItem("loggedTime", new Date().toISOString());

        window.location.href = "/Maindashboard";
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}
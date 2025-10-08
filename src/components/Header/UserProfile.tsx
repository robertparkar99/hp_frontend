import * as React from "react";
import { useState, useEffect } from "react";

interface UserSessionDataProps {
  userSessionData: any;
}

export const UserProfile: React.FC<UserSessionDataProps> = ({ userSessionData }) => {
  const defaultImage =
    "https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39";

  const [imgSrc, setImgSrc] = useState(defaultImage);

  useEffect(() => {
    if (userSessionData?.userimage && userSessionData.userimage !== "") {
      setImgSrc(
        `https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/${userSessionData.userimage}`
      );
    } else {
      setImgSrc(defaultImage);
    }
  }, [userSessionData]);

  return (
    <div className="flex gap-4 my-auto text-[14px] leading-none text-stone-500">
      {/* <img
        src={imgSrc}
        alt="User icon"
        className="object-contain shrink-0 rounded-full w-[40px] h-[40px]"
        onError={() => setImgSrc(defaultImage)} // 👈 fallback if API image fails
      />

      <p className="my-auto basis-auto">
        {userSessionData?.firstName || userSessionData?.lastName
          ? `${userSessionData.firstName} ${userSessionData.lastName}`
          : "User Profile"}
      </p> */}
    </div>
  );
};

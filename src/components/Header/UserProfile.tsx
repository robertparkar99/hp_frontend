import * as React from "react";
import { useState, useEffect } from "react";

interface UserSessionDataProps {
  userSessionData: any;
}

export const UserProfile: React.FC<UserSessionDataProps> = ({ userSessionData }) => {

  useEffect(() => {
  }, [userSessionData]);

  
  return (
    <div className="flex gap-4 my-auto text-[14px] leading-none text-stone-500">
      {userSessionData.userimage && userSessionData.userimage != '' ? (
      <img
        src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/` + userSessionData.userimage}
        alt="User icon"
        className="object-contain shrink-0 rounded-full w-[40px] h-[40px]"
      />
      ) : (
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
        alt="User icon"
        className="object-contain shrink-0 rounded-full w-[40px] h-[40px]"
      />
      )}

      <p className="my-auto basis-auto">
        {userSessionData?.firstName+' '+userSessionData?.lastName || "User Profile"}
      </p>
    </div>
  );
};

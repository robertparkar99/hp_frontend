import * as React from "react";

export const UserProfile: React.FC = () => {
  return (
    <div className="flex gap-4 my-auto text-[14px]  leading-none text-stone-500">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/630b9c5d4cf92bb87c22892f9e41967c298051a0?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
        alt="User icon"
        className="object-contain shrink-0 aspect-square w-[28px]"
      />
      <p className="my-auto basis-auto">User Profile</p>
    </div>
  );
};

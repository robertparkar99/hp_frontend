import * as React from "react";

export const DecorativeEllipse: React.FC = () => {
  return (
    <section className="flex flex-col grow items-start pt-20 w-full bg-blue-400 rounded-full mt-[619px] max-md:mt-10 max-md:max-w-full">
      <div className="flex flex-col items-start pt-16 bg-blue-400 rounded-full max-md:pr-5">
        <div className="flex shrink-0 bg-blue-400 rounded-full h-[238px]" />
      </div>
    </section>
  );
};

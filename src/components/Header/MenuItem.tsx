"use client";

import * as React from "react";

interface MenuItemProps {
  iconSrc: string;
  text: string;
  onClick?: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  iconSrc,
  text,
  onClick,
}) => {
  return (
    <button
      className="flex gap-3 items-center hover:opacity-80 transition-opacity"
      onClick={onClick}
      aria-label={text}
    >
      <img
        src={iconSrc}
        alt=""
        className="object-contain shrink-0 aspect-square w-[25px]"
        aria-hidden="true"
      />
      <span className="my-auto basis-auto">{text}</span>
    </button>
  );
};

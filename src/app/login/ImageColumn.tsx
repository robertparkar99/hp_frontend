import * as React from "react";

interface ImageColumnProps {
  src: string;
  className?: string;
  aspectRatio?: string;
}

export const ImageColumn: React.FC<ImageColumnProps> = ({
  src,
  className = "",
  aspectRatio = "aspect-[1.08]",
}) => {
  return (
    <img
      src={src}
      className={`object-contain w-full ${aspectRatio} ${className}`}
      alt=""
    />
  );
};

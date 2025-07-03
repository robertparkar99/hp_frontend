import * as React from "react";

interface MenuSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <section className={className}>
      {title && (
        <h2 className="self-start font-medium leading-none text-neutral-400">
          {title}
        </h2>
      )}
      <nav className="flex flex-col gap-2 mt-4">{children}</nav>
    </section>
  );
};

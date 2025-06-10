import * as React from "react";

interface UserProfileProps {
  onClick?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = (props) => {
  // Function to handle the left panel display
  const handleLeftPanel = (item: string) => {
    const el = document.querySelector('.leftaside') as HTMLElement | null
    if (el) {
      el.style.display = 'none'
    }

    const el2 = document.querySelector('.hiddenMenu') as HTMLElement | null
    if (el2) {
      el2.style.display = 'block'
    }

    const main = document.querySelector('.contentDiv') as HTMLElement | null
    if (main) {
      main.style.width = '100%';
      main.style.marginLeft = '0';
    }
  };

  return (
    <header className="flex gap-10 self-start text-1xl leading-none mt-4">
      <div className="flex gap-4">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/6e022c162dc36d40093888ccc1816c6170541029?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
          className="object-contain shrink-0 aspect-square w-[35px]"
          alt="User avatar"
          onClick={props.onClick}
        />
        <h1 className="my-auto basis-auto">User Profile</h1>
      </div>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/fc70410ba0ea2c06e3f4eaec6ca41d0ee1299593?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
        className="object-contain shrink-0 my-auto rounded aspect-square w-[25px]"
        alt="Settings" onClick={() => handleLeftPanel("Organizational Development")}
      />
    </header>
  );
};

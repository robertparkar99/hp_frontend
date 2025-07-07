import * as React from "react";

interface UserProfileProps {
  UserProfileProp:any;
  onClick?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = (props) => {
  // Function to handle the left panel display
  const handleLeftPanel = (item: string) => {
    const el = document.querySelector('.leftaside') as HTMLElement | null;
    const dashboardCard = document.querySelector('.dashboardCard') as HTMLElement | null;
    const renderComponent = document.querySelector('.renderComponent') as HTMLElement | null;

    if (el) {
      el.style.display = 'none'
       if (dashboardCard) {
      dashboardCard.style.height = 'calc(80vh - 20px)';
      }
      if (renderComponent) {
        renderComponent.style.height = 'calc(80vh - 20px)';
        }
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
    <header className="flex gap-6 self-start text-lg leading-none mt-4 p-2" onClick={props.onClick}>
      <div className="flex gap-2">
        {props.UserProfileProp.userimage && props.UserProfileProp.userimage != '' ? (
      <img
        src={`https://s3-triz.fra1.cdn.digitaloceanspaces.com/public/hp_user/` + props.UserProfileProp.userimage}
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
        {props.UserProfileProp && props.UserProfileProp.firstName ? (
          <h1 className="my-auto basis-auto text-[16px]">{props.UserProfileProp.firstName+' '+props.UserProfileProp.lastName}</h1>
        ) : (
          <h1 className="my-auto basis-auto">User Profile</h1>
        )}
        
      </div>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/fc70410ba0ea2c06e3f4eaec6ca41d0ee1299593?placeholderIfAbsent=true&apiKey=f18a54c668db405eb048e2b0a7685d39"
        className="object-contain shrink-0 my-auto rounded aspect-square w-[25px]"
        alt="Settings" onClick={() => handleLeftPanel("Organizational Development")}
      />
    </header>
  );
};

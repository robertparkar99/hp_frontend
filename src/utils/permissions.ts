export const checkPermission = async (
  menuName: string,
  permission: 'can_add' | 'can_edit' | 'can_delete'
): Promise<boolean> => {
  try {
    // Get session data from localStorage
    const userData = localStorage.getItem("userData");
    if (!userData) return false;

    const { APP_URL, token, sub_institute_id, user_profile_id } = JSON.parse(userData);

    // Fetch permissions from API
    const response = await fetch(
      `${APP_URL}/user/ajax_groupwiserights?type=API&token=${token}&sub_institute_id=${sub_institute_id}&profile_id=${user_profile_id}`
    );
    const data = await response.json();

    // Function to find permission for the specified menu
    const findMenuPermission = (data: any, menuName: string, permission: string): boolean => {
      for (const level in data) {
        if (data[level] && typeof data[level] === 'object') {
          for (const parentId in data[level]) {
            if (data[level][parentId] && typeof data[level][parentId] === 'object') {
              for (const menuId in data[level][parentId]) {
                const menu = data[level][parentId][menuId];
                if (menu && menu.menu_name === menuName) {
                  return menu[permission] == 1 || menu[permission] === "1";
                }
              }
            }
          }
        }
      }
      return false;
    };

    return findMenuPermission(data, menuName, permission);
  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
};
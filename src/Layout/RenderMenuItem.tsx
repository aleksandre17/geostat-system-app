import { MenuItemLink, useGetIdentity } from "react-admin";
import { CircularProgress } from "@mui/material";
import { useSettings } from "../context/SettingsContext.tsx";
import SubMenu from "./SubMenu.tsx";
import {
  useState,
  useMemo,
  memo,
  lazy,
  Suspense,
  useCallback,
  useEffect,
} from "react";
import { FolderMenuItem, MenuItem } from "../types/treeCategories";

function findItemPath(
  items: MenuItem[],
  targetSlug: string,
  path: string[] = [],
): string[] | null {
  for (const item of items) {
    const currentPath = [...path, item.slug];

    // შევამოწმოთ მიმდინარე item
    if (item.slug === targetSlug) {
      return currentPath;
    }

    // თუ directory-ა და აქვს children, რეკურსიულად შევამოწმოთ
    if (item.nodeType === "DIRECTORY" && item.children) {
      const result = findItemPath(item.children, targetSlug, currentPath);
      if (result) return result;
    }
  }
  return null;
}

const loadIcon = (iconName?: string) => {
  return lazy(() =>
    import(`@mui-icons/${iconName}.js`).catch(
      () => import("@mui/icons-material/Dashboard"),
    ),
  );
};

const IconWrapper = ({ iconName }: { iconName?: string }) => {
  const Icon = useMemo(() => loadIcon(iconName), [iconName]);
  return (
    <Suspense fallback={<CircularProgress size={16} />}>
      <Icon />
    </Suspense>
  );
};

const RenderMenuItem = ({ item, dense }: { item: MenuItem & any }) => {
  const [state, setState] = useState<Record<string, boolean>>({});
  const { settings } = useSettings();
  const getIconComponent = useCallback((iconName?: string) => {
    return <IconWrapper iconName={iconName} />;
  }, []);

  const user = JSON.parse(localStorage.getItem("user") as string);
  const currentUserId = user?.roles?.userId;

  const findParentChain = useCallback(
    (items: MenuItem[], targetItem: MenuItem): MenuItem[] => {
      const chain: MenuItem[] = [];

      const traverse = (menuItems: MenuItem[]): boolean => {
        for (const menuItem of menuItems) {
          if (menuItem.nodeType === "DIRECTORY") {
            const folderItem = menuItem as FolderMenuItem;
            // Check if current item is direct parent
            if (
              folderItem.children?.some(
                (child) => child.slug === targetItem.slug,
              )
            ) {
              chain.push(menuItem);
              return true;
            }
            // Check children recursively
            if (traverse(folderItem.children)) {
              chain.push(menuItem);
              return true;
            }
          }
        }
        return false;
      };

      traverse(items);
      return chain.reverse(); // Return from root to direct parent
    },
    [],
  );

  const shouldShowItem = useCallback(
    (item: MenuItem): boolean => {
      if (currentUserId == 11) return true; // Admin user
      if (!currentUserId || !settings) return true;

      // First check if the item directly has the user ID
      if (item.userId === currentUserId) {
        return true;
      }

      // If item doesn't have user ID, check parent chain
      const parentChain = findParentChain(settings, item);
      return parentChain.some((parent) => parent.userId === currentUserId);
    },
    [currentUserId, settings, findParentChain],
  );

  useEffect(() => {
    if (!settings || !Array.isArray(settings)) return;

    const currentPath = location.pathname.split("/").filter(Boolean);
    if (currentPath.length === 0) return;

    const targetSlug = currentPath[currentPath.length - 1];
    const fullPathArray = findItemPath(settings, targetSlug);

    if (fullPathArray) {
      setState((prevState) => {
        const newState = { ...prevState };
        fullPathArray.forEach((slug) => {
          if (slug !== targetSlug) {
            // მხოლოდ იმ შემთხვევაში გავხსნათ, თუ უკვე არ არის დახურული მომხმარებლის მიერ
            if (prevState[slug] !== false) {
              newState[slug] = true;
            }
          }
        });
        return newState;
      });
    }
  }, [location.pathname, settings]);

  const handleToggle = (menu: string) =>
    setState((state) => ({ ...state, [menu]: !state[menu] }));

  const fullPath = useMemo(
    () =>
      item.nodeType != "DIRECTORY" && Array.isArray(settings)
        ? (findItemPath(settings, item.slug) || []).join("/")
        : "",
    [item.nodeType, item.slug, settings],
  );

  if (item.nodeType === "DIRECTORY") {
    const folderItem = item as FolderMenuItem;

    // Check if any children should be shown
    const hasVisibleChildren = folderItem.children.some(shouldShowItem);
    if (!hasVisibleChildren) return null;

    return (
      <SubMenu
        key={item.slug}
        handleToggle={() => handleToggle(item.slug)}
        isOpen={state[item.slug] || false}
        name={item.name}
        icon={getIconComponent(item.icon)}
        dense={dense}
      >
        {(item as FolderMenuItem).children.map((child) => (
          <RenderMenuItem dense={dense} key={child.slug} item={child} />
        ))}
      </SubMenu>
    );
  }

  if (!shouldShowItem(item)) return null;

  return (
    <MenuItemLink
      key={item.slug}
      to={`/${fullPath}`}
      state={{ _scrollToTop: true }}
      primaryText={item.name}
      leftIcon={getIconComponent(item.icon)}
      dense={dense}
    />
  );
};

export default memo(RenderMenuItem, (prevProps, nextProps) => {
  return (
    prevProps.item.slug === nextProps.item.slug &&
    prevProps.item.nodeType === nextProps.item.nodeType &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.icon === nextProps.item.icon &&
    JSON.stringify(prevProps.item.children) ===
      JSON.stringify(nextProps.item.children)
  );
});

import { MenuItemLink } from "react-admin";
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

  const getIconComponent = useCallback((iconName?: string) => {
    return <IconWrapper iconName={iconName} />;
  }, []);

  const { settings } = useSettings();

  useEffect(() => {
    if (!settings || !Array.isArray(settings)) return;

    const currentPath = location.pathname.split('/').filter(Boolean);
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

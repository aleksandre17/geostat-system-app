import {
  DashboardMenuItem,
  MenuItemLink,
  MenuProps,
  useSidebarState,
} from "react-admin";
import { Box } from "@mui/material";
import clsx from "clsx";
import { useSettings } from "../context/SettingsContext.tsx";

import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import LockIcon from "@mui/icons-material/Lock";
import PagesIcon from "@mui/icons-material/Pages";
import RenderMenuItem from "./RenderMenuItem.tsx";

const Menu = ({ dense = false }: MenuProps) => {
  const [open] = useSidebarState();
  const { settings } = useSettings();

  return (
    <Box
      sx={{
        "& .MuiList-root": {
          paddingLeft: 2,
        },
        "& .MuiList-root .MuiList-root": {
          paddingLeft: 3,
        },
        width: open ? 500 : 50,
        marginTop: 1,
        marginBottom: 1,
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
      className={clsx({
        "RaMenu-open": open,
        "RaMenu-closed": !open,
      })}
    >
      <DashboardMenuItem />
      <MenuItemLink
        to="/users"
        primaryText="Users"
        leftIcon={<PeopleIcon />} //sx={{ color: "#333", "&:hover": { backgroundColor: "#e0e0e0" } }}
      />
      <MenuItemLink to="/roles" primaryText="Roles" leftIcon={<GroupIcon />} />
      <MenuItemLink
        to="/permissions"
        primaryText="Permissions"
        leftIcon={<LockIcon />}
      />
      <MenuItemLink to="/pages" primaryText="Pages" leftIcon={<PagesIcon />} />
      {settings?.map((item) => (
        <RenderMenuItem dense={dense} key={item.slug} item={item} />
      ))}
    </Box>
  );
};

export default Menu;

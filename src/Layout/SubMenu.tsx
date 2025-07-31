import { memo, ReactElement, ReactNode } from "react";
import {
  List,
  MenuItem,
  ListItemIcon,
  Typography,
  Collapse,
  Tooltip,
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useTranslate, useSidebarState } from "react-admin";

interface Props {
  dense: boolean;
  handleToggle: () => void;
  icon: ReactElement;
  isOpen: boolean;
  name: string;
  children: ReactNode;
}

const SubMenu = (props: Props) => {
  const { handleToggle, isOpen, name, icon, children, dense } = props;
  const translate = useTranslate();

  const [sidebarIsOpen] = useSidebarState();

  const header = (
    <MenuItem dense={dense} onClick={handleToggle}>
      <ListItemIcon sx={{ minWidth: 5 }}>
        {isOpen && children.length > 0? <ExpandMore /> : icon}
      </ListItemIcon>
      <Typography variant="inherit" color="textSecondary">
        {translate(name)}
      </Typography>
    </MenuItem>
  );

  return (
    <div>
      {sidebarIsOpen || isOpen ? (
        header
      ) : (
        <Tooltip title={translate(name)} placement="right">
          {header}
        </Tooltip>
      )}

      {/*sx={{
      "& .MuiMenuItem-root": {
        transition: "padding-left 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
        paddingLeft: (theme) =>
          sidebarIsOpen ? theme.spacing(4) : theme.spacing(2),
      },
      // დინამიური padding ჩადგმული მენიუებისთვის
      ".SubMenu": {
        "& .MuiMenuItem-root": {
          paddingLeft: (theme) => `calc(var(--submenu-level, 0) * ${theme.spacing(2)})`
        }
      },
      // ყოველ ჩადგმულ SubMenu-ს ვუზრდით --submenu-level ცვლადს
      "--submenu-level": "1",
      "& .SubMenu": {
        "--submenu-level": "calc(var(--parent-level, 1) + 1)",
      }
    }}*/}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List dense={dense} component="div" disablePadding className="SubMenu">
          {children}
        </List>
      </Collapse>
    </div>
  );
};

export default memo(SubMenu);

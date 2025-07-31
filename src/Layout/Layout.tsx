import type { ReactNode } from "react";
import {
  Layout as RALayout,
  CheckForApplicationUpdate,
  Sidebar,
} from "react-admin";
import { styled } from "@mui/material/styles";
import Menu from "./Menu";

const CustomSidebar = styled(Sidebar)(() => ({
  //{ theme }
  width: 392, // Set your custom width here
  "& .MuiDrawer-paper": {
    width: 350, // Make sure to match this
  },
}));

export const Layout = ({ children }: { children: ReactNode }) => (
  <RALayout menu={Menu} sidebar={CustomSidebar}>
    {children}
    <CheckForApplicationUpdate />
  </RALayout>
);
``
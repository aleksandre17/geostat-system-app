import { Admin, CustomRoutes, Resource, useStore } from "react-admin";
import { signProvider } from "./providers/signProvider.ts";
import dataProviderFactory from "./providers";
import {
  SettingsProvider,
  useSettings,
} from "./context/SettingsContext";
import { Layout } from "./Layout/Layout.tsx";
import Login from "./Layout/Login";
import { BrowserRouter, Route } from "react-router-dom"; // Use react-router-dom
import { createBrowserHistory } from "history"; // Import history
import UserList from "./pages/users/UserList";
import UserCreate from "./pages/users/UserCreate";
import UserEdit from "./pages/users/UserEdit";
import RoleList from "./pages/roles/RoleList";
import RoleCreate from "./pages/roles/RoleCreate";
import RoleEdit from "./pages/roles/RoleEdit";
import PermissionList from "./pages/permissions/PermissionList";
import PermissionCreate from "./pages/permissions/PermissionCreate";
import PermissionEdit from "./pages/permissions/PermissionEdit";
import PageList from "./pages/pages/PageList.tsx";
import PageCreate from "./pages/pages/PageCreate.tsx";
import PageEdit from "./pages/pages/PageEdit.tsx";
import { Dashboard, AccessUploadPage } from "./pages";
import { useMemo } from "react";
import { themes, ThemeName } from "./themes/themes";
import { Alert } from "@mui/material";
import { settingsDataProvider } from "./providers/settingsDataProvider.ts";

type Item = {
  slug: string;
  nodeType: string;
  children?: Item[];
  // Add other properties as needed
};

type LeafPath = {
  path: string;
  item: Item;
};

function getLeafPaths(items: Item[], path: string[] = []): LeafPath[] {
  let result: LeafPath[] = [];
  for (const item of items) {
    const currentPath = [...path, item.slug];
    if (item.nodeType !== "DIRECTORY") {
      result.push({ path: currentPath.join("/"), item });
    } else if (item.children) {
      result = result.concat(getLeafPaths(item.children, currentPath));
    }
  }
  return result;
}

// Create a history instance
const history = createBrowserHistory();

const AdminWithSettings = () => {
  const [themeName] = useStore<ThemeName>("themeName", "default");
  const singleTheme = themes.find((theme) => theme.name === themeName)?.single;
  const lightTheme = themes.find((theme) => theme.name === themeName)?.light;
  const darkTheme = themes.find((theme) => theme.name === themeName)?.dark;

  // const hasRequested = useRef(false);
  const { settings, error, reloadSettings } = useSettings();

  // useEffect(() => {
  //   if (hasRequested.current) return;
  //   hasRequested.current = true;
  //   (async () => {
  //     const response = await httpClient(
  //       `${import.meta.env.VITE_API_URL}/v1/pages/roots`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );
  //     // Assuming setSettings is available via useSettings
  //     const { updateSettings } = useSettings();
  //     await updateSettings({ data: response.json });
  //   })();
  // }, []);

  const leafPaths = useMemo(
    () => (Array.isArray(settings) ? getLeafPaths(settings) : []),
    [settings],
  );

  if (error) {
    return (
      <Alert
        severity="error"
        action={<button onClick={reloadSettings}>Retry</button>}
      >
        Failed to load settings: {error.message}
      </Alert>
    );
  }

  if (!settings) {
    return <></>;
  }

  console.log("settings leafPaths", settings);
  console.log("leafPaths", leafPaths);

  return (
    <Admin
      loginPage={Login}
      dashboard={Dashboard}
      dataProvider={dataProviderFactory()}
      authProvider={signProvider}
      layout={Layout}
      disableTelemetry
      requireAuth
      theme={singleTheme}
      lightTheme={lightTheme}
      darkTheme={darkTheme}
      defaultTheme="dark"
      history={history}
    >
      <Resource
        name="users"
        list={UserList}
        create={UserCreate}
        edit={UserEdit}
        recordRepresentation="username"
      />
      {/*<Resource*/}
      {/*  name="roles"*/}
      {/*  list={RoleList}*/}
      {/*  create={RoleCreate}*/}
      {/*  edit={RoleEdit}*/}
      {/*  recordRepresentation="name"*/}
      {/*/>*/}
      {/*<Resource*/}
      {/*  name="permissions"*/}
      {/*  list={PermissionList}*/}
      {/*  create={PermissionCreate}*/}
      {/*  edit={PermissionEdit}*/}
      {/*  recordRepresentation="name"*/}
      {/*/>*/}
      <Resource
        name="pages"
        list={PageList}
        create={PageCreate}
        edit={PageEdit}
        recordRepresentation="name"
      />
      <CustomRoutes>
        {leafPaths.map(({ path, item }) => {
          console.log(`Creating route for path: ${path}`, item);
          return (
            <Route
              key={path}
              path={path}
              element={<AccessUploadPage key={path} path={path} item={item} />}
            />
          )
        })}
      </CustomRoutes>
    </Admin>
  );
};

export const App = () => {
  return (
    <SettingsProvider dataProvider={settingsDataProvider}>
      <BrowserRouter>
        <AdminWithSettings />
      </BrowserRouter>
    </SettingsProvider>
  );
};
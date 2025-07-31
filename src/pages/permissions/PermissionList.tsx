import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  ListProps,
} from "react-admin";
import { JSX } from "react/jsx-runtime";

const PermissionList = (props: JSX.IntrinsicAttributes & ListProps) => (
  <List {...props} title="Permissions">
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default PermissionList;
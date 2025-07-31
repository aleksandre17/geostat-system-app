import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  ListProps,
} from "react-admin";
import { JSX } from "react/jsx-runtime";

const UserList = (props: JSX.IntrinsicAttributes & ListProps) => (
  <List {...props} title="Users">
    <Datagrid>
      <TextField source="id" />
      <TextField source="username" />
      <TextField source="email" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default UserList;
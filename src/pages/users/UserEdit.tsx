import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceArrayInput,
  SelectArrayInput,
  EditProps,
} from "react-admin";
import { JSX } from "react/jsx-runtime";

const UserEdit = (props: JSX.IntrinsicAttributes & EditProps<never, Error>) => (
  <Edit {...props} title="Edit User">
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput source="username" />
      <TextInput source="email" />
      <TextInput source="password" type="password" />
      {/*<ReferenceArrayInput source="roles" reference="roles">*/}
      {/*  <SelectArrayInput optionText="name" />*/}
      {/*</ReferenceArrayInput>*/}
    </SimpleForm>
  </Edit>
);

export default UserEdit;
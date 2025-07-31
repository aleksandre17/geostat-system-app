import {
  Create,
  SimpleForm,
  TextInput,
  ReferenceArrayInput,
  SelectArrayInput,
  CreateProps,
} from "react-admin";
import { JSX } from "react/jsx-runtime";

const UserCreate = (
  props: JSX.IntrinsicAttributes & CreateProps<never, Error, never>,
) => (
  <Create {...props} title="Create User">
    <SimpleForm>
      <TextInput source="username" />
      <TextInput source="email" />
      <TextInput source="password" type="password" />
      <ReferenceArrayInput source="roles" reference="roles">
        <SelectArrayInput optionText="name" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

export default UserCreate;
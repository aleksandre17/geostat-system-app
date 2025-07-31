import {
  Create,
  SimpleForm,
  TextInput,
  ReferenceArrayInput,
  SelectArrayInput,
  CreateProps,
} from "react-admin";
import { JSX } from "react/jsx-runtime";

const RoleCreate = (
  props: JSX.IntrinsicAttributes & CreateProps<never, Error, never>,
) => (
  <Create {...props} title="Create Role">
    <SimpleForm>
      <TextInput source="name" />
      <ReferenceArrayInput source="permissions" reference="permissions">
        <SelectArrayInput optionText="name" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

export default RoleCreate;
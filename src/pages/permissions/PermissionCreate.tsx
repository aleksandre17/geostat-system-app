import { Create, CreateProps, SimpleForm, TextInput } from "react-admin";
import { JSX } from "react/jsx-runtime";

const PermissionCreate = (
  props: JSX.IntrinsicAttributes & CreateProps<never, Error, never>,
) => (
  <Create {...props} title="Create Permission">
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);

export default PermissionCreate;
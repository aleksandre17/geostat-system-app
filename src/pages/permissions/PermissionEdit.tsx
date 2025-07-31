import { Edit, EditProps, SimpleForm, TextInput } from "react-admin";
import { JSX } from "react/jsx-runtime";

const PermissionEdit = (
  props: JSX.IntrinsicAttributes & EditProps<never, Error>,
) => (
  <Edit {...props} title="Edit Permission">
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput source="name" />
    </SimpleForm>
  </Edit>
);

export default PermissionEdit;
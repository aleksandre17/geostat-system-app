import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceArrayInput,
  SelectArrayInput,
  EditProps,
} from "react-admin";
import { JSX } from "react/jsx-runtime";

const RoleEdit = (props: JSX.IntrinsicAttributes & EditProps<never, Error>) => (
  <Edit {...props} title="Edit Role">
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput source="name" />
      <ReferenceArrayInput source="permissions" reference="permissions">
        <SelectArrayInput optionText="name" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
);

export default RoleEdit;
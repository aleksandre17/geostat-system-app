import {
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
  CreateProps,
} from "react-admin";
import { RaRecord } from "react-admin";
import { useWatch } from "react-hook-form";
import IconPickerInput from "./IconPickerInput";

type NodeType = "DIRECTORY" | "PAGE";

interface PageData extends RaRecord {
  id?: number;
  nodeType: NodeType;
  name: string;
  level: number;
  slug: string;
  icon?: string;
  parentId?: string;
  description?: string;
  resource?: string;
  metaTitle?: string;
  metaDescription?: string;
  orderIndex?: number;
}

const PageFormContent = () => {
  const isFolder = useWatch({ name: "isFolder" });

  const parentFilter = { nodeType: "DIRECTORY" };

  return (
    <>
      <BooleanInput source="isFolder" label="Is Folder?" />
      <TextInput source="name" />
      <NumberInput source="level" />
      <TextInput source="slug" />
      <IconPickerInput source="icon" />

      {isFolder && <TextInput source="description" multiline />}

      {!isFolder && (
        <>
          <TextInput source="resource" />
          <TextInput source="metaTitle" />
          <TextInput source="metaDescription" multiline />
        </>
      )}

      <ReferenceInput source="parentId" reference="pages" filter={parentFilter}>
        <SelectInput optionText="name" emptyText="No parent" />
      </ReferenceInput>

      <NumberInput source="orderIndex" defaultValue={0} />
    </>
  );
};

const PageCreate = (props: CreateProps) => {
  const transform = (data: Partial<PageData>): PageData => {
    const isDirectory = data.isFolder;

    const baseData = {
      name: data.name!,
      level: data.level!,
      slug: data.slug!,
      icon: data.icon,
      parentId: data.parentId,
      orderIndex: data.orderIndex || 0,
      nodeType: isDirectory ? "DIRECTORY" : ("PAGE" as NodeType),
    };

    if (isDirectory) {
      return {
        ...baseData,
        description: data.description,
        resource: undefined,
        metaTitle: undefined,
        metaDescription: undefined,
      };
    } else {
      return {
        ...baseData,
        resource: data.resource,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        description: undefined,
      };
    }
  };

  return (
    <Create {...props} title="Create Page" transform={transform}>
      <SimpleForm>
        <PageFormContent />
      </SimpleForm>
    </Create>
  );
};

export default PageCreate;

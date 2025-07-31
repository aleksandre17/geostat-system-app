import {
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  NumberInput,
  ReferenceInput,
  SelectInput,
  EditProps,
} from "react-admin";
import { RaRecord, Identifier, useRecordContext } from "react-admin";
import { useWatch } from "react-hook-form";
import IconPickerInput from "./IconPickerInput";

const PageFormContent = () => {
  const record = useRecordContext();
  console.log("Editing Page Record in Form:", record);

  // Define filter for ReferenceInput
  const parentFilter = record?.id
    ? { nodeType: "DIRECTORY", id: record.id }
    : { nodeType: "DIRECTORY" };

  const isFolder = useWatch({ name: "isFolder" });

  return (
    <>
      <TextInput disabled source="id" />
      <BooleanInput source="isFolder" label="Is Folder?" />
      <TextInput source="name" />
      <NumberInput source="level" />
      <TextInput source="slug" />
      <IconPickerInput source="icon" />

      {/* ფოლდერისთვის მხოლოდ description */}
      {isFolder && <TextInput source="description" multiline />}

      {/* Page-ისთვის დამატებითი ველები */}
      {!isFolder && (
        <>
          <TextInput source="resource" />
          <SelectInput
            source="metaDatabaseType"
            label="Database Type"
            choices={[
              { id: "MySql", name: "MySql" },
              { id: "MSSql", name: "MSSql" },
            ]}
          />
          <TextInput source="metaDatabaseUrl" />
          <TextInput source="metaDatabaseUser" />
          <TextInput source="metaDatabasePassword" />
          <TextInput source="metaDatabaseName" />
          <TextInput source="metaTitle" />
          <TextInput source="metaDescription" multiline />
        </>
      )}

      {record && (
        <ReferenceInput
          source="parentId"
          reference="pages"
          filter={parentFilter}
        >
          <SelectInput optionText="name" emptyText="No parent" />
        </ReferenceInput>
      )}
    </>
  );
};

const PageEdit = (props: EditProps) => {
  // Transform data before saving to backend
  const transform = (data: RaRecord<Identifier>) => {
    const isDirectory = data.isFolder;

    // საბაზო მონაცემები, რომლებიც ყველა ტიპის ნოუდს სჭირდება
    const baseData = {
      id: data.id,
      name: data.name,
      level: data.level,
      slug: data.slug,
      icon: data.icon,
      parentId: data.parentId,
      orderIndex: data.orderIndex,
      nodeType: isDirectory ? "DIRECTORY" : "PAGE",
      isFolder: isDirectory,
    };

    if (isDirectory) {
      // DIRECTORY ტიპისთვის მხოლოდ description დავამატოთ
      return {
        ...baseData,
        description: data.description,
        // გავასუფთაოთ PAGE-ის ველები
        resource: null,
        metaDatabaseType: null,
        metaDatabaseUrl: null,
        metaDatabaseUser: null,
        metaDatabasePassword: null,
        metaDescription: null,
        metaDatabaseName: null,
        metaTitle: null,
      };
    } else {
      // PAGE ტიპისთვის დავამატოთ შესაბამისი ველები
      return {
        ...baseData,
        resource: data.resource,
        metaTitle: data.metaTitle,
        metaDatabaseType: data.metaDatabaseType,
        metaDatabaseUrl: data.metaDatabaseUrl,
        metaDatabaseUser: data.metaDatabaseUser,
        metaDatabasePassword: data.metaDatabasePassword,
        metaDescription: data.metaDescription,
        metaDatabaseName: data.metaDatabaseName,
        // გავასუფთაოთ DIRECTORY-ის ველები
        description: null,
      };
    }
  };

  // Transform incoming data to include isFolder
  const transformData = (
    record: RaRecord<Identifier>,
  ): RaRecord<Identifier> => {
    console.log("Transforming data for PageEdit:", record);
    return {
      ...record,
      isFolder: record.nodeType === "DIRECTORY",
    };
  };

  return (
    <Edit
      {...props}
      title="Edit Page"
      transform={transform}
      queryOptions={{
        select: transformData,
      }}
    >
      <SimpleForm>
        <PageFormContent />
      </SimpleForm>
    </Edit>
  );
};

export default PageEdit;

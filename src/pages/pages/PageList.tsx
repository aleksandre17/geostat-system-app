import * as React from "react";
import {
  List,
  useDataProvider,
  useNotify,
  usePermissions,
  useRedirect,
  useDelete,
} from "react-admin";
import SortableTree from "@nosferatu500/react-sortable-tree";
import "@nosferatu500/react-sortable-tree/style.css";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

// Suppress React 19 element.ref warning
// const originalConsoleError = console.error;
// console.error = (...args) => {
//   if (args[0]?.includes("Accessing element.ref was removed")) {
//     return;
//   }
//   originalConsoleError.apply(console, args);
// };

const PageList = (props) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { permissions, isLoading: permissionsLoading } = usePermissions();
  const redirect = useRedirect();
  const [deleteOne] = useDelete();
  const [treeData, setTreeData] = React.useState([]);
  const [originalTreeData, setOriginalTreeData] = React.useState([]);
  const [isSaving, setIsSaving] = React.useState(false);

  const hasWritePermission =
    permissions &&
    Array.isArray(permissions) &&
    permissions.includes("WRITE_RESOURCE");

  const hasDeletePermission =
    permissions &&
    Array.isArray(permissions) &&
    permissions.includes("DELETE_RESOURCE");

  // Load expanded node IDs from localStorage
  const getStoredExpandedIds = () => {
    try {
      const stored = localStorage.getItem("pagesTreeExpandedIds");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading expanded IDs:", error);
      return [];
    }
  };

  // Save expanded node IDs to localStorage
  const saveExpandedIds = (nodes) => {
    const expandedIds: any[] = [];
    const collectExpanded = (nodes) => {
      nodes.forEach((node) => {
        if (node.expanded) expandedIds.push(node.id);
        if (node.children) collectExpanded(node.children);
      });
    };
    collectExpanded(nodes);
    try {
      localStorage.setItem("pagesTreeExpandedIds", JSON.stringify(expandedIds));
    } catch (error) {
      console.error("Error saving expanded IDs:", error);
    }
  };

  React.useEffect(() => {
    dataProvider
      .getList("pages", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "orderIndex", order: "ASC" },
        filter: {},
      })
      .then(({ data }) => {
        const expandedIds = getStoredExpandedIds();
        const formatNode = (item, parentId = null, orderIndex = 0) => ({
          id: item.id,
          name: item.name,
          title: item.name,
          parentId: item.parentId || parentId || null,
          orderIndex: item.orderIndex || orderIndex,
          expanded: expandedIds.includes(item.id),
          children: item.children
            ? item.children.map((child, idx) => formatNode(child, item.id, idx))
            : [],
        });
        const formattedData = data.map((item, idx) =>
          formatNode(item, null, idx),
        );
        //console.log("Formatted data:", JSON.stringify(formattedData, null, 2)); // Debug
        setTreeData(formattedData);
        setOriginalTreeData(formattedData);
      })
      .catch(() => notify("Error loading pages", { type: "error" }));
  }, [dataProvider, notify]);

  const handleTreeChange = (newTreeData) => {
    const updateNodePositions = (nodes, parentId = null) => {
      return nodes.map((node, index) => ({
        ...node,
        parentId: parentId || null,
        orderIndex: index,
        children: node.children
          ? updateNodePositions(node.children, node.id)
          : [],
      }));
    };
    const updatedTreeData = updateNodePositions(newTreeData);
    setTreeData(updatedTreeData);
    saveExpandedIds(updatedTreeData); // Save expanded state after change
  };

  const handleSave = async () => {
    if (!hasWritePermission) {
      notify("No permission to save changes", { type: "error" });
      return;
    }
    setIsSaving(true);
    try {
      const reorders = [];
      const originalNodeMap = new Map();
      const buildNodeMap = (nodes) => {
        nodes.forEach((node) => {
          originalNodeMap.set(node.id, { ...node, children: undefined });
          if (node.children) buildNodeMap(node.children);
        });
      };
      buildNodeMap(originalTreeData);

      const collectReorders = (nodes, parentId = null) => {
        nodes.forEach((node, index) => {
          const oldNode = originalNodeMap.get(node.id);
          if (!oldNode) {
            console.warn(`Node ID ${node.id} not found in originalTreeData`);
            return;
          }
          const oldParentId = oldNode.parentId || null;
          const oldOrderIndex = oldNode.orderIndex || 0;

          console.log(
            `Node ID: ${node.id}, parentId: ${parentId}, oldParentId: ${oldParentId}, orderIndex: ${index}, oldOrderIndex: ${oldOrderIndex}`,
          );

          if (parentId !== oldParentId || index !== oldOrderIndex) {
            reorders.push({
              pageId: node.id,
              parentId,
              orderIndex: index,
            });
          }

          if (node.children) {
            collectReorders(node.children, node.id);
          }
        });
      };

      console.log("treeData:", JSON.stringify(treeData, null, 2));
      console.log(
        "originalTreeData:",
        JSON.stringify(originalTreeData, null, 2),
      );
      collectReorders(treeData);
      console.log("Reorders:", reorders);

      if (reorders.length === 0) {
        notify("No changes to save", { type: "info" });
        setIsSaving(false);
        return;
      }

      await dataProvider.reorderPages("pages", { reorders });
      setOriginalTreeData(treeData);
      notify("Page order saved", { type: "success" });
    } catch (error) {
      notify("Error saving page order", { type: "error" });
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTreeData(originalTreeData);
    notify("Changes discarded", { type: "info" });
  };

  const handleEdit = (id) => {
    saveExpandedIds(treeData); // Save expanded state before redirect
    redirect("edit", "pages", id);
  };

  const handleDelete = (id, name) => {
    const filterNodes = (nodes) =>
      nodes
        .filter((n) => n.id !== id)
        .map((n) => ({
          ...n,
          children: n.children ? filterNodes(n.children) : [],
        }));

    deleteOne(
      "pages",
      { id, meta: { name } },
      {
        undoable: true,
        onSuccess: () => {
          notify(`Page "${name}" deleted`, { type: "info", undoable: true });
          const newTreeData = filterNodes(treeData);
          const newOriginalTreeData = filterNodes(originalTreeData);
          setTreeData(newTreeData);
          setOriginalTreeData(newOriginalTreeData);
          saveExpandedIds(newTreeData); // Update expanded state after delete
        },
        onError: () => {
          notify("Error deleting page", { type: "error" });
        },
      },
    );
  };

  const hasChanges =
    JSON.stringify(treeData) !== JSON.stringify(originalTreeData);

  if (permissionsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <List {...props} title="Pages">
      <Box
        sx={{
          padding: 2,
          borderRadius: 2,
          boxShadow: 1,
          color: "#272727",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Page Hierarchy
        </Typography>
        <div style={{ height: "600px" }}>
          <SortableTree
            treeData={treeData}
            onChange={handleTreeChange}
            canDrag={hasWritePermission}
            canDrop={() => true}
            generateNodeProps={({ node }) => ({
              title: (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>{node.name}</Typography>
                  <Box sx={{ ml: 2 }}>
                    {hasWritePermission && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="#1976d2"
                        sx={{
                          mr: 2,
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => handleEdit(node.id)}
                      >
                        Edit
                      </Typography>
                    )}
                    {hasDeletePermission && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="#d32f2f"
                        sx={{ cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => handleDelete(node.id, node.name)}
                      >
                        Delete
                      </Typography>
                    )}
                  </Box>
                </Box>
              ),
            })}
          />
        </div>
        {hasWritePermission && (
          <Box sx={{ mt: 2, mb: 2, display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                isSaving ? <CircularProgress size={20} /> : <SaveIcon />
              }
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={!hasChanges || isSaving}
            >
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </List>
  );
};

export default PageList;

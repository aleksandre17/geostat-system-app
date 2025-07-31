import React, { useState, useCallback, useRef } from "react";
import { Create, useNotify, SimpleForm, NotificationType } from "react-admin";
import { useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  FormControl,
  FormControlLabel,
  Switch,
  LinearProgress,
  Button,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { AccessUploadButton } from "./AccessUploadButton";
import { MultiSelectYears } from "./MultiSelectYears";
import { httpClient } from "../../providers/httpClient.ts";
import { ArrowBack, Upload } from "@mui/icons-material";
import { Storage as AccessIcon, Download, Info } from "@mui/icons-material";
import { List, ListItem, ListItemText, Divider } from "@mui/material";
import { useWebSocket } from "./hooks/useWebSocket.ts";
import { throttleWithTrailing } from "../../helpers";

//#region Interfaces
interface Item {
  slug: string;
  nodeType: string;
  children?: Item[];
}

interface AccessUploadPageProps {
  item: Item;
  path: string;
}
//#endregion

type NotifyFn = (
  message: string | React.ReactNode,
  options?: NotificationOptions & { type?: NotificationType },
) => void;

const handleDownloadTemplate = async (
  item: { fileName: string },
  notify: NotifyFn,
  empty: boolean,
): Promise<void> => {
  try {
    const response = await fetch(
      `http://localhost:8081/api/v1/import/mssql-to-access?metaDatabaseType=${item.metaDatabaseType}&fileName=${encodeURIComponent(item.metaDatabaseName)}&empty=${empty}&metaDatabaseUrl=${encodeURIComponent(item.metaDatabaseUrl)}&metaDatabaseUser=${encodeURIComponent(item.metaDatabaseUser)}&metaDatabasePassword=${encodeURIComponent(item.metaDatabasePassword)}`,
    );
    if (!response.ok) {
      notify("Download failed.", { type: "error" });
      return;
    }

    const blob = await response.blob();
    // Try to get filename from Content-Disposition header
    const disposition = response.headers.get("Content-Disposition");
    let filename = item.metaDatabaseName.endsWith(".accdb")
      ? item.metaDatabaseName
      : `${item.metaDatabaseName}.accdb`;
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match) filename = match[1];
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Download failed:", error);
    notify("Download failed.", { type: "error" });
  }
};

export const AccessUploadPage: React.FC<AccessUploadPageProps> = ({
  item,
  path,
  ...props
}) => {
  const { id } = useParams();
  const notify = useNotify();

  console.log("AccessUploadPage rendered with item:", item);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [emptyOrData, setEmptyOrData] = useState(false); // New state
  const [clearServerData, setClearServerData] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadMessage, setUploadMessage] = useState<string>("");

  //console.log("AccessUploadPage rendered with item:", item);

  const taskIdRef = useRef<string>(uuidv4());

  const throttledUpdate = useRef(
    throttleWithTrailing(
      ({ progress, message }: { progress: number; message: string }) => {
        setUploadProgress(progress);
        setUploadMessage(message);
      },
      30,
    ),
  ).current;

  const handleProgressUpdate = useCallback(
    (progress: number, message: string) => {
      throttledUpdate({ progress, message });
      //console.log(`Progress: ${progress}, Message: ${message}`);
      if (progress >= 100) {
        notify("File uploaded successfully", { type: "success" });
      } else if (message?.startsWith("Error")) {
        notify(message, { type: "error" });
      }
    },
    [notify, throttledUpdate],
  );

  const handleWebSocketError = useCallback(
    (error: string) => {
      notify(error, { type: "error" });
      setUploadMessage(error);
    },
    [notify],
  );

  const { isConnected } = useWebSocket({
    taskId: taskIdRef.current,
    onProgress: handleProgressUpdate,
    onError: handleWebSocketError,
  });

  //#region Handlers
  const handleSave = useCallback(async () => {
    if (!selectedFile) {
      notify("Please select a file to upload.", { type: "warning" });
      return;
    }

    if (!isConnected()) {
      notify("WebSocket not connected, please try again", { type: "error" });
      return;
    }

    try {
      setUploadProgress(0);
      setUploadMessage("");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append(
        "payload",
        JSON.stringify({
          metaDatabaseType: item.metaDatabaseType,
          metaDatabaseName: item.metaDatabaseName,
          years: selectedYears,
          clearServerData: clearServerData.toString(),
          taskId: taskIdRef.current,
          metaDatabaseUrl: item.metaDatabaseUrl,
          metaDatabaseUser: item.metaDatabaseUser,
          metaDatabasePassword: item.metaDatabasePassword,
        }),
      );

      await httpClient(`http://localhost:8081/api/v1/${path}`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000,
      });
    } catch (error: any) {
      const msg = `Upload failed: ${error.message || error}`;
      setUploadMessage(msg);
      notify(msg, { type: "error" });
    }
  }, [selectedFile, isConnected, notify, selectedYears, clearServerData, path]);

  const handleFileSelected = useCallback((file: File | null) => {
    setSelectedFile(file);
  }, []);

  const handleYearsChange = useCallback((years: string[]) => {
    setSelectedYears(years);
  }, []);

  const handleClearServerDataChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setClearServerData(e.target.checked);
    },
    [],
  );
  //#endregion

  //#region Render

  const Aside = useCallback(
    () => (
      <Box
        sx={{
          width: 300,
          minWidth: 300,
          maxWidth: 300,
          flexShrink: 0,
          height: "100%",
          padding: 2,
          bgcolor: "background.paper",
          borderLeft: 1,
          borderColor: "divider",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AccessIcon
            sx={{
              fontSize: 120,
              color: "primary.main",
            }}
          />
          <Typography variant="h6">Access</Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={emptyOrData}
                onChange={(e) => setEmptyOrData(e.target.checked)}
                color="primary"
              />
            }
            label="მხოლოდ ცარიელი"
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            შაბლონ ფაილი
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              handleDownloadTemplate({ ...item }, notify, emptyOrData)
            }
            startIcon={<Download />}
            sx={{ width: "100%", textTransform: "none" }}
          >
            შაბლონის ჩამოტვირთვა
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <List
          subheader={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Info fontSize="small" color="primary" />
              <Typography variant="subtitle2">ინსტრუქცია</Typography>
            </Box>
          }
          dense
        >
          <ListItem>
            <ListItemText
              primary="ჩამოტვირთეთ შაბლონის ფაილი"
              secondary="გამოიყენეთ იგი საწყისად"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="შეავსეთ თქვენი მონაცემები"
              secondary="დაიცავით შაბლონის სტრუქტურა"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="ატვირთეთ შევსებული ფაილი"
              secondary="სისტემა ავტომატურად დაამუშავებს თქვენს მონაცემებს"
            />
          </ListItem>
        </List>
      </Box>
    ),
    [emptyOrData, item.metaDatabaseName, notify],
  );

  return (
    <Create
      // In the <Create> sx prop:
      sx={{
        display: "flex",
        "& .RaCreate-main": {
          flex: "1 1 0%",
          minWidth: 0, // Prevents overflow
        },
      }}
      aside={<Aside />}
      resource={path}
      id={id || item.slug}
      title={`Upload Access Database for ${item.slug}`}
      {...props}
    >
      <SimpleForm onSubmit={handleSave} toolbar={null}>
        <Container maxWidth={false} sx={{ p: 3 }}>
          <Grid
            container
            spacing={4}
            sx={{
              width: "100%",
              margin: 0,
              minHeight: "50vh",
            }}
          >
            {/* მარცხენა სვეტი - ოფციები */}
            <Grid
              size={6}
              sx={{
                display: "flex",
                "& > .MuiPaper-root": {
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  flex: 1,
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                  პარამეტრები
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Box sx={{ mb: 4 }}>
                    <FormControl component="fieldset" fullWidth>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={clearServerData}
                            onChange={handleClearServerDataChange}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle1">
                              არსებული მონაცემების წაშლა
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              არსებული მონაცემების წაშლა და ახალი ფაილის ატვირთვა
                            </Typography>
                          </Box>
                        }
                      />
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      კონკრეტული წლების არჩევა (წასაშლელად)
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      აირჩიეთ წლები, რომლებიც გინდათ წაიშალოს
                    </Typography>
                    <MultiSelectYears
                      value={selectedYears}
                      onChange={handleYearsChange}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* მარჯვენა სვეტი - ფაილის ატვირთვა */}
            <Grid
              size={6}
              sx={{
                display: "flex",
                "& > .MuiPaper-root": {
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  flex: 1,
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                  ფაილი
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 4,
                    flex: 1,
                    bgcolor: "action.hover",
                  }}
                >
                  <AccessUploadButton
                    onFileSelected={handleFileSelected}
                    selectedFile={selectedFile}
                  />
                  {selectedFile && (
                    <Typography
                      variant="body2"
                      color="primary.main"
                      sx={{ mt: 2 }}
                    >
                      Selected: {selectedFile.name}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* სტატუს პანელი */}
            <Grid size={12}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  width: "100%",
                  bgcolor:
                    uploadProgress === 100
                      ? "success.light"
                      : "background.paper",
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6">Upload Status</Typography>
                    <Typography
                      variant="h6"
                      color="primary.main"
                      sx={{ minWidth: 48, textAlign: "right" }} // Ensures enough space for "100%"
                    >
                      {Math.round(uploadProgress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
                {uploadMessage && (
                  <Typography
                    variant="body1"
                    color={uploadProgress === 100 ? "success.dark" : "error.main"}
                    sx={{ minHeight: 24 }} // Reserve space for one line
                  >
                    {uploadMessage}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ქვედა პანელი */}
          <Paper
            elevation={3}
            sx={{
              mt: 4,
              p: 2,
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {selectedFile
                ? `Ready to upload: ${selectedFile.name}`
                : "Select a database file to upload"}
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => history.goBack()}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => {
                  e.preventDefault();
                  handleSave().then(() => {});
                }}
                disabled={
                  !selectedFile || (uploadProgress > 0 && uploadProgress < 100)
                }
                endIcon={<Upload />}
                sx={{ minWidth: 150 }}
              >
                Upload
              </Button>
            </Box>
          </Paper>
        </Container>
      </SimpleForm>
    </Create>
  );
  //#endregion
};

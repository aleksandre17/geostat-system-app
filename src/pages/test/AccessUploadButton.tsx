import React, { useState, useCallback } from "react";
import { Button, LinearProgress, Typography } from "@mui/material";
import { useNotify } from "react-admin";

interface AccessUploadButtonProps {
  onFileSelected: (file: File | null) => void;
  selectedFile?: File | null;
}

export const AccessUploadButton: React.FC<AccessUploadButtonProps> = ({
  onFileSelected,
  selectedFile,
}) => {
  const notify = useNotify();
  const [progress, setProgress] = useState(0);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        notify("No file selected", { type: "error" });
        onFileSelected(null);
        setProgress(0);
        return;
      }

      if (file.size > 1000 * 1024 * 1024) {
        notify("File size exceeds 500 MB. Please upload a smaller file.", {
          type: "error",
        });
        onFileSelected(null);
        setProgress(0);
        return;
      }

      setProgress(0);
      onFileSelected(file);
    },
    [notify, onFileSelected],
  );

  return (
    <>
      <Button
        variant="contained"
        component="label"
        disabled={progress > 0 && progress < 100}
      >
        Upload Access Database
        <input type="file" accept=".accdb" hidden onChange={handleFileChange} />
      </Button>
      {selectedFile && (
        <Typography variant="caption" sx={{ mt: 1 }}>
          Selected: {selectedFile.name}
        </Typography>
      )}
      {progress > 0 && progress < 100 && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mt: 2, width: "100%" }}
        />
      )}
      {progress === 100 && (
        <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
          File selected
        </Typography>
      )}
    </>
  );
};

import { useInput, InputHelperText } from "react-admin";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Grid,
  Box,
  Typography,
  FormControl,
  FormHelperText,
  InputLabel,
  Pagination,
} from "@mui/material";
import * as Icons from "@mui/icons-material";
import { SvgIconProps } from "@mui/material/SvgIcon";
import React, { useState, useMemo, useRef } from "react";

interface IconPickerInputProps {
  source: string;
  label?: string;
  helperText?: string;
}

// Native debounce function
const debounce = (func: (value: string) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (value: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(value), delay);
  };
};

const IconPickerInput: React.FC<IconPickerInputProps> = ({
                                                           source,
                                                           label = "Icon",
                                                           helperText,
                                                         }) => {
  const {
    field,
    fieldState: { error, isTouched },
    formState: { isSubmitted },
  } = useInput({ source });

  // const iconList: { name: string; component: React.ComponentType<SvgIconProps> }[] = (() => {
  //   const keys = Object.keys(Icons);
  //   console.log('Icons keys count:', keys.length, 'Sample:', keys.slice(0, 10));
  //
  //   const filteredKeys = keys.filter((key) => {
  //     const Icon = Icons[key as keyof typeof Icons];
  //     const isComponent = typeof Icon === 'function';
  //     const isValidName = !['createSvgIcon'].includes(key);
  //     const isFilled = !key.match(/(Outlined|TwoTone|Rounded|Sharp)$/);
  //     const passesFilter = isComponent && isValidName && isFilled;
  //     console.log(`Icon ${key}: isComponent=${isComponent}, isValidName=${isValidName}, isFilled=${isFilled}, passesFilter=${passesFilter}`);
  //     return passesFilter;
  //   });
  //
  //   console.log('Filtered keys count:', filteredKeys.length, 'Sample:', filteredKeys.slice(0, 10));
  //
  //   const filtered = filteredKeys.map((key) => {
  //     const component = Icons[key as keyof typeof Icons];
  //     console.log(`Mapping icon ${key}`);
  //     return { name: key, component };
  //   });

  // const iconList: { name: string; component: React.ComponentType<SvgIconProps> }[] = (() => {
  //   const keys = Object.keys(Icons);
  //   console.log('Icons keys count:', keys.length, 'Sample:', keys.slice(0, 10));
  //
  //   const filtered = keys
  //     .filter((key) => {
  //       const Icon = Icons[key as keyof typeof Icons];
  //       const isComponent = typeof Icon === 'function' && Icon.prototype?.isReactComponent !== false;
  //       const isValidName = !['createSvgIcon'].includes(key);
  //       const isFilled = !key.match(/(Outlined|TwoTone|Rounded|Sharp)$/);
  //       console.log(`Icon ${key}: isComponent=${isComponent}, isValidName=${isValidName}, isFilled=${isFilled}`);
  //       return isComponent && isValidName && isFilled;
  //     })
  //     .map((key) => ({
  //       name: key,
  //       component: Icons[key as keyof typeof Icons],
  //     }));

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Cache for resolved components
  const iconCache = useRef(
    new Map<string, React.ComponentType<SvgIconProps>>(),
  ).current;

  // Get component from icon export
  const getComponent = (name: string): React.ComponentType<SvgIconProps> => {
    if (iconCache.has(name)) {
      return iconCache.get(name)!;
    }
    const Icon = (Icons as any)[name];
    let component: React.ComponentType<SvgIconProps> | null = null;
    if (typeof Icon === "function") {
      component = Icon;
    } else if (typeof Icon === "object" && Icon) {
      if (typeof (Icon as any).type === "function") {
        component = (Icon as any).type;
      } else if (
        typeof (Icon as any).type === "object" &&
        (Icon as any).type &&
        typeof (Icon as any).type.render === "function"
      ) {
        component = (Icon as any).type.render;
      }
    }
    if (component) {
      iconCache.set(name, component);
      return component;
    }
    return () => null;
  };

  // Dynamic icon list
  const iconNames = useMemo(() => {
    return Object.keys(Icons).filter(
      (key) =>
        !["createSvgIcon"].includes(key) &&
        !key.match(/(Outlined|TwoTone|Rounded|Sharp)$/),
    );
  }, []);

  // Filtered and paginated icons
  const filteredIcons = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = iconNames.filter((name) =>
      name.toLowerCase().includes(lowerSearch),
    );
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize).map((name) => ({
      name,
      component: getComponent(name), //React.lazy(() => import(`@mui/icons-material/${key}`).then(module => ({ default: module.default || module[key] }))),
    }));
  }, [search, page, iconNames]);

  const totalPages = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    const filteredCount = iconNames.filter((name) =>
      name.toLowerCase().includes(lowerSearch),
    ).length;
    return Math.ceil(filteredCount / pageSize);
  }, [search, iconNames]);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearch(value);
        setPage(1);
      }, 200),
    [],
  );

  const handleSelect = (iconName: string | null) => {
    field.onChange(iconName);
    setOpen(false);
    setSearch("");
    setPage(1);
  };

  const SelectedIcon = field.value ? getComponent(field.value) : null;

  return (
    <FormControl fullWidth error={isTouched && !!error}>
      <InputLabel shrink id={`${source}-label`}>
        {label}
      </InputLabel>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          border: "1px solid",
          borderColor: isTouched && error ? "error.main" : "grey.300",
          borderRadius: 1,
          p: 1,
          minHeight: 56,
          cursor: "pointer",
          bgcolor: "background.paper",
          "&:hover": { borderColor: "primary.main" },
        }}
        onClick={() => setOpen(true)}
      >
        {SelectedIcon && <SelectedIcon fontSize="small" color="primary" />}
        <Typography
          variant="body1"
          color={field.value ? "text.primary" : "text.secondary"}
        >
          {field.value || "Select an icon"}
        </Typography>
      </Box>
      <FormHelperText>
        <InputHelperText
          touched={isTouched || isSubmitted}
          error={error?.message}
          helperText={helperText}
        />
      </FormHelperText>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Icon</DialogTitle>
        <DialogContent>
          <TextField
            label="Search Icons"
            value={search}
            onChange={(e) => debouncedSetSearch(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            autoFocus
          />
          <Grid container spacing={2} sx={{ maxHeight: 400, overflow: "auto" }}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1,
                  cursor: "pointer",
                  bgcolor:
                    field.value === null ? "primary.main" : "transparent",
                  color: field.value === null ? "white" : "inherit",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "primary.light", color: "white" },
                }}
                onClick={() => handleSelect(null)}
              >
                <Typography variant="body2">None</Typography>
              </Box>
            </Grid>
            {filteredIcons.map(({ name, component: IconComponent }) => (
              <Grid item xs={4} sm={3} md={2} key={name}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    cursor: "pointer",
                    bgcolor:
                      field.value === name ? "primary.main" : "transparent",
                    color: field.value === name ? "white" : "inherit",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "primary.light", color: "white" },
                  }}
                  onClick={() => handleSelect(name)}
                >
                  <IconComponent fontSize="medium" />
                  <Typography variant="caption" textAlign="center">
                    {name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              sx={{ mt: 2, display: "flex", justifyContent: "center" }}
            />
          )}
        </DialogContent>
      </Dialog>
    </FormControl>
  );
};

export default IconPickerInput;

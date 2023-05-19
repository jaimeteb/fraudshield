import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  TextField,
  Stack,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import * as Yup from "yup";
import { useFormik } from "formik";
import { MESSAGES } from "@src/pages/common/constants";

const formStyles = {
  mt: 2,
  "> div": {
    mb: 2,
  },
};

const validationSchema = Yup.object().shape({
  fraudEmail: Yup.string(),
  fraudWebsite: Yup.string(),
  details: Yup.string().required("Required"),
});

interface ReportFormInterface {
  handleClose: () => void;
}

function ReportForm({ handleClose }: ReportFormInterface) {
  const [isLoading, setIsLoading] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      fraudEmail: "",
      fraudWebsite: "",
      details: "",
    },
    validationSchema: validationSchema,
    onSubmit: ({ fraudEmail, fraudWebsite, details }) => {
      chrome?.runtime?.sendMessage({
        type: MESSAGES.REPORT_FORM,
        content: {
          fraudEmail,
          fraudWebsite,
          details,
        },
      });

      handleClose();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={formStyles}>
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5">Report fraud content</Typography>
        <IconButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <TextField
        error={formik.touched.fraudEmail && Boolean(formik.errors.fraudEmail)}
        fullWidth
        helperText={formik.touched.fraudEmail ? formik.errors.fraudEmail : ""}
        id="fraudEmail"
        name="fraudEmail"
        onChange={formik.handleChange}
        placeholder="Fraudulent email"
        type="email"
        value={formik.values.fraudEmail}
        variant="outlined"
        size="small"
      />
      <TextField
        error={
          formik.touched.fraudWebsite && Boolean(formik.errors.fraudWebsite)
        }
        fullWidth
        helperText={
          formik.touched.fraudWebsite ? formik.errors.fraudWebsite : ""
        }
        id="fraudWebsite"
        name="fraudWebsite"
        onChange={formik.handleChange}
        placeholder="Fraudulent website"
        type="text"
        value={formik.values.fraudWebsite}
        variant="outlined"
        size="small"
      />
      <TextField
        error={formik.touched.details && Boolean(formik.errors.details)}
        fullWidth
        helperText={formik.touched.details ? formik.errors.details : ""}
        id="details"
        name="details"
        onChange={formik.handleChange}
        placeholder="Details"
        type="text"
        value={formik.values.details}
        variant="outlined"
        size="small"
      />
      <Stack direction="column" gap={2} sx={{ mt: 2 }}>
        <Button
          color="primary"
          disabled={isLoading}
          fullWidth
          size="large"
          type="submit"
          variant="contained"
        >
          {isLoading ? "Loading..." : "Report"}
        </Button>
      </Stack>
    </Box>
  );
}

export default ReportForm;

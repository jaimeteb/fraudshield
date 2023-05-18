import React from "react";
import { Box, TextField, Stack, Button, Typography } from "@mui/material";
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
});

interface ReportFormInterface {
  handleClose: () => void;
}

function AnalyzeForm({ handleClose }: ReportFormInterface) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [aiResult, setAiResult] = React.useState(null);

  React.useEffect(() => {
    /**
     * background script listener
     */
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === MESSAGES.BACKGROUND_ANALYZE) {
        setAiResult(message.content);
      }
      sendResponse();
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      fraudEmail: "",
      fraudWebsite: "",
    },
    validationSchema: validationSchema,
    onSubmit: ({ fraudEmail, fraudWebsite }) => {
      chrome?.runtime?.sendMessage({
        type: MESSAGES.ANALYZE_FORM,
        content: {
          fraudEmail,
          fraudWebsite,
        },
      });
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={formStyles}>
      <Stack flexDirection="row" justifyContent="space-between">
        <Typography variant="h5" sx={{ pb: 1 }}>
          Analyze email or website
        </Typography>
        <Typography onClick={handleClose} variant="h5" sx={{ pb: 1 }}>
          Close
        </Typography>
      </Stack>
      {aiResult ? (
        <Stack justifyContent="space-between" gap="20px">
          {formik.values.fraudEmail ? (
            <Typography variant="body2" sx={{ pb: 1 }}>
              Email {formik.values.fraudEmail} was reported{" "}
              {aiResult.email_reports} times
            </Typography>
          ) : null}
          {formik.values.fraudWebsite ? (
            <Typography variant="body2" sx={{ pb: 1 }}>
              Website {formik.values.fraudWebsite} was reported{" "}
              {aiResult.website_reports} times
            </Typography>
          ) : null}
        </Stack>
      ) : (
        <>
          <TextField
            error={
              formik.touched.fraudEmail && Boolean(formik.errors.fraudEmail)
            }
            fullWidth
            helperText={
              formik.touched.fraudEmail ? formik.errors.fraudEmail : ""
            }
            id="fraudEmail"
            name="fraudEmail"
            onChange={formik.handleChange}
            placeholder="Analyze email"
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
            placeholder="Analyze website"
            type="text"
            value={formik.values.fraudWebsite}
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
              {isLoading ? "Loading..." : "Analyze"}
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}

export default AnalyzeForm;

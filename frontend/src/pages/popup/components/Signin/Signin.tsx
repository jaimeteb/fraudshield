import React from "react";
import { Box, TextField, Stack, Button } from "@mui/material";
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
  email: Yup.string().email().required("Required"),
  password: Yup.string().required("Required"),
});

function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: ({ email, password }) => {
      chrome?.runtime?.sendMessage({
        type: MESSAGES.POPUP.SIGNIN,
        content: {
          email,
          password,
        },
      });
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={formStyles}>
      <TextField
        error={formik.touched.email && Boolean(formik.errors.email)}
        fullWidth
        helperText={formik.touched.email ? formik.errors.email : ""}
        id="email"
        name="email"
        onChange={formik.handleChange}
        placeholder="E-mail"
        type="email"
        value={formik.values.email}
        variant="outlined"
      />
      <TextField
        autoComplete="off"
        error={formik.touched.password && Boolean(formik.errors.password)}
        fullWidth
        helperText={formik.touched.password ? formik.errors.password : ""}
        id="password"
        name="password"
        onChange={formik.handleChange}
        placeholder="Password"
        type="password"
        value={formik.values.password}
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
          {isLoading ? "Loading..." : "Sign in"}
        </Button>
      </Stack>
    </Box>
  );
}

export default LoginForm;

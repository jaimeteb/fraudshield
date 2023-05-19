import { Box, Typography, Link } from "@mui/material";
import useStyles from "../styles/styles";

const Footer = () => {
  const classes = useStyles();

  return (
    <Box sx={{ flexGrow: 1 }} className={classes.footerContainer}>
      <Typography className={classes.footerText}>
        Provided by {' '}
        <Link href="https://appseed.us" target="_blank" underline="none">
          FraudShield
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;

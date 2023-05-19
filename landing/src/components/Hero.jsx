import { Grid, Typography, Button, Box } from "@mui/material";
// import myteam from "../images/myteam.jpg";
import browsing from "../images/browsing.jpg";
import useStyles from "../styles/styles";

const Hero = () => {
  const classes = useStyles();

  return (
    <Box className={classes.heroBox}>
      <Grid container spacing={6} className={classes.gridContainer}>
        <Grid item xs={12} md={7}>
          <Typography variant="h3" fontWeight={700} className={classes.title}>
            Stay safe online
          </Typography>
          <Typography variant="h6" className={classes.subtitle}>
            FraudShield protects you during your online journey. Be aware of the
            content of websites with a simple Chrome Extension. Guaranteed fraud
            detection in e-commerce, email, messaging applications and job ads.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: "200px", fontSize: "16px" }}
          >
            Sign up
          </Button>
        </Grid>
        <Grid item xs={12} md={5}>
          <img src={browsing} alt="Browsing" className={classes.largeImage} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Hero;

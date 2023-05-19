import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import Download from '@mui/icons-material/Download';
import HowToReg from '@mui/icons-material/HowToReg';
import Shield from '@mui/icons-material/Shield';
import useStyles from '../styles/styles';

const Section = () => {
  const classes = useStyles();

  const sectionItems = [
    {
      id: 1,
      icon: <Download sx={{ fontSize: 100 }} color="primary" />,
      sentence:
        'Install the FraudShield Chrome Extension',
    },
    {
      id: 2,
      icon: <HowToReg sx={{ fontSize: 100 }} color="primary" />,
      sentence:
        'Create an account.',
    },
    {
      id: 3,
      icon: <Shield sx={{ fontSize: 100 }} color="primary" />,
      sentence: 'Start broswing safely!',
    },
  ];
  return (
    <Box sx={{ flexGrow: 1, minHeight: '400px' }}>
      <Grid container className={classes.sectionGridContainer}>
        {sectionItems.map((item) => (
          <Grid
            item
            xs={12}
            md={3.5}
            minHeight={250}
            key={item.id}
            className={classes.sectionGridItem}
          >
            {item.icon}
            <Typography variant="h4">{item.sentence}</Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Section;
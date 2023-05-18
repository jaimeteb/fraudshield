import React from "react";
import {
  MESSAGES,
  statsUsed,
  statsFraud,
  statsReported,
} from "@src/pages/common/constants";
import { Typography } from "@mui/material";

function Stats() {
  const [stats, setStats] = React.useState(null);
  React.useEffect(() => {
    const getUserEmail = async () => {
      const res = await chrome.storage.sync.get([
        statsUsed,
        statsFraud,
        statsReported,
      ]);
      if (res[statsUsed] || res[statsFraud] || res[statsReported]) {
        setStats({
          used: res[statsUsed],
          fraud: res[statsFraud],
          report: res[statsReported],
        });
      }
    };

    getUserEmail();

    chrome?.runtime?.sendMessage({
      type: MESSAGES.GET_STATS,
      content: {},
    });
  }, []);

  return stats ? (
    <Typography variant="body2" sx={{ mt: 1 }}>
      Used/Fraud/Reported: {stats.used}/{stats.fraud}/{stats.report}
    </Typography>
  ) : null;
}

export default Stats;

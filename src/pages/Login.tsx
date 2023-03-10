import { Box, Typography } from "@mui/material";
import { useEffect } from "react";

function Login(): JSX.Element {

    useEffect(() => {
        (async () => {
          const ret = await fetch('/.auth/me');
          const me = await ret.json();
          console.log({me});
        })()
    }, []);      
  
    return (
    <>
      <Box 
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Typography component="div" variant="caption">
          ログイン
        </Typography>
      </Box>
    </>
    );
};
export default Login;
import { Alert, Box, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import LeftDrawer from "../component/LeftDrawer";
import Header from "../component/Header";
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

function Login(): JSX.Element {
    //LeftDrawerの設定
    const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false);
    const [roleList, setRoleList] = useState<[]>([]);

    useEffect(() => {
      (async () => {
        const ret = await fetch('/.auth/me');
        const me = await ret.json();
        if(me.clientPrincipal){
          setRoleList(me.clientPrincipal.userRoles);            
          console.log(me.clientPrincipal.userRoles)
        }
      })()
  }, []);      

    return (
    <>
      <Header
        setOpenLeftDrawer={setOpenLeftDrawer}
        />
      <LeftDrawer
        openLeftDrawer={openLeftDrawer}
        setOpenLeftDrawer={setOpenLeftDrawer}
      />
      <Box 
        sx={{ p: 3 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        {(roleList?.length === 0) ?
          <>
          <Typography variant="caption" sx={{marginBottom:3}}>
            献血施設もしくは血液を利用する施設のユーザはアカウント作成をするために、事前にメールで招待した同じ方法でSNS認証を行う必要があります。
          </Typography>
          <Alert severity="info" style={{fontSize:"11px"}} sx={{marginBottom:3}}>
              SNS認証は、アカウントを作成する初回のみ行う必要があります。
            </Alert>
          <Box
          mt={5}
          >
            <List> 
              <ListItem disablePadding>
              <ListItemButton
                  onClick={ () => {
                  window.location.replace(`${window.location.href.slice(0,-6)}/.auth/login/google`)
                  setOpenLeftDrawer(false)
                  }}
              >
                  <ListItemIcon>
                  <GoogleIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Googleアカウントで認証"} />
              </ListItemButton>
              </ListItem>
            </List>
            <List> 
              <ListItem disablePadding>
              <ListItemButton
                  onClick={ () => {
                  window.location.replace(`${window.location.href.slice(0,-6)}/.auth/login/facebook`)
                  setOpenLeftDrawer(false)
                  }}
              >
                  <ListItemIcon>
                  <FacebookIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Facebookアカウントで認証"} />
              </ListItemButton>
              </ListItem>
            </List>
            <List> 
              <ListItem disablePadding>
              <ListItemButton
                  onClick={ () => {
                  window.location.replace(`${window.location.href.slice(0,-6)}/.auth/login/twitter`)
                  setOpenLeftDrawer(false)
                  }}
              >
                  <ListItemIcon>
                  <TwitterIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Twitterアカウントで認証"} />
              </ListItemButton>
              </ListItem>
            </List>                    
          </Box>
        </>
        :
        <>
          <Typography variant="caption">
            ログアウトをするとSNS認証が解除されます。
          </Typography>
          <Box
            mt={5}
          >
            <Button
              variant="contained"
              onClick={ () => {
                window.location.replace(`${window.location.href.slice(0,-6)}/.auth/logout`)                
              }}
            >
              ログアウト
            </Button>
          </Box>
        </>
        }
      </Box>
    </>
    );
};
export default Login;
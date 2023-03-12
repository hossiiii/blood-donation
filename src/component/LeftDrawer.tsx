import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import InfoSharpIcon from '@mui/icons-material/InfoSharp';
import HomeIcon from '@mui/icons-material/Home';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsApplicationsSharpIcon from '@mui/icons-material/SettingsApplicationsSharp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useEffect, useState } from "react";

function LeftDrawer(props: { openLeftDrawer: boolean ,setOpenLeftDrawer:any}): JSX.Element { //TODO: anyをなんとかする
  //LeftDrawerの設定
    const {
        openLeftDrawer,
        setOpenLeftDrawer,
    } = props

    const navigate = useNavigate();
    const [isRoleUser, setIsRoleUser] = useState<boolean>(false);
    const [isRoleCheck, setIsRoleCheck] = useState<boolean>(false);

    useEffect(() => {
        const getDataFromLocalStorage = () => {
          const data = localStorage.getItem('data')
          if (data) {
            const { role } = JSON.parse(data);
            if (role === "user") setIsRoleUser(true);
            else if (role === "check") setIsRoleCheck(true);
          }
        };
        getDataFromLocalStorage();
    }, [openLeftDrawer]);
    

    return (
        <>
            <Drawer
            anchor={'left'}
            open={openLeftDrawer}
            onClose={() => setOpenLeftDrawer(false)}
            >
            <Box
                sx={{ width: "65vw", height: "100vh", bgcolor: 'background.paper' }}
            >
                <List>
                <ListItem disablePadding sx={{display:"flex",justifyContent:"center"}}>
                <img src="logo.png" width={"100px"} alt="logo"/>
                </ListItem>
                </List>
                <Divider/>
                <List>            
                    <ListItem disablePadding>
                    <ListItemButton
                        onClick={ () => {
                        navigate('/')
                        setOpenLeftDrawer(false)
                        }}
                    >
                        <ListItemIcon>
                        <HomeIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"ホーム"} />
                    </ListItemButton>
                    </ListItem>
                </List>
                <List>            
                    <ListItem disablePadding>
                    <ListItemButton
                        disabled={!isRoleUser}
                        onClick={ () => {
                        navigate('/donation')
                        setOpenLeftDrawer(false)
                        }}
                    >
                        <ListItemIcon>
                        <BloodtypeIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"献血する"} />
                    </ListItemButton>
                    </ListItem>
                </List>
                <List>            
                    <ListItem disablePadding>
                    <ListItemButton
                        disabled={!isRoleCheck}
                        onClick={ () => {
                        navigate('/record')
                        setOpenLeftDrawer(false)
                        }}
                    >
                        <ListItemIcon>
                        <CheckCircleIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"血液の記録 / 確認"} />
                    </ListItemButton>
                    </ListItem>
                </List>
                <List>            
                    <ListItem disablePadding>
                    <ListItemButton
                        disabled={!isRoleUser}
                        onClick={ () => {
                        navigate('/receive')
                        setOpenLeftDrawer(false)
                        }}
                    >
                        <ListItemIcon>
                        <FavoriteIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"受け取る"} />
                    </ListItemButton>
                    </ListItem>
                </List>
                <List>            
                    <ListItem disablePadding>
                    <ListItemButton
                        onClick={ () => {
                        navigate('/infomation')
                        setOpenLeftDrawer(false)
                        }}
                    >
                        <ListItemIcon>
                        <InfoSharpIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"献血施設の方へ"} />
                    </ListItemButton>
                    </ListItem>
                </List>                
                <List>            
                    <ListItem disablePadding>
                    <ListItemButton
                        onClick={ () => {
                        navigate('/setting')
                        setOpenLeftDrawer(false)
                        }}
                    >
                        <ListItemIcon>
                        <SettingsApplicationsSharpIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"設定"} />
                    </ListItemButton>
                    </ListItem>
                </List>    
                {/* <List> 
                    <ListItem disablePadding>
                    <ListItemButton
                        disabled={localStorage.getItem('data') !== null}
                        onClick={ () => {
                        navigate('/login')
                        setOpenLeftDrawer(false)
                        }}
                    >
                        <ListItemIcon>
                        <LoginIcon/>  
                        </ListItemIcon>
                        <ListItemText primary={"SNS認証"} />
                    </ListItemButton>
                    </ListItem>
                </List> */}
            </Box>
            </Drawer>
        </>
      );
};
export default LeftDrawer;
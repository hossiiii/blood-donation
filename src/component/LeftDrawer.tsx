import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useEffect, useState } from "react";

function LeftDrawer(props: { openLeftDrawer: boolean ,setOpenLeftDrawer:any}): JSX.Element { //TODO: anyをなんとかする
  //LeftDrawerの設定
    const {
        openLeftDrawer,
        setOpenLeftDrawer,
    } = props

    const navigate = useNavigate();
    const [isRoleDoation, setIsRoleDoation] = useState<boolean>(false);
    const [isRoleCheck, setIsRoleCheck] = useState<boolean>(false);
    const [isRoleUse, setIsRoleUse] = useState<boolean>(false);

    useEffect(() => {
        const getDataFromLocalStorage = () => {
          const data = localStorage.getItem('data')
          if (data) {
            const { role } = JSON.parse(data);
            if (role === "donation") setIsRoleDoation(true);
            else if (role === "check") setIsRoleCheck(true);
            else if (role === "use") setIsRoleUse(true);
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
                        disabled={!isRoleDoation}
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
                        disabled={!(isRoleCheck || isRoleUse)}
                        onClick={ () => {
                        navigate('/record')
                        setOpenLeftDrawer(false)
                        }}
                    >
                        <ListItemIcon>
                        <HistoryEduIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"血液の記録 / 確認"} />
                    </ListItemButton>
                    </ListItem>
                </List>
                <List>            
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
                </List>
            </Box>
            </Drawer>
        </>
      );
};
export default LeftDrawer;
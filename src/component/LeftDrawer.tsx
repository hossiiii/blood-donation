import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoginIcon from '@mui/icons-material/Login';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from '@mui/icons-material/Home';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';

function LeftDrawer(props: { openLeftDrawer: boolean ,setOpenLeftDrawer:any,roleList:string[]}): JSX.Element { //TODO: anyをなんとかする
  //LeftDrawerの設定
    const {
        openLeftDrawer,
        setOpenLeftDrawer,
        roleList
    } = props

    const navigate = useNavigate();
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
                        disabled={(roleList.includes("check") || roleList.includes("use"))}
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
                        disabled={!(roleList.includes("check") || roleList.includes("use"))}
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
                        onClick={ () => {
                        navigate('/login')
                        setOpenLeftDrawer(false)
                        }}
                    >
                        <ListItemIcon>
                        {(roleList?.length === 0) ?
                        <LoginIcon/>:
                        <ExitToAppIcon/>                            
                        }
                        </ListItemIcon>
                        <ListItemText primary={(roleList?.length === 0)?"SNS認証":"ログアウト"} />
                    </ListItemButton>
                    </ListItem>
                </List>
            </Box>
            </Drawer>
        </>
      );
};
export default LeftDrawer;
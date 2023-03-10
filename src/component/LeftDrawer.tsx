import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

function LeftDrawer(props: { openLeftDrawer: boolean ,setOpenLeftDrawer:any}): JSX.Element { //TODO: anyをなんとかする
  //LeftDrawerの設定
    const {
        openLeftDrawer,
        setOpenLeftDrawer,
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
                    <img src="logo.png" width={"100px"}/>
                </ListItem>
                </List>
                <Divider/>
                <List>            
                    <ListItem disablePadding>
                    <ListItemButton
                        onClick={ () => {
                        navigate('/login')
                        setOpenLeftDrawer(false)
                        }}
                    >
                        <ListItemIcon>
                        <ExitToAppIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"ログアウト"} />
                    </ListItemButton>
                    </ListItem>
                </List>
            </Box>
            </Drawer>
        </>
      );
};
export default LeftDrawer;
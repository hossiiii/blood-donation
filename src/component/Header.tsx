import { Box} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
function Header(props: {setOpenLeftDrawer:any}): JSX.Element {
  //LeftDrawerの設定
    const {
        setOpenLeftDrawer,
    } = props

    return (
        <>
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{position: "relative"}}
        >
            <MenuIcon
                fontSize="large"
                sx={{position: "absolute" ,left: "20px"}}
                onClick={() => setOpenLeftDrawer(true)}
            />
            <img src="logo.png" width={"100px"}/>
        </Box>
        </>
      );
};
export default Header;
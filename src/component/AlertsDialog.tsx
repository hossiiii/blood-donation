import { Box, Button} from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function AlertsDialog(props: {openDialog:boolean,setOpenDialog:any,handleAgreeClick:any,dialogTitle:string,dialogMessage:string}): JSX.Element {
    const {
        openDialog,
        setOpenDialog,
        handleAgreeClick,
        dialogTitle,
        dialogMessage
    } = props

    return (
        <Dialog
            open={openDialog}
            onClose={()=>setOpenDialog(false)}
            PaperProps={{
            style: {borderRadius: 20}
            }}
        >
            <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            >
            <DialogTitle id="alert-dialog-title">
                {`${dialogTitle}`}
            </DialogTitle>
            <DialogContent
            >
                <DialogContentText id="alert-dialog-description">
                {`${dialogMessage}`}
                </DialogContentText>
            </DialogContent>
            <Box borderTop={1}>
                <DialogActions style={{
                padding:"0"
                }}>
                <Box
                width={"40vw"}
                height={"40px"}
                borderRight={1}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}  
                >
                    <Button onClick={()=>setOpenDialog(false)}>キャンセル</Button>
                </Box>
                <Box
                width={"40vw"}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}  
                >
                    <Button onClick={()=>handleAgreeClick()} autoFocus>OK</Button>
                </Box>
                </DialogActions>
            </Box>
            </Box>
        </Dialog>
      );
};
export default AlertsDialog;
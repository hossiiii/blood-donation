import { Box, IconButton, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useState } from "react";
import LeftDrawer from "../component/LeftDrawer";
import Header from "../component/Header";
import PublishIcon from '@mui/icons-material/Publish';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import AlertsSnackbar from "../component/AlertsSnackbar";
import AlertsDialog from "../component/AlertsDialog";
import { useQRCode } from 'next-qrcode';
import {QrCodeReader} from "../component/QrCodeReader";
import { useNavigate } from "react-router-dom";

function Setting(): JSX.Element {
    //LeftDrawerの設定
    const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false);
    const { Image } = useQRCode();
    const [exportData, setExportData] = useState<string | null>(null);

    const navigate = useNavigate();
    const [isOpenQRCamera, setIsOpenQRCamera] = useState<boolean>(false);
    const clickOpenQrReader = () => {
      setIsOpenQRCamera(true);
    };
  
    //SnackBarの設定
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [alertsMessage, setAlertsMessage] = useState<string>("");
    const [severity, setSeverity] = useState< "error" | "success" >("error");

    //Exportダイアログの設定
    const [openExportDialog, setOpenExportDialog] = useState<boolean>(false);
    const handleExportAgreeClick = () => {
      setExportData(localStorage.getItem('data'))
      setOpenExportDialog(false)
      setAlertsMessage("アカウント情報をエクスポートしました。画像を保存して下さい")
      setSeverity("success")
      setOpenSnackbar(true)
    }

    //Importダイアログの設定
    const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
    const handleImportAgreeClick = () => {
      setOpenImportDialog(false)
      clickOpenQrReader()
    }
    
    //DELETEダイアログの設定
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const handleDeleteAgreeClick = () => {
      if(localStorage.getItem('data')){
        localStorage.removeItem('data')
      }
      setOpenDeleteDialog(false)
      setAlertsMessage("ブラウザ上のアカウント情報の削除を削除しました")
      setSeverity("success")
      setOpenSnackbar(true)
    }

    return (
    <>
      <AlertsSnackbar
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        vertical={"bottom"}
        severity={severity}
        message={alertsMessage}
      />
      <AlertsDialog
        openDialog={openExportDialog}
        setOpenDialog={setOpenExportDialog}
        handleAgreeClick={()=>{
          handleExportAgreeClick()
        }}
        dialogTitle={"アカウント情報のエクスポート"}
        dialogMessage={`アカウント情報をQRコードの状態でエクスポートします、よろしいですか？`}
      />
      <AlertsDialog
        openDialog={openImportDialog}
        setOpenDialog={setOpenImportDialog}
        handleAgreeClick={()=>{
          handleImportAgreeClick()
        }}
        dialogTitle={"アカウント情報のインポート"}
        dialogMessage={`QRコードからアカウント情報をインポートします、よろしいですか？`}
      />
      <AlertsDialog
        openDialog={openDeleteDialog}
        setOpenDialog={setOpenDeleteDialog}
        handleAgreeClick={()=>{
          handleDeleteAgreeClick()
        }}
        dialogTitle={"ブラウザ上のアカウント情報の削除"}
        dialogMessage={`アカウント情報をエクスポートしていない限り、データをブラウザ上で復元できなくなります。ブラウザ上から、アカウント情報を削除しますか？`}
      />
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
        width= "85vw"
      >
            <List>
                <ListItem disablePadding
                  secondaryAction={
                    <IconButton edge="end" aria-label="comments">
                      {(localStorage.getItem('data')!==null)?
                      <GetAppIcon />
                      :
                      <PublishIcon />}
                    </IconButton>
                  }
                  onClick={ () => {
                    if(localStorage.getItem('data')!==null){
                      setOpenExportDialog(true)
                    }else{
                      setOpenImportDialog(true)
                    }
                  }}
                >
                <ListItemButton
                >
                <ListItemText primary={(localStorage.getItem('data')!==null)?"アカウント情報のエクスポート":"アカウント情報のインポート"} />
                </ListItemButton>
                </ListItem>
                {(localStorage.getItem('data')!==null)?
                  <ListItem disablePadding
                  secondaryAction={
                    <IconButton edge="end" aria-label="comments">
                      <DeleteSharpIcon />
                    </IconButton>
                  }
                  onClick={ () => {
                    setOpenDeleteDialog(true)
                  }}
                >
                <ListItemButton
                >
                <ListItemText primary={"アカウント情報の削除（ブラウザ上の情報）"} />
                </ListItemButton>
                </ListItem>
                :<></>}
            </List>
            {(exportData !== null)?
              <Image
                text={exportData}
                options={{
                  level: 'H',
                  margin: 3,
                  scale: 10,
                  width: 250,
              }}
          />
            :<></>}
            {isOpenQRCamera && <QrCodeReader onRead={async res => {
              setIsOpenQRCamera(false);
              console.log(res.getText());
              localStorage.setItem('data', res.getText());
              setAlertsMessage("アカウント情報をインポートしました。")
              setSeverity("success")
              setOpenSnackbar(true)
              navigate('/')
            }} setOpen={setIsOpenQRCamera} />}
        </Box>
    </>
    );
};
export default Setting;
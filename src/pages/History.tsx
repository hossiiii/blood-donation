import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import LeftDrawer from "../component/LeftDrawer";
import Header from "../component/Header";
import {createAccount} from "../hooks/useFunction";
import axios from "axios";

function History(): JSX.Element {
    //LeftDrawerの設定
    const [openLeftDrawer, setOpenLeftDrawer] = useState<boolean>(false);
    const [me, setMe] = useState<Object | null>(null);

    useEffect(() => {
        (async () => {
          const ret = await fetch('/.auth/me');
          const me = await ret.json();
          setMe(me);
        })()
    }, []);      

    const handleAccountButtonClick = async (account:{privateKey:string,publicKey:string,address:string}) => {
      const res = await axios.post('http://localhost:7071/api/makeAccount', {
        transfer_amount: 0,
        userPublicKey: account.publicKey,
        role: "donation",
        name: "donor",
      });
      console.log(res);
    }

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
        {(localStorage.getItem('privateKey'))?
        <Box>
          <Typography component="div" variant="caption">
            プライベートキー登録済み
          </Typography>
        </Box>
        :
        <Box>
          <Typography component="div" variant="caption">
            プライベートキー未登録
          </Typography>
          <Button
            variant="contained"
            style={{width: "70vw", marginLeft: "20px" ,borderRadius: "20px"}}
            onClick={() => {
              const account = createAccount()
              handleAccountButtonClick(account)
            }}
          >
            アカウントを作成する
          </Button>
        </Box>
        }

      </Box>
    </>
    );
};
export default History;
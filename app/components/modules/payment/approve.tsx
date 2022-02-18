import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";

interface Props {
  handleClose: Function;
  setActiveStep: Function;
}

const ApproveModal = ({ handleClose, setActiveStep }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <React.Fragment>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <Typography sx={{ my: 4, color: "#eaeaea" }}>
          Please approve the batch pay method to distribute your tokens.
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
          <Button
            color="inherit"
            variant="outlined"
            onClick={() => handleClose()}
            sx={{ mr: 1, color: "#f45151" }}
            id="bCancel"
          >
            Cancel
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          <Button
            onClick={() => {
              setIsLoading(true);

              setIsLoading(false);
              setActiveStep(1);
              /*
              approve(contracts?.tokenContract, contracts?.userContract.address)
                .then((res:amy) => {
                  dispatch({
                    type: "SET_ALLOWANCE",
                    value: true,
                  });
                })
                .catch((err:any) => {
                  setLoading(false);
                  alert(err.message);
                });*/
            }}
            variant="outlined"
            id="bApprove"
          >
            Approve All
          </Button>
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default ApproveModal;

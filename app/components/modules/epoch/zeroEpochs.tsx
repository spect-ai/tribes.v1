import React, { useState } from "react";
import { Grid, Typography } from "@mui/material";
import { PrimaryButton } from "../../elements/styledComponents";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import CreateEpochModal from "./createEpochModal";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../pages/tribe/[id]/space/[bid]";
import CreateEpoch from "./createEpochModal";

type Props = {};

const ZeroEpochs = (props: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { space } = useSpace();
  const { user } = useMoralis();

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: "50vh" }}
    >
      <Grid item xs={3}>
        <Typography variant="h6" sx={{ mb: 2 }} color="text.primary">
          There are no epochs in this space
        </Typography>{" "}
        {user && space.roles[user?.id] === "admin" && (
          <>
            {/* <PrimaryButton
              variant="outlined"
              size="large"
              endIcon={<PlayCircleFilledWhiteIcon />}
              onClick={() => {
                setIsModalOpen(true);
              }}
              sx={{ ml: 16, borderRadius: 1, mt: 2 }}
            >
              Start an epoch
            </PrimaryButton> */}
            <CreateEpoch />
          </>
        )}
      </Grid>
      {isModalOpen && (
        <CreateEpochModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
      )}
    </Grid>
  );
};

export default ZeroEpochs;

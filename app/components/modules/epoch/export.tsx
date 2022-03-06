import React, { useEffect, useState } from "react";
import { PrimaryButton } from "../../elements/styledComponents";
import DownloadIcon from "@mui/icons-material/Download";
import { useRouter } from "next/router";
import { Epoch } from "../../../types";
import { useBoard } from "../taskBoard";
import { downloadCSV } from "../../../utils/utils";

type Props = {
  epoch: Epoch;
};

const CsvExport = ({ epoch }: Props) => {
  const router = useRouter();
  const { data, setData } = useBoard();
  const bid = router.query.bid as string;

  const handleExport = (epoch: Epoch) => {
    if (epoch.type === "Contribution") {
      var rows = [
        ["username", "address", "allocation", "given", "received", "reward"],
      ];
      for (var choice of epoch.choices) {
        rows.push([
          data.memberDetails[choice].username,
          data.memberDetails[choice].ethAddress,
          epoch.memberStats[choice].votesAllocated,
          Object.values(epoch.memberStats[choice].votesGiven).reduce(
            (a, b) => (a as number) + (b as number)
          ),
          epoch.votes[choice],
          epoch.values[choice],
        ]);
      }
      downloadCSV(rows, `${epoch.name}_${epoch.type}_${epoch.startTime}`);
    } else if (epoch.type === "Task") {
      var rows = [
        [
          "id",
          "title",
          "description",
          "created by",
          "created on",
          "received",
          "reward",
        ],
      ];
      for (var choice of epoch.choices) {
        rows.push([
          choice,
          epoch.taskDetails[choice].title,
          epoch.taskDetails[choice].description,
          epoch.taskDetails[choice].creator,
          epoch.taskDetails[choice].createdAt,
          epoch.votes[choice],
          epoch.values[choice],
        ]);
      }
      downloadCSV(rows, `${epoch.name}_${epoch.type}_${epoch.startTime}`);
    }
  };

  return (
    <PrimaryButton
      endIcon={<DownloadIcon />}
      variant="outlined"
      sx={{
        borderRadius: 1,
      }}
      onClick={() => {
        handleExport(epoch);
      }}
    >
      Export to csv
    </PrimaryButton>
  );
};

export default CsvExport;

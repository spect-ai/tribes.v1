import React from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import { PrimaryButton } from '../../elements/styledComponents';
import { Epoch } from '../../../types';
import { downloadCSV } from '../../../utils/utils';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';

type Props = {
  epoch: Epoch;
};

function CsvExport({ epoch }: Props) {
  const { space } = useSpace();

  const handleExport = (ep: Epoch) => {
    if (ep.type === 'Member') {
      const rows = [
        ['username', 'address', 'allocation', 'given', 'received', 'reward'],
      ];
      for (let i = 0; i < ep.choices.length; i += 1) {
        const choice = ep.choices[i];
        rows.push([
          space.memberDetails[choice].username,
          space.memberDetails[choice].ethAddress,
          ep.memberStats[choice].votesAllocated,
          Object.values(epoch.memberStats[choice].votesGiven).reduce(
            (a, b) => (a as number) + (b as number)
          ),
          ep.votes[choice],
          ep.values[choice],
        ]);
      }
      downloadCSV(rows, `${ep.name}_${ep.type}_${ep.startTime}`);
    } else if (epoch.type === 'Task') {
      const rows = [
        [
          'id',
          'title',
          'description',
          'created by',
          'created on',
          'received',
          'reward',
        ],
      ];
      for (let i = 0; i < ep.choices.length; i += 1) {
        const choice = ep.choices[i];
        rows.push([
          choice,
          ep.taskDetails[choice].title,
          ep.taskDetails[choice].description,
          ep.taskDetails[choice].creator,
          ep.taskDetails[choice].createdAt,
          ep.votes[choice],
          ep.values[choice],
        ]);
      }
      downloadCSV(rows, `${ep.name}_${ep.type}_${ep.startTime}`);
    }
  };

  return (
    <PrimaryButton
      endIcon={<DownloadIcon />}
      variant="outlined"
      color="secondary"
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
}

export default CsvExport;

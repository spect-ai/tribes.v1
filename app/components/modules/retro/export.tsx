import React from 'react';
import DownloadIcon from '@mui/icons-material/Download';
import { PrimaryButton } from '../../elements/styledComponents';
import { Epoch } from '../../../types';
import { downloadCSV } from '../../../utils/utils';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';

type Props = {
  period: Epoch;
};

function CsvExport({ period }: Props) {
  const { space } = useSpace();

  const handleExport = (ep: Epoch) => {
    console.log(ep);
    const rows = [
      ['username', 'address', 'allocation', 'given', 'received', 'reward'],
    ];
    for (let i = 0; i < ep.choices.length; i += 1) {
      const choice = ep.choices[i];
      rows.push([
        space.memberDetails[choice].username,
        space.memberDetails[choice].ethAddress,
        ep.memberStats[choice].votesAllocated,
        Object.values(period.memberStats[choice].votesGiven).reduce(
          (a, b) => (a as number) + (b as number)
        ),
        ep.votes[choice],
        ep.values[choice],
      ]);
    }
    downloadCSV(rows, `${ep.name}_${ep.type}_${ep.startTime}`);
  };

  return (
    <PrimaryButton
      startIcon={<DownloadIcon />}
      variant="outlined"
      color="secondary"
      sx={{
        borderRadius: '3px',
        mx: '2rem',
        width: '12rem',
        my: '0.5rem',
      }}
      fullWidth
      id="bPayoutContributors"
      onClick={() => {
        handleExport(period);
      }}
      size="small"
    >
      Export to csv
    </PrimaryButton>
  );
}

export default CsvExport;

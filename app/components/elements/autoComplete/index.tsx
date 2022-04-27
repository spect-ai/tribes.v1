import { Autocomplete, TextField } from '@mui/material';
import React from 'react';

type AutoProps = {
  fieldType?: string;
  options: Array<string>;
  optionLabels?: any;
  currOption: string | undefined | null;
  setCurrOption: any;
  setOpen: Function;
  sx: any;
  closeOnSelect?: boolean;
  multiple?: boolean;
};

function CommonAutocomplete({
  options,
  optionLabels,
  currOption,
  setCurrOption,
  setOpen,
  sx,
  closeOnSelect = true,
  multiple = false,
}: AutoProps) {
  return (
    <Autocomplete
      options={options}
      value={currOption}
      getOptionLabel={optionLabels}
      sx={sx}
      onChange={(event, newValue) => {
        setCurrOption(newValue as string);
        if (closeOnSelect) {
          setOpen(false);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          id="filled-hidden-label-normal"
          size="small"
          fullWidth
          placeholder="Search types"
          color="secondary"
        />
      )}
      multiple={multiple}
    />
  );
}

export default CommonAutocomplete;

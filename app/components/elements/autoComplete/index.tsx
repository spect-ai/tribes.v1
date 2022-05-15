import { Autocomplete, TextField } from '@mui/material';
import React from 'react';

type AutoProps = {
  fieldType?: string;
  options: any[];
  optionLabels?: (option: any) => string;
  currOption: any;
  setCurrOption: (option: any) => void;
  setOpen?: (open: boolean) => void;
  sx: any;
  closeOnSelect?: boolean;
  multiple?: boolean;
  placeholder?: string;
  beforeClose?: (newValue: string | number | null) => void;
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
  placeholder = 'Search types',
  beforeClose,
}: AutoProps) {
  return (
    <Autocomplete
      options={options}
      value={currOption}
      getOptionLabel={optionLabels}
      sx={sx}
      onChange={(event, newValue) => {
        setCurrOption(newValue as string);
        if (closeOnSelect && setOpen) {
          if (beforeClose) beforeClose(newValue);
          setOpen(false);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          id="filled-hidden-label-normal"
          size="small"
          fullWidth
          placeholder={placeholder}
          color="secondary"
        />
      )}
      multiple={multiple}
    />
  );
}

export default CommonAutocomplete;

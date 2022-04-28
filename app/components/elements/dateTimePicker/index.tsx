import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isValid } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import React from 'react';

type DateTimeProps = {
  fieldType?: string;
  id: string;
  label?: string;
  popperProps?: any;
  value: any;
  size?: any;
  sx?: any;
  placeholder?: string;
  handleChange: any;
};

function CommonDateTimePicker({
  fieldType,
  id,
  label,
  popperProps,
  value,
  size = 'small',
  sx,
  placeholder,
  handleChange,
}: DateTimeProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        label={label}
        value={value}
        onChange={handleChange}
        PopperProps={popperProps || { placement: 'right-start' }}
        renderInput={(params) => (
          <TextField {...params} required={false} size={size} />
        )}
        clearable
      />
    </LocalizationProvider>
  );
}

export default CommonDateTimePicker;

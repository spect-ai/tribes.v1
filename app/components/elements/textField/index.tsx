import { TextField } from '@mui/material';
import React from 'react';

type TextFieldProps = {
  fieldType?: string;
  id: string;
  label?: string;
  type?: string;
  value: any;
  size?: any;
  sx?: any;
  placeholder?: string;
  handleChange: Function;
};

function CommonTextField({
  fieldType,
  id,
  label,
  type,
  value,
  size = 'small',
  sx,
  placeholder,
  handleChange,
}: TextFieldProps) {
  return (
    <TextField
      id={id}
      label={label}
      type={type}
      InputLabelProps={{
        shrink: true,
      }}
      size={size}
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        handleChange(e.target.value);
      }}
      sx={sx}
      fullWidth
      color="secondary"
    />
  );
}

export default CommonTextField;

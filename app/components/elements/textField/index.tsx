import { TextField, SxProps, Theme } from '@mui/material';
import React from 'react';

type TextFieldProps = {
  fieldType?: string;
  id: string;
  label?: string;
  type?: string;
  value: any;
  size?: any;
  sx?: SxProps<Theme> | undefined;
  placeholder?: string;
  handleChange: Function;
  testId?: string;
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
  testId,
}: TextFieldProps) {
  return (
    <TextField
      data-testid={testId}
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

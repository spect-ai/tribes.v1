import { Box, Popover, Typography, Avatar } from '@mui/material';
import React, { useState } from 'react';
import CommonAutocomplete from '../autoComplete';
import CommonTextField from '../textField';
import CommonDateTimePicker from '../dateTimePicker';
import { CardButton } from '../styledComponents';
import { PopoverContainer } from '../../modules/cardModal/styles';

type PopProps = {
  buttonText?: any;
  buttonsx?: any;
  avatarSrcCallback?: string;
  avatarDefault?: any;
  popoverContent: Array<any>;
  label?: string;
  beforeClose?: () => void;
  buttonId?: string;
};

function CommonPopover({
  buttonText,
  buttonsx,
  avatarSrcCallback,
  avatarDefault,
  popoverContent,
  label,
  beforeClose,
  buttonId,
}: PopProps) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const openPopover = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  const closePopover = () => {
    if (beforeClose) beforeClose();
    setOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mt: 2,
          mx: 1,
        }}
      >
        {label && (
          <Typography
            sx={{ fontSize: 12, color: 'text.secondary', width: '100%' }}
          >
            {label}
          </Typography>
        )}
        <CardButton
          data-testid={buttonId}
          variant="outlined"
          onClick={openPopover()}
          color="secondary"
          size="small"
          sx={
            buttonsx || {
              padding: '2px',
              minWidth: '3rem',
            }
          }
        >
          {buttonText}
        </CardButton>
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => closePopover()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <PopoverContainer>
          {popoverContent.map((item) => {
            if (item.fieldType === 'autocomplete') {
              return (
                <CommonAutocomplete
                  testId={item.testId}
                  options={item.options}
                  optionLabels={item.optionLabels}
                  currOption={item.currOption}
                  setCurrOption={item.setCurrOption}
                  setOpen={setOpen}
                  closeOnSelect={item.closeOnSelect}
                  sx={item.sx}
                  multiple={item.multiple}
                  beforeClose={item.beforeClose}
                />
              );
            }
            if (item.fieldType === 'textfield') {
              return (
                <CommonTextField
                  testId={item.testId}
                  id={item.id}
                  label={item.label}
                  type={item.type}
                  value={item.value}
                  placeholder={item.placeholder}
                  handleChange={item.handleChange}
                  sx={item.sx}
                  size={item.size}
                />
              );
            }
            if (item.fieldType === 'datetime') {
              return (
                <CommonDateTimePicker
                  id={item.id}
                  label={item.label}
                  value={item.value}
                  handleChange={item.handleChange}
                  sx={item.sx}
                />
              );
            }
            if (item.fieldType === 'typography') {
              return <Typography variant="body2">{item.value}</Typography>;
            }
            return null;
          })}
        </PopoverContainer>
      </Popover>
    </>
  );
}

export default CommonPopover;

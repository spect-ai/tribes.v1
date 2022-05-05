import { Box, Popover, Typography, Avatar } from '@mui/material';
import React, { useState } from 'react';
import CommonAutocomplete from '../autoComplete';
import CommonTextField from '../textField';
import CommonDateTimePicker from '../dateTimePicker';
import { CardButton } from '../styledComponents';
import { PopoverContainer } from '../../modules/cardModal/styles';

type PopProps = {
  buttonText?: string;
  buttonsx?: any;
  avatarSrc?: string;
  avatarDefault?: any;
  popoverContent: Array<any>;
  label?: string;
};

function CommonPopover({
  buttonText,
  buttonsx,
  avatarSrc,
  avatarDefault,
  popoverContent,
  label,
}: PopProps) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const openPopover = () => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  const closePopover = () => {
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
          {(avatarSrc || avatarDefault) && (
            <Avatar
              sx={{
                p: 0,
                mr: 2,
                width: 20,
                height: 20,
                backgroundColor: 'transparent',
              }}
              src={avatarSrc}
            >
              {avatarDefault}
            </Avatar>
          )}
          <Typography
            sx={{
              fontSize: 14,
            }}
          >
            {buttonText || 'select'}
          </Typography>
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
                  options={item.options}
                  optionLabels={item.optionLabels}
                  currOption={item.currOption}
                  setCurrOption={item.setCurrOption}
                  setOpen={setOpen}
                  closeOnSelect={item.closeOnSelect}
                  sx={item.sx}
                  multiple={item.multiple}
                />
              );
            }
            if (item.fieldType === 'textfield') {
              return (
                <CommonTextField
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
            return null;
          })}
        </PopoverContainer>
      </Popover>
    </>
  );
}

export default CommonPopover;

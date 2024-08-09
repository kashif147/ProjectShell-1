
import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Button, Menu, MenuItem, Divider } from '@mui/material';
import { Edit as EditIcon, Archive as ArchiveIcon, FileCopy as FileCopyIcon, MoreHoriz as MoreHorizIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';


function MyMneu({buttonLabel,children,}) {
    const StyledMenu = styled(Menu)(({ theme }) => ({
        '& .MuiPaper-root': {
          borderRadius: 6,
          marginTop: theme.spacing(1),
          minWidth: 180,
          color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
          boxShadow: 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
          '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
              fontSize: 18,
              color: theme.palette.text.secondary,
              marginRight: theme.spacing(1.5),
            },
            '&:active': {
              backgroundColor: theme.palette.action.selectedOpacity,
            },
          },
        },
      }));
      const [anchorEl, setAnchorEl] = useState(null);
      const open = Boolean(anchorEl);
    
      const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
      };
    
      const handleClose = () => {
        setAnchorEl(null);
      };
    
  return (
    <div>
    <Button
      aria-controls={open ? 'customized-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      variant="contained"
      disableElevation
      onClick={handleClick}
      endIcon={<KeyboardArrowDownIcon />}   
    >
     { buttonLabel}
    </Button>
    <StyledMenu
      id="customized-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
    >
        {children}
    </StyledMenu>
  </div>
  )
}

export default MyMneu

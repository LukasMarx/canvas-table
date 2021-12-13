import { Typography } from '@mui/material';
import React, { ReactElement } from 'react';

export default function H1({ children }): ReactElement {
  return <Typography variant="subtitle1">{children}</Typography>;
}

import styled from '@emotion/styled';
import { AppBar, Toolbar, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import SidebarTree from './components/SidebarTree';

const Content = styled.div`
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  width: 100%;
  flex: 1;
  position: relative;
  min-width: 0;
`;

const Sidebar = styled.div`
  width: 100%;
  height: 100%;
  min-width: 0;
  padding: 16px;
`;

const Main = styled.div`
  display: block;
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  width: 100%;
  padding: 16px;
`;

export default function Layout({ children }) {
  return children;
}

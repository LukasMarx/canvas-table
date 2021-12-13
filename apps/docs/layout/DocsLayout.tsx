import styled from '@emotion/styled';
import { AppBar, Toolbar, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import SidebarTree from './components/SidebarTree';

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  flex: 1;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  width: 1200px;
  height: 100%;
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
`;

const Article = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

export default function Layout({ children, articles, meta }) {
  return (
    <>
      <CssBaseline />
      <AppBar position="static" sx={{ height: 48 }}>
        <Toolbar style={{ minHeight: 48 }}>
          <Wrapper>
            <Content style={{ alignItems: 'center' }}>
              <Typography variant="h6">react-fast-table</Typography>
            </Content>
          </Wrapper>
        </Toolbar>
      </AppBar>
      <Wrapper>
        <Content>
          <Sidebar>
            <Typography variant="h6">Guide</Typography>
            <SidebarTree articles={articles}></SidebarTree>
          </Sidebar>
          <Article>
            <Typography variant="h4" fontStyle={'bold'}>
              {meta.title}
            </Typography>
            <Main>{children}</Main>
          </Article>
        </Content>
      </Wrapper>
    </>
  );
}

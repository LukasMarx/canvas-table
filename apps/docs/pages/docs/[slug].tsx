import DocsLayout from '../../layout/DocsLayout';
import { getAllDocs, getDocBySlug } from '../../utils/Docs';
import markdownToHtml from '../../utils/Docs';
import { run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime.js';
import { Fragment, useEffect, useState } from 'react';
import { Table } from '@react-fast-table/core';
import BasicTable from '../../demos/BasicTable';
import H1 from '../../components/H1';
import H2 from '../../components/H2';
import H3 from '../../components/H3';
import ManyCells from '../../demos/ManyCells';
import Grouping from '../../demos/Grouping';
import Theming from '../../demos/Theming';
import Tree from '../../demos/Tree';
import ContextMenuDemo from 'apps/docs/demos/ContextMenu';
import QueryDemo from 'apps/docs/demos/Query';
import MoveableRows from 'apps/docs/demos/MoveableRows';

export default function Doc({ meta, content, docs }) {
  const [mdxModule, setMdxModule] = useState<any>();
  const Content = mdxModule ? mdxModule.default : null;

  useEffect(() => {
    (async () => {
      setMdxModule(await run(content, runtime));
    })();
  }, [content]);
  return (
    <DocsLayout articles={docs} meta={meta}>
      {Content && (
        <Content
          components={{
            BasicTable: BasicTable,
            h1: H1,
            h2: H2,
            h3: H3,
            ManyCells: ManyCells,
            Grouping: Grouping,
            Theming: Theming,
            Tree: Tree,
            ContextMenuDemo: ContextMenuDemo,
            QueryDemo: QueryDemo,
            MoveableRows: MoveableRows,
          }}
        />
      )}
    </DocsLayout>
  );
}

export async function getStaticProps({ params }) {
  const doc = getDocBySlug(params.slug);
  const content = await markdownToHtml(doc.content || '');
  const docs = getAllDocs();

  return {
    props: {
      ...doc,
      docs,
      content,
    },
  };
}

export async function getStaticPaths() {
  const docs = getAllDocs();

  return {
    paths: docs.map((doc) => {
      return {
        params: {
          slug: doc.slug,
        },
      };
    }),
    fallback: false,
  };
}

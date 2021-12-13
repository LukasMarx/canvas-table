import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import fg from 'fast-glob';
import getConfig from 'next/config';
const { serverRuntimeConfig } = getConfig();
import { compile } from '@mdx-js/mdx';

export function getDocBySlug(slug) {
  const realSlug = slug.replace(/\.mdx$/, '');
  const docsDirectory = join(serverRuntimeConfig.PROJECT_ROOT, 'docs');
  const fullPath = join(docsDirectory, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return { slug: realSlug, meta: data, content };
}

export default async function markdownToHtml(markdown) {
  const code = String(
    await compile(markdown, {
      outputFormat: 'function-body' /* …otherOptions */,
    })
  );
  return code;
}

export function getAllDocs() {
  const files = fg.sync('docs/**/*.mdx', {
    cwd: serverRuntimeConfig.PROJECT_ROOT,
    onlyFiles: true,
  });
  const result: { slug: string; meta: any; content: any }[] = [];
  for (const fileName of files) {
    const realSlug = fileName.replace(/\.mdx$/, '').replace(/^docs\//, '');
    const fileContents = fs.readFileSync(
      join(serverRuntimeConfig.PROJECT_ROOT, fileName),
      'utf8'
    );
    const { data, content } = matter(fileContents);
    result.push({
      slug: realSlug,
      meta: data,
      content,
    });
  }
  return result;
}

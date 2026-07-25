import BlogSidebar from '@theme/BlogSidebar';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { Props } from '@theme/BlogLayout';
import Layout from '@theme/Layout';

export default function BlogLayout(props: Props): ReactNode {
  const { sidebar, toc, children, ...layoutProps } = props;
  const hasSidebar = sidebar && sidebar.items.length > 0;

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        <div className="row">
          <main
            className={clsx('col', {
              'col--7': hasSidebar,
              'col--9 col--offset-1': !hasSidebar,
            })}
          >
            {children}
          </main>
          <BlogSidebar sidebar={sidebar} />
          {toc && <div className="col col--2">{toc}</div>}
        </div>
      </div>
    </Layout>
  );
}

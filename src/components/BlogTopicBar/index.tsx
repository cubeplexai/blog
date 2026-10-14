import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx';
import type { ReactNode } from 'react';

type Topic = {
  label: string;
  permalink: string;
  tagKey: string;
};

const EN_TOPICS: Topic[] = [
  { label: 'Agent Architecture', permalink: '/tags/agent-architecture', tagKey: 'agent-architecture' },
  { label: 'Managed Agents', permalink: '/tags/managed-agents', tagKey: 'managed-agents' },
  { label: 'Sandboxes', permalink: '/tags/sandbox', tagKey: 'sandbox' },
  { label: 'Agent Workspace', permalink: '/tags/agent-workspace', tagKey: 'agent-workspace' },
  { label: 'Open Source', permalink: '/tags/open-source', tagKey: 'open-source' },
  { label: 'Self-hosting', permalink: '/tags/self-hosting', tagKey: 'self-hosting' },
];

const ZH_TOPICS: Topic[] = [
  { label: 'Agent 架构', permalink: '/tags/agent-架构', tagKey: 'agent-架构' },
  { label: 'Managed Agents', permalink: '/tags/managed-agents', tagKey: 'managed-agents' },
  { label: '沙箱', permalink: '/tags/沙箱', tagKey: '沙箱' },
  { label: 'Agent Workspace', permalink: '/tags/agent-workspace', tagKey: 'agent-workspace' },
  { label: '开源', permalink: '/tags/开源', tagKey: '开源' },
  { label: '自托管', permalink: '/tags/自托管', tagKey: '自托管' },
];

type Props = {
  currentTag?: string;
};

export default function BlogTopicBar({ currentTag }: Props): ReactNode {
  const { i18n } = useDocusaurusContext();
  const isZh = i18n.currentLocale === 'zh-Hans';
  const topics = isZh ? ZH_TOPICS : EN_TOPICS;
  const isAllActive = !currentTag;

  return (
    <nav className="blog-topic-bar" aria-label="Topic filter">
      <div className="blog-topic-bar__inner">
        <div className="blog-topic-bar__chips">
          <Link
            to="/"
            className={clsx('blog-topic-bar__chip', {
              'blog-topic-bar__chip--active': isAllActive,
            })}
          >
            <Translate id="blog.topicBar.allPosts">All Posts</Translate>
          </Link>

          {topics.map((topic) => {
            const isActive =
              currentTag &&
              (currentTag.toLowerCase() === topic.tagKey.toLowerCase() ||
                currentTag.toLowerCase() === topic.label.toLowerCase());

            return (
              <Link
                key={topic.permalink}
                to={topic.permalink}
                className={clsx('blog-topic-bar__chip', {
                  'blog-topic-bar__chip--active': isActive,
                })}
              >
                {topic.label}
              </Link>
            );
          })}
        </div>

        <Link to="/tags" className="blog-topic-bar__all-tags">
          <Translate id="blog.topicBar.allTags">View All Tags</Translate>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </nav>
  );
}

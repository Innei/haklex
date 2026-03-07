import { SiGithub, SiTelegram, SiX, SiZhihu } from '@icons-pack/react-simple-icons';
import { createContext, use } from 'react';

import * as styles from './styles.css';

export interface MentionRendererProps {
  displayName?: string;
  handle: string;
  platform: string;
}

export interface MentionPlatformMeta {
  getUrl: (handle: string) => string;
  icon: React.ReactNode;
  label: string;
}

const ExtraPlatformContext = createContext<Record<string, MentionPlatformMeta>>({});

export function MentionPlatformProvider({
  platforms,
  children,
}: {
  platforms: Record<string, MentionPlatformMeta>;
  children: React.ReactNode;
}) {
  return <ExtraPlatformContext value={platforms}>{children}</ExtraPlatformContext>;
}

export function useExtraPlatforms() {
  return use(ExtraPlatformContext);
}

const GitHubIcon = (
  <SiGithub
    className={`${styles.mentionIconGitHub} ${styles.semanticClassNames.mentionIconGitHub}`}
    size="1em"
  />
);
const TwitterIcon = <SiX color="#1DA1F2" size="1em" />;
const TelegramIcon = <SiTelegram color="#2AABEE" size="1em" />;
const ZhihuIcon = <SiZhihu color="#0084FF" size="1em" />;

export const platformMetaMap: Record<string, MentionPlatformMeta> = {
  GH: {
    label: 'GitHub',
    icon: GitHubIcon,
    getUrl: (handle) => `https://github.com/${encodeURIComponent(handle)}`,
  },
  TW: {
    label: 'Twitter',
    icon: TwitterIcon,
    getUrl: (handle) => `https://twitter.com/${encodeURIComponent(handle)}`,
  },
  TG: {
    label: 'Telegram',
    icon: TelegramIcon,
    getUrl: (handle) => `https://t.me/${encodeURIComponent(handle)}`,
  },
  ZH: {
    label: 'Zhihu',
    icon: ZhihuIcon,
    getUrl: (handle) => `https://www.zhihu.com/people/${encodeURIComponent(handle)}`,
  },
};

export const platformKeys = Object.keys(platformMetaMap);

export function MentionRenderer({ platform, handle, displayName }: MentionRendererProps) {
  const extraPlatforms = useExtraPlatforms();
  const normalizedHandle = handle.replace(/^@+/, '');
  const meta = platformMetaMap[platform] ?? extraPlatforms[platform];
  const label = displayName || normalizedHandle;

  if (meta) {
    return (
      <span className={`${styles.mention} ${styles.semanticClassNames.mention}`}>
        <span
          aria-hidden
          className={`${styles.mentionIcon} ${styles.semanticClassNames.mentionIcon}`}
        >
          {meta.icon}
        </span>
        <a
          className={`${styles.mentionHandle} ${styles.semanticClassNames.mentionHandle}`}
          href={meta.getUrl(normalizedHandle)}
          rel="noopener noreferrer"
          target="_blank"
        >
          {label}
        </a>
      </span>
    );
  }

  return (
    <span
      className={`${styles.mention} ${styles.semanticClassNames.mention} ${styles.mentionPlain} ${styles.semanticClassNames.mentionPlain}`}
    >
      <span className={`${styles.mentionHandle} ${styles.semanticClassNames.mentionHandle}`}>
        @{label}
      </span>
    </span>
  );
}

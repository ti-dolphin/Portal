import ReactMarkdown, { Options } from 'react-markdown';
// markdown plugins
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
// @mui
import { styled } from '@mui/material/styles';
import { Link, Typography, Divider } from '@mui/material';
//
import Image from './Image';

// ----------------------------------------------------------------------

const MarkdownStyle = styled('div')(({ theme }) => {
  const isLight = theme.palette.mode === 'light';

  return {
    wordBreak: 'break-word',
    // List
    '& ul, & ol': {
      ...theme.typography.body1,
      paddingLeft: theme.spacing(5),
      '& li': {
        lineHeight: 2,
      },
    },

    // Blockquote
    '& blockquote': {
      lineHeight: 1.5,
      fontSize: '1.5em',
      margin: '40px auto',
      position: 'relative',
      fontFamily: 'Georgia, serif',
      padding: theme.spacing(3, 3, 3, 8),
      borderRadius: Number(theme.shape.borderRadius) * 2,
      backgroundColor: theme.palette.background.neutral,
      color: `${theme.palette.text.secondary} !important`,
      [theme.breakpoints.up('md')]: {
        width: '80%',
      },
      '& p, & span': {
        marginBottom: '0 !important',
        fontSize: 'inherit !important',
        fontFamily: 'Georgia, serif !important',
        color: `${theme.palette.text.secondary} !important`,
      },
      '&:before': {
        left: 16,
        top: -8,
        display: 'block',
        fontSize: '3em',
        content: '"\\201C"',
        position: 'absolute',
        color: theme.palette.text.disabled,
      },
    },

    // Code Block
    '& pre, & pre > code': {
      fontSize: 16,
      overflowX: 'auto',
      whiteSpace: 'pre',
      padding: theme.spacing(2),
      color: theme.palette.common.white,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: isLight ? theme.palette.grey[900] : theme.palette.grey[500_16],
    },
    '& code': {
      fontSize: 14,
      borderRadius: 4,
      whiteSpace: 'pre',
      padding: theme.spacing(0.2, 0.5),
      color: theme.palette.warning[isLight ? 'darker' : 'lighter'],
      backgroundColor: theme.palette.warning[isLight ? 'lighter' : 'darker'],
      '&.hljs': { padding: 0, backgroundColor: 'transparent' },
    },
  };
});

// ----------------------------------------------------------------------

export default function Markdown({ simple, linkable, children, ...other }: Options) {
  const formattedContent = linkable ? formatLinks(children) : children;

  return (
    <MarkdownStyle>
      <ReactMarkdown rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]} components={simple ? componentsTypeBody : components} children={formattedContent} {...other} />
    </MarkdownStyle>
  );
}

// ----------------------------------------------------------------------

const schema = {
  tagNames: ['a'],
  attributes: {
    a: ['href', 'target', 'onClick']
  }
}

function formatLinks(text: string) {
  const urlPattern = /(https?:\/\/[^\s,]+|www\.[^\s,]+)/g;
  const htmlTagPattern = /<[^>]*>/g;

  return text.replace(urlPattern, (url) => {
    let cleanUrl = url.replace(htmlTagPattern, '');

    if (cleanUrl.startsWith('www.')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    if (cleanUrl.includes('target="_blank"')) {
      return `<a href="${cleanUrl}" target="_blank" onClick="event.stopPropagation()">${cleanUrl}</a>`;
    }

    return url;
  });
}




const components = {
  h1: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} variant="h1" {...props} />,
  h2: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} variant="h2" {...props} />,
  h3: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} variant="h3" {...props} />,
  h4: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} variant="h4" {...props} />,
  h5: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} variant="h5" {...props} />,
  h6: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} variant="h6" {...props} />,
  hr: ({ ...props }) => <Divider sx={{ my: 3 }} {...props} />,
  img: ({ ...props }) => (
    <Image alt={props.alt} ratio="16/9" sx={{ borderRadius: 2, my: 5 }} {...props} />
  ),
  a: ({ ...props }) =>
    props.href.includes('http') ? (
      <Link target="_blank" rel="noopener" {...props} />
    ) : (
        <Link {...props}>{props.children}</Link>
    ),
};

const componentsTypeBody = {
  h1: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} {...props} />,
  h2: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} {...props} />,
  h3: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} {...props} />,
  h4: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} {...props} />,
  h5: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} {...props} />,
  h6: ({ ...props }) => <Typography sx={{ wordBreak:'break-word' }} {...props} />,
  hr: ({ ...props }) => <Divider sx={{ my: 3 }} {...props} />,
  img: ({ ...props }) => (
    <Image alt={props.alt} ratio="16/9" sx={{ borderRadius: 2, my: 5 }} {...props} />
  ),
  a: ({ ...props }) =>
    props.href.includes('http') ? (
      <Link target="_blank" rel="noopener" {...props} />
    ) : (
        <Link {...props}>{props.children}</Link>
    ),
};

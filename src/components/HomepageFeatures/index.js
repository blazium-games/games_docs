import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Store pages',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    to: '/docs/graphical_assets_guidelines',
    description: (
      <>
        Publish games, applications, mods, and assets on blazium.games, with
        guidelines for every image on your page.
      </>
    ),
  },
  {
    title: 'MCP and Cursor plugin',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    to: '/docs/mcp',
    description: (
      <>
        Let an AI agent manage your pages, builds, analytics, and keys through
        the hosted MCP server or the official Cursor plugin.
      </>
    ),
  },
  {
    title: 'Deploys and crashes',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    to: '/docs/deploy',
    description: (
      <>
        Ship builds from CI with blazium-cli and collect crash reports, dumps,
        and events from your players.
      </>
    ),
  },
];

function Feature({Svg, title, description, to}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">
          <Link to={to}>{title}</Link>
        </Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

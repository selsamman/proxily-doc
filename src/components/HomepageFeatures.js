import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Unopinionated',
    Svg: require('../../static/img/a.svg').default,
    description: (
      <>
       Structure your application to suit your problem domain rather than your state manager.  Proxily has virtually no constraints on your design.
      </>
    ),
  },
  {
    title: 'Everything in the Box',
    Svg: require('../../static/img/b.svg').default,
    description: (
      <>
        <ul style={{textAlign: "left"}}>
            <li> Serialization & Persistence</li>
            <li> Redux-sagas, Redux-devtools</li>
            <li> Time travel, undo/redo</li>
            <li> Transactions (commit & rollback)</li>
         </ul>
      </>
    ),
  },
  {
    title: 'Easy to Learn',
    Svg: require('../../static/img/c.svg').default,
    description: (
      <>
        With no specific requirements on how to define state and logic, Proxily is easy to work with.  Your code will be straight forward, easy to follow and easy to test.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
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

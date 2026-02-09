import React from 'react';
import { Differ, Viewer } from 'json-diff-kit';
import { JSONTree } from 'react-json-tree';
import 'json-diff-kit/dist/viewer.css';
import theme from 'react-base16-styling/src/themes/bright';

interface DiffCandidate {
  title: string;
  data: unknown;
}

interface JSONViewerProps {
  data: unknown;
  helpText: string;
  diffCandidates: DiffCandidate[];
}

const JSONViewer: React.FC<JSONViewerProps> = ({ data, helpText, diffCandidates }) => {
  const [diffsEnabled, setDiffsEnabled] = React.useState<string[]>([]);

  const toggleDiff = (name: string) => {
    if (diffsEnabled.includes(name)) {
      setDiffsEnabled(diffsEnabled.toSpliced(diffsEnabled.indexOf(name), 1));
    } else {
      setDiffsEnabled([...diffsEnabled, name]);
    }
  };

  const differ = new Differ({
    detectCircular: true,
    maxDepth: Infinity,
    showModifications: false,
    arrayDiffMethod: 'lcs',
    preserveKeyOrder: 'before'
  });

  return (
    <>
      {diffCandidates?.map((candidate) => (
        <React.Fragment key={candidate.title}>
          <input
            type={'checkbox'}
            checked={diffsEnabled.includes(candidate.title)}
            onChange={() => toggleDiff(candidate.title)}
          />
          Show Diff with {candidate.title}
        </React.Fragment>
      ))}
      <h5 className={'help'}>{helpText}</h5>
      <JSONTree data={data} theme={theme} invertTheme={true} />
      {diffsEnabled.map((diff) => {
        return (
          <div className={'diff'}>
            <h4>Diff with {diff}</h4>
            <Viewer
              diff={differ.diff(data, diffCandidates.find((x) => x.title === diff)?.data)}
              indent={2}
              lineNumbers={true}
              highlightInlineDiff={true}
            />
          </div>
        );
      })}
    </>
  );
};

export default JSONViewer;

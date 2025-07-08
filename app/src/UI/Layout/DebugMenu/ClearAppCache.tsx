import { PersistorContext } from 'utils/PersistorContext';

const ClearAppCache = () => (
  <PersistorContext.Consumer>
    {(persistor) => (
      <button
        onClick={() => {
          if (persistor) {
            persistor.purge().then(() => {
              window.location.reload();
            });
          } else {
            window.location.reload();
          }
        }}
      >
        Clear App Cache
      </button>
    )}
  </PersistorContext.Consumer>
);

export default ClearAppCache;

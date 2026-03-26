import { FieldValues, Path } from 'react-hook-form';

export const useFieldPath = <
  T extends FieldValues,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends string = any
>(
  basePath: P & Path<T>
) => {
  return {
    getPath: <S extends string>(subPath: S): Path<T> => {
      return `${basePath}.${subPath}` as Path<T>;
    },
    basePath: basePath as Path<T>
  };
};

export default useFieldPath;

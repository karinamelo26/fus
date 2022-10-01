import { MethodActionEnum } from './method-action.enum';

type ActionCheck = (path: string) => boolean;
interface Check {
  key: MethodActionEnum;
  check: ActionCheck;
}

const checks: Check[] = [
  { key: MethodActionEnum.GET, check: (path) => /^get/.test(path) },
  { key: MethodActionEnum.PERSIST, check: (path) => /^(update|add)/.test(path) },
  { key: MethodActionEnum.DELETE, check: (path) => /^(remove|delete)/.test(path) },
  { key: MethodActionEnum.ACTION, check: () => true },
];

export function fromPathToMethodAction(path: string): MethodActionEnum {
  return checks.find(({ check }) => check(path))!.key;
}

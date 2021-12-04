import { IFormatter } from "./IFormatter";
import { StringFormatter } from "./StringFormatter";

export const formatters: Record<
  string,
  {
    new (): IFormatter<any>;
  }
> = {
  default: StringFormatter,
};

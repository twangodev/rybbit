import NumberFlow from "@number-flow/react";
import { round } from "lodash";
import { SquareArrowOutUpRight } from "lucide-react";
import { ReactNode } from "react";
import { SingleColResponse } from "../../../../../api/analytics/useSingleCol";
import {
  addFilter,
  FilterParameter,
  removeFilter,
  useStore,
} from "../../../../../lib/store";

export const Row = ({
  e,
  ratio,
  getKey,
  getLabel,
  getValue,
  getLink,
  filterParameter,
}: {
  e: SingleColResponse;
  ratio: number;
  getKey: (item: SingleColResponse) => string;
  getLabel: (item: SingleColResponse) => ReactNode;
  getValue: (item: SingleColResponse) => string;
  getLink?: (item: SingleColResponse) => string;
  filterParameter: FilterParameter;
}) => {
  const filters = useStore((state) => state.filters);

  return (
    <div
      key={getKey(e)}
      className="relative h-6 flex items-center cursor-pointer hover:bg-neutral-850 group"
      onClick={() => {
        const foundFilter = filters.find(
          (f) =>
            f.parameter === filterParameter &&
            f.value.some((v) => v === getValue(e))
        );
        if (foundFilter) {
          removeFilter(foundFilter);
        } else {
          addFilter({
            parameter: filterParameter,
            value: [getValue(e)],
            type: "equals",
          });
        }
      }}
    >
      <div
        className="absolute inset-0 bg-dataviz py-2 opacity-25 rounded-md"
        style={{ width: `${e.percentage * ratio}%` }}
      ></div>
      <div className="z-10 mx-2 flex justify-between items-center text-xs w-full">
        <div className="flex items-center gap-1">
          {getLabel(e)}
          {getLink && (
            <a
              href={getLink(e)}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              <SquareArrowOutUpRight
                className="w-3 h-3 text-neutral-300 hover:text-neutral-100"
                strokeWidth={3}
              />
            </a>
          )}
        </div>
        <div className="text-xs flex gap-2">
          <div className="hidden group-hover:block text-neutral-400">
            {round(e.percentage, 1)}%
          </div>
          <NumberFlow
            respectMotionPreference={false}
            value={e.count}
            format={{ notation: "compact" }}
          />
        </div>
      </div>
    </div>
  );
};

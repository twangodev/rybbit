import NumberFlow from "@number-flow/react";
import { round } from "lodash";
import { ChevronDown, ChevronRight, SquareArrowOutUpRight } from "lucide-react";
import { ReactNode, useState } from "react";
import { usePaginatedSingleCol } from "../../../../../api/analytics/usePaginatedSingleCol";
import { SingleColResponse } from "../../../../../api/analytics/useSingleCol";
import {
  addFilter,
  FilterParameter,
  removeFilter,
  useStore,
} from "../../../../../lib/store";

const Subrows = ({
  getKey,
  getValue,
  getLink,
  filterParameter,
  filterValue,
  getSubrowLabel,
}: {
  getKey: (item: SingleColResponse) => string;
  getValue: (item: SingleColResponse) => string;
  getLink?: (item: SingleColResponse) => string;
  filterParameter: FilterParameter;
  filterValue: string;
  getSubrowLabel?: (item: SingleColResponse) => ReactNode;
}) => {
  const filters = useStore((state) => state.filters);

  const parameter = (filterParameter + "_version") as FilterParameter;

  const { data, isLoading, isFetching } = usePaginatedSingleCol({
    parameter,
    limit: 10,
    page: 1,
    additionalFilters: [
      {
        parameter: filterParameter,
        value: [filterValue],
        type: "equals",
      },
    ],
  });

  const itemsForDisplay = data?.data;

  const ratio = itemsForDisplay?.[0]?.percentage
    ? 100 / itemsForDisplay[0].percentage
    : 1;

  if (isLoading || isFetching) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 pl-2 pt-2">
      {itemsForDisplay?.map((e) => (
        <div
          key={getKey(e)}
          className="relative h-6 flex items-center cursor-pointer hover:bg-neutral-850 group"
          onClick={() => {
            const foundFilter = filters.find(
              (f) =>
                f.parameter === parameter &&
                f.value.some((v) => v === getValue(e))
            );
            if (foundFilter) {
              removeFilter(foundFilter);
            } else {
              addFilter({
                parameter,
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
              {getSubrowLabel?.(e)}
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
      ))}
    </div>
  );
};

export const Row = ({
  e,
  ratio,
  getKey,
  getLabel,
  getValue,
  getLink,
  filterParameter,
  getSubrowLabel,
  hasSubrow,
}: {
  e: SingleColResponse;
  ratio: number;
  getKey: (item: SingleColResponse) => string;
  getLabel: (item: SingleColResponse) => ReactNode;
  getValue: (item: SingleColResponse) => string;
  getLink?: (item: SingleColResponse) => string;
  filterParameter: FilterParameter;
  getSubrowLabel?: (item: SingleColResponse) => ReactNode;
  hasSubrow?: boolean;
}) => {
  const filters = useStore((state) => state.filters);
  const [expanded, setExpanded] = useState(false);

  const Icon = expanded ? ChevronDown : ChevronRight;

  return (
    <div className="flex flex-col">
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
            {hasSubrow && (
              <Icon
                className="w-4 h-4 text-neutral-400 hover:text-neutral-100"
                strokeWidth={3}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((prev) => !prev);
                }}
              />
            )}
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
      {hasSubrow && expanded && (
        <Subrows
          getKey={getKey}
          getValue={getValue}
          filterParameter={filterParameter}
          filterValue={getValue(e)}
          getSubrowLabel={getSubrowLabel}
        />
      )}
    </div>
  );
};

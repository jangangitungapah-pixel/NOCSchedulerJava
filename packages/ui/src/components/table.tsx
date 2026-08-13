import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';

import { cn } from '../lib/cn';

export function TableWrap({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('ui-table-wrap', className)} />;
}

export const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  function Table({ className, ...props }, ref) {
    return <table {...props} ref={ref} className={cn('ui-table', className)} />;
  },
);

export const TableHead = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHead(props, ref) {
  return <thead {...props} ref={ref} />;
});

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBody(props, ref) {
  return <tbody {...props} ref={ref} />;
});

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function TableRow(props, ref) {
    return <tr {...props} ref={ref} />;
  },
);

export const TableHeaderCell = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(function TableHeaderCell(props, ref) {
  return <th {...props} ref={ref} />;
});

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  function TableCell(props, ref) {
    return <td {...props} ref={ref} />;
  },
);

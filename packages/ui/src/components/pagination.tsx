import { Button } from './button';

export type PaginationProps = Readonly<{
  onNext?: () => void;
  onPrevious?: () => void;
  page: number;
  pageCount: number;
}>;

export function Pagination({ onNext, onPrevious, page, pageCount }: PaginationProps) {
  const previousDisabled = page <= 1;
  const nextDisabled = page >= pageCount;

  return (
    <nav aria-label="Pagination" className="ui-pagination">
      <span className="ui-pagination__meta">
        Page <span className="ui-tabular">{page}</span> of{' '}
        <span className="ui-tabular">{pageCount}</span>
      </span>
      <div className="ui-pagination__actions">
        <Button disabled={previousDisabled} onClick={onPrevious} size="sm" variant="secondary">
          Previous
        </Button>
        <Button disabled={nextDisabled} onClick={onNext} size="sm" variant="secondary">
          Next
        </Button>
      </div>
    </nav>
  );
}

import {
  Badge,
  Button,
  Card,
  Checkbox,
  Combobox,
  DateInput,
  Dialog,
  DialogCloseButton,
  DropdownMenu,
  EmptyState,
  ErrorState,
  FormField,
  IconButton,
  InfoIcon,
  Input,
  LoadingState,
  PageHeader,
  PageShell,
  Pagination,
  Popover,
  RadioGroup,
  SearchIcon,
  SectionHeader,
  Select,
  Sheet,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrap,
  Tabs,
  Textarea,
  toast,
  Toolbar,
  Tooltip,
} from '@nocscheduler/ui';
import { useState } from 'react';

const selectOptions = [
  { label: 'Shift 1 · Morning', value: 's1' },
  { label: 'Shift 2 · Afternoon', value: 's2' },
  { label: 'Shift 3 · Night', value: 's3' },
] as const;

const employeeOptions = [
  { label: 'Alya Putri', value: 'Alya Putri' },
  { label: 'Bima Aditya', value: 'Bima Aditya' },
  { label: 'Dimas Kurnia', value: 'Dimas Kurnia' },
] as const;

export function DesignSystemPage() {
  const [page, setPage] = useState(1);

  return (
    <PageShell width="workspace">
      <PageHeader
        description="Internal QA surface for semantic tokens, component states, keyboard interaction, responsive composition, Light/Dark parity, and mobile touch geometry."
        eyebrow="Design system QA"
        title="Primitive showcase"
        actions={
          <Button onClick={() => toast.success('Design-system toast is working.')}>
            Test toast
          </Button>
        }
      />

      <section style={{ display: 'grid', gap: '0.75rem' }}>
        <SectionHeader
          description="Primary, secondary, ghost, tonal, destructive, icon, disabled, and loading states."
          title="Actions"
        />
        <Card>
          <Toolbar aria-label="Button variants">
            <Button variant="primary">Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="tonal">Tonal</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
            <Button loading loadingLabel="Saving">
              Save
            </Button>
            <Tooltip content="Search schedule">
              <IconButton
                aria-label="Search schedule"
                icon={<SearchIcon size={18} />}
                variant="secondary"
              />
            </Tooltip>
          </Toolbar>
        </Card>
      </section>

      <section style={{ display: 'grid', gap: '0.75rem' }}>
        <SectionHeader
          description="Shared field height, border, radius, focus, helper, error, and disabled grammar."
          title="Forms"
        />
        <Card>
          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
            }}
          >
            <FormField
              helperText="Use a concise operational name."
              htmlFor="qa-schedule-name"
              label="Schedule name"
              required
            >
              <Input id="qa-schedule-name" placeholder="August roster" />
            </FormField>
            <FormField label="Shift">
              <Select ariaLabel="Select shift" options={selectOptions} placeholder="Choose shift" />
            </FormField>
            <FormField
              helperText="Searchable baseline uses native datalist semantics."
              htmlFor="qa-employee"
              label="Employee"
            >
              <Combobox id="qa-employee" options={employeeOptions} placeholder="Search employee" />
            </FormField>
            <FormField htmlFor="qa-effective-date" label="Effective date">
              <DateInput id="qa-effective-date" />
            </FormField>
            <FormField
              error="This sample shows the canonical error treatment."
              htmlFor="qa-validation"
              label="Validation"
            >
              <Input aria-invalid="true" defaultValue="Invalid sample" id="qa-validation" />
            </FormField>
            <FormField htmlFor="qa-notes" label="Notes">
              <Textarea id="qa-notes" placeholder="Operational note…" />
            </FormField>
          </div>
        </Card>
      </section>

      <section style={{ display: 'grid', gap: '0.75rem' }}>
        <SectionHeader title="Choices & status" />
        <Card>
          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))',
            }}
          >
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <Checkbox defaultChecked label="Include night shift" />
              <Switch defaultChecked label="Auto publish notifications" />
            </div>
            <RadioGroup
              ariaLabel="Schedule view"
              defaultValue="week"
              options={[
                { label: 'Week', value: 'week' },
                { label: 'Month', value: 'month' },
              ]}
            />
            <div
              style={{ alignContent: 'start', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
            >
              <Badge variant="neutral">Neutral</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
            </div>
          </div>
        </Card>
      </section>

      <section style={{ display: 'grid', gap: '0.75rem' }}>
        <SectionHeader
          description="Radix-backed overlay primitives retain keyboard/focus behavior."
          title="Overlays & disclosure"
        />
        <Card>
          <Toolbar aria-label="Overlay primitives">
            <Popover
              content={
                <p
                  style={{
                    color: 'var(--ui-text-secondary)',
                    fontSize: 'var(--ui-text-body)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Popovers provide concise context without navigating away from the current task.
                </p>
              }
            >
              <Button variant="secondary">Popover</Button>
            </Popover>

            <DropdownMenu
              items={[
                { label: 'Duplicate schedule' },
                { label: 'Export preview' },
                { danger: true, label: 'Delete draft', separatorBefore: true },
              ]}
              trigger={<Button variant="secondary">Menu</Button>}
            />

            <Dialog
              description="Dialog geometry adapts to compact mobile screens while preserving focus trapping."
              footer={<DialogCloseButton>Done</DialogCloseButton>}
              title="Review change"
              trigger={<Button variant="secondary">Dialog</Button>}
            >
              <p
                style={{
                  color: 'var(--ui-text-secondary)',
                  fontSize: 'var(--ui-text-body)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Critical workflow confirmation will use this shared spatial grammar rather than
                page-specific modal styling.
              </p>
            </Dialog>

            <Sheet
              description="Sheet becomes the preferred mobile disclosure surface for contextual detail."
              side="bottom"
              title="Context sheet"
              trigger={<Button variant="secondary">Bottom sheet</Button>}
            >
              <p
                style={{
                  color: 'var(--ui-text-secondary)',
                  fontSize: 'var(--ui-text-body)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Safe-area padding is included at the component layer.
              </p>
            </Sheet>
          </Toolbar>
        </Card>
      </section>

      <section style={{ display: 'grid', gap: '0.75rem' }}>
        <SectionHeader title="Tabs & table" />
        <Card>
          <Tabs
            defaultValue="table"
            items={[
              {
                label: 'Table',
                value: 'table',
                content: (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <TableWrap aria-label="Schedule preview table">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableHeaderCell>Employee</TableHeaderCell>
                            <TableHeaderCell>Shift</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Alya Putri</TableCell>
                            <TableCell>S1 · 07:00–15:00</TableCell>
                            <TableCell>
                              <Badge variant="success">Published</Badge>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Bima Aditya</TableCell>
                            <TableCell>S3 · 23:00–07:00</TableCell>
                            <TableCell>
                              <Badge variant="warning">Draft</Badge>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableWrap>
                    <Pagination
                      onNext={() => setPage((value) => Math.min(3, value + 1))}
                      onPrevious={() => setPage((value) => Math.max(1, value - 1))}
                      page={page}
                      pageCount={3}
                    />
                  </div>
                ),
              },
              {
                label: 'States',
                value: 'states',
                content: (
                  <div
                    style={{
                      display: 'grid',
                      gap: '0.75rem',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
                    }}
                  >
                    <EmptyState
                      description="No schedule matches the active filter."
                      title="No results"
                    />
                    <ErrorState
                      description="The server rejected this example request."
                      title="Unable to load"
                    />
                    <LoadingState />
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </section>

      <section style={{ display: 'grid', gap: '0.75rem' }}>
        <SectionHeader title="Loading geometry" />
        <Card>
          <div style={{ display: 'grid', gap: '0.5rem', maxWidth: '30rem' }}>
            <Skeleton style={{ height: '1rem', width: '38%' }} />
            <Skeleton style={{ height: '0.75rem', width: '100%' }} />
            <Skeleton style={{ height: '0.75rem', width: '76%' }} />
          </div>
        </Card>
      </section>

      <Card elevation="sunken">
        <div style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
          <InfoIcon aria-hidden="true" size={18} />
          <p
            style={{
              color: 'var(--ui-text-secondary)',
              fontSize: 'var(--ui-text-caption)',
              margin: 0,
            }}
          >
            This page is development-only and exists as the WP-F03 QA surface.
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
